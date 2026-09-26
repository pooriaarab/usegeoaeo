/**
 * MentionTextarea — contentEditable div with @ mention support
 */

"use client";

import { forwardRef } from "react";
import { MentionDropdown } from "./mention-dropdown";
import { MentionEditorSurface, PlaceholderOverlay, LiveRegion } from "./mention-editor-surface";
import { useMentionContainer } from "./use-mention-container";

export type MentionCategory = "agent" | "flow" | "template" | "tool";
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
  "aria-label"?: string;
  className?: string;
  minRows?: number;
  maxHeight?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  renderEntityIcon?: (entity: MentionEntity, size: "sm" | "md") => React.ReactNode;
  renderEntityIconDOM?: (entity: MentionEntity) => HTMLElement | null;
}
export interface MentionTextareaRef {
  focus: () => void;
  textarea: HTMLTextAreaElement | null;
}

type MentionBodyProps = {
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  minRows: number;
  maxHeight: number;
  renderEntityIcon?: MentionTextareaProps["renderEntityIcon"];
  refs: ReturnType<typeof useMentionContainer>["refs"];
  state: ReturnType<typeof useMentionContainer>["state"];
  derived: ReturnType<typeof useMentionContainer>["derived"];
  cbs: ReturnType<typeof useMentionContainer>["cbs"];
};

function MentionTextareaBody({
  placeholder,
  ariaLabel,
  className,
  minRows,
  maxHeight,
  renderEntityIcon,
  refs,
  state,
  derived,
  cbs,
}: MentionBodyProps) {
  return (
    <div className="relative">
      {state.isEmpty && placeholder && <PlaceholderOverlay placeholder={placeholder} />}
      <LiveRegion hasSuggestions={derived.hasSuggestions} count={derived.filteredEntities.length} />
      {derived.hasSuggestions && (
        <MentionDropdown
          grouped={derived.groupedEntities}
          selectedIndex={state.selectedIndex}
          onSelect={cbs.insertMention}
          renderEntityIcon={renderEntityIcon}
          dropdownRef={refs.dropdownRef}
        />
      )}
      <MentionEditorSurface
        editorRef={refs.editorRef}
        onInput={cbs.handleInput}
        onKeyDown={cbs.handleKeyDown}
        onPaste={cbs.handlePaste}
        onClick={cbs.handleClick}
        onBlur={cbs.handleBlur}
        onCompositionStart={() => {
          refs.isComposing.current = true;
        }}
        onCompositionEnd={() => {
          refs.isComposing.current = false;
          cbs.handleInput();
        }}
        ariaLabel={ariaLabel}
        hasSuggestions={derived.hasSuggestions}
        activeDescendantId={derived.activeDescendantId}
        className={className}
        minRows={minRows}
        maxHeight={maxHeight}
      />
    </div>
  );
}

export const MentionTextarea = forwardRef<MentionTextareaRef, MentionTextareaProps>(
  function MentionTextarea(props, ref) {
    const { refs, state, derived, cbs } = useMentionContainer({
      value: props.value,
      entities: props.entities,
      renderEntityIconDOM: props.renderEntityIconDOM,
      onChange: props.onChange,
      externalKeyDown: props.onKeyDown,
      ref,
    });
    return (
      <MentionTextareaBody
        placeholder={props.placeholder}
        ariaLabel={props["aria-label"]}
        className={props.className}
        minRows={props.minRows ?? 4}
        maxHeight={props.maxHeight ?? 300}
        renderEntityIcon={props.renderEntityIcon}
        refs={refs}
        state={state}
        derived={derived}
        cbs={cbs}
      />
    );
  },
);
