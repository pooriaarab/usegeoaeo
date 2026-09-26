"use client";

import { useImperativeHandle } from "react";
import { useMentionState, useMentionRefs } from "./use-mention-state";
import { useSyncEditor, useDropdownScroll, useMentionDerived } from "./mention-sync-hooks";
import { useMentionCallbacks } from "./mention-textarea-hooks";
import type { MentionEntity } from "./mention-textarea";

export function useFocusHandle(
  ref: React.Ref<unknown>,
  editorRef: React.RefObject<HTMLDivElement | null>,
) {
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
}

export function useMentionContainer(opts: {
  value: string;
  entities: MentionEntity[];
  renderEntityIconDOM?: (e: MentionEntity) => HTMLElement | null;
  onChange: (v: string) => void;
  externalKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  ref: React.Ref<unknown>;
}) {
  const refs = useMentionRefs(opts.value);
  const state = useMentionState(opts.value);
  useFocusHandle(opts.ref, refs.editorRef);
  useSyncEditor({
    value: opts.value,
    entities: opts.entities,
    renderIconDOM: opts.renderEntityIconDOM,
    editorRef: refs.editorRef,
    lastVal: refs.lastExtractedValue,
    hasRendered: refs.hasRendered,
    hasWithEntities: refs.hasRenderedWithEntities,
    setIsEmpty: state.setIsEmpty,
  });
  const derived = useMentionDerived({
    showDropdown: state.showDropdown,
    mentionFilter: state.mentionFilter,
    mentionCategory: state.mentionCategory,
    entities: opts.entities,
    selectedIndex: state.selectedIndex,
  });
  const cbs = useMentionCallbacks({
    editorRef: refs.editorRef,
    isComposing: refs.isComposing,
    lastExtractedValue: refs.lastExtractedValue,
    setIsEmpty: state.setIsEmpty,
    onChange: opts.onChange,
    showDropdown: state.showDropdown,
    filteredEntities: derived.filteredEntities,
    selectedIndex: state.selectedIndex,
    setSelectedIndex: state.setSelectedIndex,
    setShowDropdown: state.setShowDropdown,
    entities: opts.entities,
    renderEntityIconDOM: opts.renderEntityIconDOM,
    mentionTriggerNode: state.mentionTriggerNode,
    mentionTriggerOffset: state.mentionTriggerOffset,
    setMentionCategory: state.setMentionCategory,
    setMentionFilter: state.setMentionFilter,
    externalKeyDown: opts.externalKeyDown,
  });
  useDropdownScroll(state.showDropdown, state.selectedIndex, refs.dropdownRef);
  return { refs, state, derived, cbs };
}
