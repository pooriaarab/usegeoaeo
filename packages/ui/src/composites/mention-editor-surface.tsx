'use client';

import { cn } from '../utils';

function EditorAttributes({
  hasSuggestions,
  activeDescendantId,
  ariaLabel,
}: {
  hasSuggestions: boolean;
  activeDescendantId?: string;
  ariaLabel?: string;
}) {
  return {
    'aria-label': ariaLabel,
    'aria-expanded': hasSuggestions,
    'aria-controls': hasSuggestions ? 'mention-listbox' : undefined,
    'aria-activedescendant': activeDescendantId,
    role: 'textbox' as const,
    'aria-multiline': 'true' as const,
    'aria-autocomplete': 'list' as const,
  };
}

function EditorBoxInner(props: {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onInput: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
  onClick: () => void;
  onBlur: () => void;
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
  hasSuggestions: boolean;
  activeDescendantId?: string;
  ariaLabel?: string;
  className?: string;
  minRows: number;
  maxHeight: number;
}) {
  const attrs = EditorAttributes({
    hasSuggestions: props.hasSuggestions,
    activeDescendantId: props.activeDescendantId,
    ariaLabel: props.ariaLabel,
  });
  return (
    <div
      ref={props.editorRef}
      contentEditable
      suppressContentEditableWarning
      onInput={props.onInput}
      onKeyDown={props.onKeyDown}
      onPaste={props.onPaste}
      onClick={props.onClick}
      onBlur={props.onBlur}
      onCompositionStart={props.onCompositionStart}
      onCompositionEnd={props.onCompositionEnd}
      aria-label={attrs['aria-label']}
      aria-expanded={attrs['aria-expanded']}
      aria-controls={attrs['aria-controls']}
      aria-activedescendant={attrs['aria-activedescendant']}
      role={attrs.role}
      aria-multiline={attrs['aria-multiline']}
      aria-autocomplete={attrs['aria-autocomplete']}
      className={cn(
        'w-full bg-transparent text-sm outline-none overflow-y-auto',
        'px-3 py-2 whitespace-pre-wrap break-words',
        props.className,
      )}
      style={{ minHeight: `${props.minRows * 1.5 + 1}em`, maxHeight: `${props.maxHeight}px` }}
    />
  );
}

export function MentionEditorSurface(props: {
  editorRef: React.RefObject<HTMLDivElement | null>;
  onInput: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
  onClick: () => void;
  onBlur: () => void;
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
  ariaLabel?: string;
  hasSuggestions: boolean;
  activeDescendantId?: string;
  className?: string;
  minRows: number;
  maxHeight: number;
}) {
  return <EditorBoxInner {...props} />;
}

export function PlaceholderOverlay({ placeholder }: { placeholder?: string }) {
  if (!placeholder) return null;
  return (
    <div
      className="absolute inset-0 pointer-events-none text-sm text-muted-foreground/50 px-3 py-2 whitespace-pre-wrap"
      aria-hidden="true"
    >
      {placeholder}
    </div>
  );
}

export function LiveRegion({ hasSuggestions, count }: { hasSuggestions: boolean; count: number }) {
  return (
    <div className="sr-only" aria-live="polite" role="status">
      {hasSuggestions ? `${count} mention suggestions available` : ''}
    </div>
  );
}
