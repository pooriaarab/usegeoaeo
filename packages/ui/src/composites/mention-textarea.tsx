/**
 * MentionTextarea — contentEditable div with @ mention support
 */

'use client';

import { useState, useCallback, useRef, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { cn } from '../utils';
import {
  CATEGORY_LABELS,
  parseSegments,
  extractRawText,
  renderSegmentsToDOM,
  filterEntities,
  groupEntities,
} from './mention-helpers';
import { doDetectTrigger, doInsertMention, handleDropdownNav, handleBrInsert } from './mention-actions';

export type MentionCategory = 'agent' | 'flow' | 'template' | 'tool';
export interface MentionEntity {
  category: MentionCategory;
  id: string;
  name: string;
  displayName: string;
  emoji?: string;
  avatarUrl?: string;
  avatarColor?: string;
}
export interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  entities: MentionEntity[];
  placeholder?: string;
  'aria-label'?: string;
  className?: string;
  minRows?: number;
  maxHeight?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  renderEntityIcon?: (entity: MentionEntity, size: 'sm' | 'md') => React.ReactNode;
  renderEntityIconDOM?: (entity: MentionEntity) => HTMLElement | null;
}
export interface MentionTextareaRef {
  focus: () => void;
  textarea: HTMLTextAreaElement | null;
}

function DefaultEntityIcon({ entity, size }: { entity: MentionEntity; size: 'sm' | 'md' }) {
  const px = size === 'sm' ? 14 : 18;
  if (entity.avatarUrl)
    return (
      <img
        src={entity.avatarUrl}
        alt=""
        width={px}
        height={px}
        className="rounded-full object-cover shrink-0"
        style={{ width: px, height: px }}
      />
    );
  if (entity.emoji) return <span className="shrink-0 leading-none">{entity.emoji}</span>;
  const initial = entity.displayName?.charAt(0).toUpperCase() ?? '?';
  return (
    <span
      className={cn(
        'shrink-0 rounded-full flex items-center justify-center text-white font-medium',
        entity.avatarColor || 'bg-muted-foreground/50',
      )}
      style={{ width: px, height: px, fontSize: px * 0.55 }}
    >
      {initial}
    </span>
  );
}

