'use client';

import { useEffect, useMemo } from 'react';
import { parseSegments, renderSegmentsToDOM, filterEntities, groupEntities } from './mention-helpers';
import type { MentionEntity } from './mention-textarea';

export function useSyncEditor(opts: {
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

export function useDropdownScroll(
  showDropdown: boolean,
  selectedIndex: number,
  ref: React.RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!showDropdown || !ref.current) return;
    ref.current.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [showDropdown, selectedIndex, ref]);
}

export function getActiveId(showDropdown: boolean, filtered: MentionEntity[], idx: number): string | undefined {
  if (!showDropdown || filtered.length === 0 || idx >= filtered.length) return undefined;
  const e = filtered[idx];
  return `mention-option-${e.category}-${e.id}`;
}

export function useMentionDerived(opts: {
  showDropdown: boolean;
  mentionFilter: string;
  mentionCategory: MentionEntity['category'] | null;
  entities: MentionEntity[];
  selectedIndex: number;
}) {
  const filteredEntities = useMemo(
    () => filterEntities(opts.showDropdown, opts.mentionFilter, opts.mentionCategory, opts.entities),
    [opts.showDropdown, opts.mentionFilter, opts.mentionCategory, opts.entities],
  );
  const groupedEntities = useMemo(() => groupEntities(filteredEntities), [filteredEntities]);
  const activeDescendantId = useMemo(
    () => getActiveId(opts.showDropdown, filteredEntities, opts.selectedIndex),
    [opts.showDropdown, filteredEntities, opts.selectedIndex],
  );
  const hasSuggestions = opts.showDropdown && filteredEntities.length > 0;
  return { filteredEntities, groupedEntities, activeDescendantId, hasSuggestions };
}