function MentionDropdown({
  grouped,
  selectedIndex,
  onSelect,
  renderEntityIcon,
  dropdownRef,
}: {
  grouped: { category: MentionCategory; items: MentionEntity[] }[];
  selectedIndex: number;
  onSelect: (e: MentionEntity) => void;
  renderEntityIcon?: (entity: MentionEntity, size: 'sm' | 'md') => React.ReactNode;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}) {
  let flatIndex = 0;
  return (
    <div
      ref={dropdownRef}
      id="mention-listbox"
      role="listbox"
      aria-label="Mention suggestions"
      className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-10 max-h-[240px] overflow-y-auto"
    >
      {grouped.map((group) => (
        <div key={group.category}>
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30">
            {CATEGORY_LABELS[group.category]}
          </div>
          {group.items.map((entity) => {
            const idx = flatIndex++;
            const optionId = `mention-option-${entity.category}-${entity.id}`;
            return (
              <button
                key={`${entity.category}:${entity.id}`}
                id={optionId}
                type="button"
                role="option"
                aria-selected={idx === selectedIndex}
                data-selected={idx === selectedIndex}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-muted/50 transition-colors',
                  idx === selectedIndex && 'bg-muted',
                )}
                onMouseDown={(ev) => {
                  ev.preventDefault();
                  onSelect(entity);
                }}
              >
                {renderEntityIcon ? renderEntityIcon(entity, 'md') : <DefaultEntityIcon entity={entity} size="md" />}
                <span className="font-medium truncate">{entity.displayName}</span>
                <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">{entity.name}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function useSyncEditor(opts: {
  value: string;
  entities: MentionEntity[];
  renderIconDOM?: (e: MentionEntity) => HTMLElement | null;
  editorRef: React.RefObject<HTMLDivElement | null>;
  lastVal: React.MutableRefObject<string>;
  hasRendered: React.MutableRefObject<boolean>;
  hasWithEntities: React.MutableRefObject<boolean>;
  setIsEmpty: (v: boolean) => void;
}) {
  useEffect(() => {
    const editor = opts.editorRef.current;
    if (!editor) return;
    const needsRender =
      !opts.hasRendered.current ||
      opts.value !== opts.lastVal.current ||
      (!opts.hasWithEntities.current && opts.entities.length > 0);
    if (!needsRender) return;
    opts.hasRendered.current = true;
    if (opts.entities.length > 0) opts.hasWithEntities.current = true;
    opts.lastVal.current = opts.value;
    renderSegmentsToDOM(editor, parseSegments(opts.value), opts.entities, opts.renderIconDOM);
    opts.setIsEmpty(!opts.value);
    const sel = window.getSelection();
    if (sel && document.activeElement === editor) {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [
    opts.value,
    opts.entities,
    opts.renderIconDOM,
    opts.editorRef,
    opts.hasRendered,
    opts.hasWithEntities,
    opts.lastVal,
    opts.setIsEmpty,
  ]);
}

function useDropdownScroll(showDropdown: boolean, selectedIndex: number, ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!showDropdown || !ref.current) return;
    ref.current.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [showDropdown, selectedIndex, ref]);
}

function getActiveId(showDropdown: boolean, filtered: MentionEntity[], idx: number): string | undefined {
  if (!showDropdown || filtered.length === 0 || idx >= filtered.length) return undefined;
  const e = filtered[idx];
  return `mention-option-${e.category}-${e.id}`;
}

export const MentionTextarea = forwardRef<MentionTextareaRef, MentionTextareaProps>(function MentionTextarea(
  {
    value,
    onChange,
    entities,
    placeholder,
    'aria-label': ariaLabel,
    className,
    minRows = 4,
    maxHeight = 300,
    onKeyDown: externalKeyDown,
    renderEntityIcon,
    renderEntityIconDOM,
  },
  ref,
) {
  const editorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastExtractedValue = useRef(value);
  const hasRendered = useRef(false);
  const hasRenderedWithEntities = useRef(false);
  const isComposing = useRef(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionCategory, setMentionCategory] = useState<MentionCategory | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isEmpty, setIsEmpty] = useState(!value);
  const mentionTriggerNode = useRef<Text | null>(null);
  const mentionTriggerOffset = useRef(-1);
  useImperativeHandle(ref, () => ({
    focus: () => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    },
    textarea: null,
  }));
  useSyncEditor({
    value,
    entities,
    renderIconDOM: renderEntityIconDOM,
    editorRef,
    lastVal: lastExtractedValue,
    hasRendered,
    hasWithEntities: hasRenderedWithEntities,
    setIsEmpty,
  });
  const detectMentionTrigger = useCallback(() => {
    doDetectTrigger({
      setShowDropdown,
      setMentionCategory,
      setMentionFilter,
      setSelectedIndex,
      triggerNode: mentionTriggerNode,
      triggerOffset: mentionTriggerOffset,
    });
  }, []);
  const handleInput = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || isComposing.current) return;
    const rawText = extractRawText(editor);
    if (rawText === lastExtractedValue.current) {
      detectMentionTrigger();
      return;
    }
    lastExtractedValue.current = rawText;
    setIsEmpty(!rawText);
    onChange(rawText);
    detectMentionTrigger();
  }, [onChange, detectMentionTrigger]);
  const filteredEntities = useMemo(
    () => filterEntities(showDropdown, mentionFilter, mentionCategory, entities),
    [showDropdown, mentionFilter, mentionCategory, entities],
  );
  const groupedEntities = useMemo(() => groupEntities(filteredEntities), [filteredEntities]);
  const insertMention = useCallback(
    (entity: MentionEntity) => {
      doInsertMention({
        entity,
        editorRef,
        triggerNode: mentionTriggerNode,
        triggerOffset: mentionTriggerOffset,
        entities,
        renderEntityIconDOM,
        lastExtractedValue,
        setIsEmpty,
        onChange,
        setShowDropdown,
        setMentionCategory,
        setMentionFilter,
        setSelectedIndex,
      });
    },
    [entities, onChange, renderEntityIconDOM],
  );
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (
        handleDropdownNav({
          e,
          showDropdown,
          filtered: filteredEntities,
          selectedIndex,
          setSelectedIndex,
          insert: insertMention,
          setShowDropdown,
        })
      )
        return;
      if (handleBrInsert(e, showDropdown, handleInput)) return;
      externalKeyDown?.(e as React.KeyboardEvent<HTMLElement>);
    },
    [showDropdown, filteredEntities, selectedIndex, insertMention, externalKeyDown, handleInput],
  );
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      handleInput();
    },
    [handleInput],
  );
  const handleClick = useCallback(() => {
    detectMentionTrigger();
  }, [detectMentionTrigger]);
  const handleBlur = useCallback(() => {
    setTimeout(() => setShowDropdown(false), 150);
  }, []);
  useDropdownScroll(showDropdown, selectedIndex, dropdownRef);
  const activeDescendantId = useMemo(
    () => getActiveId(showDropdown, filteredEntities, selectedIndex),
    [showDropdown, filteredEntities, selectedIndex],
  );
  const hasSuggestions = showDropdown && filteredEntities.length > 0;
  return (
    <div className="relative">
      {isEmpty && placeholder && (
        <div
          className="absolute inset-0 pointer-events-none text-sm text-muted-foreground/50 px-3 py-2 whitespace-pre-wrap"
          aria-hidden="true"
        >
          {placeholder}
        </div>
      )}
      <div className="sr-only" aria-live="polite" role="status">
        {hasSuggestions ? `${filteredEntities.length} mention suggestions available` : ''}
      </div>
      {hasSuggestions && (
        <MentionDropdown
          grouped={groupedEntities}
          selectedIndex={selectedIndex}
          onSelect={insertMention}
          renderEntityIcon={renderEntityIcon}
          dropdownRef={dropdownRef}
        />
      )}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onClick={handleClick}
        onBlur={handleBlur}
        onCompositionStart={() => {
          isComposing.current = true;
        }}
        onCompositionEnd={() => {
          isComposing.current = false;
          handleInput();
        }}
        aria-label={ariaLabel}
        aria-expanded={hasSuggestions}
        aria-controls={hasSuggestions ? 'mention-listbox' : undefined}
        aria-activedescendant={activeDescendantId}
        role="textbox"
        aria-multiline="true"
        aria-autocomplete="list"
        className={cn(
          'w-full bg-transparent text-sm outline-none overflow-y-auto px-3 py-2 whitespace-pre-wrap break-words',
          className,
        )}
        style={{ minHeight: `${minRows * 1.5 + 1}em`, maxHeight: `${maxHeight}px` }}
      />
    </div>
  );
});
