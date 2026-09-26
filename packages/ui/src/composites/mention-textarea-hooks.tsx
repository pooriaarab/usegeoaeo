"use client";

import { useCallback } from "react";
import { extractRawText } from "./mention-helpers";
import {
  doDetectTrigger,
  doInsertMention,
  handleDropdownNav,
  handleBrInsert,
} from "./mention-actions";
import type { MentionEntity } from "./mention-textarea";

function useDetectTrigger(opts: {
  setShowDropdown: (v: boolean) => void;
  setMentionCategory: (v: MentionEntity["category"] | null) => void;
  setMentionFilter: (v: string) => void;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  mentionTriggerNode: React.MutableRefObject<Text | null>;
  mentionTriggerOffset: React.MutableRefObject<number>;
}) {
  return useCallback(() => {
    doDetectTrigger({
      setShowDropdown: opts.setShowDropdown,
      setMentionCategory: opts.setMentionCategory,
      setMentionFilter: opts.setMentionFilter,
      setSelectedIndex: opts.setSelectedIndex,
      triggerNode: opts.mentionTriggerNode,
      triggerOffset: opts.mentionTriggerOffset,
    });
  }, [
    opts.setShowDropdown,
    opts.setMentionCategory,
    opts.setMentionFilter,
    opts.setSelectedIndex,
    opts.mentionTriggerNode,
    opts.mentionTriggerOffset,
  ]);
}

function useInsertMention(opts: {
  editorRef: React.RefObject<HTMLDivElement | null>;
  mentionTriggerNode: React.MutableRefObject<Text | null>;
  mentionTriggerOffset: React.MutableRefObject<number>;
  entities: MentionEntity[];
  renderEntityIconDOM?: (e: MentionEntity) => HTMLElement | null;
  lastExtractedValue: React.MutableRefObject<string>;
  setIsEmpty: (v: boolean) => void;
  onChange: (v: string) => void;
  setShowDropdown: (v: boolean) => void;
  setMentionCategory: (v: MentionEntity["category"] | null) => void;
  setMentionFilter: (v: string) => void;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  return useCallback(
    (entity: MentionEntity) => {
      doInsertMention({
        entity,
        editorRef: opts.editorRef,
        triggerNode: opts.mentionTriggerNode,
        triggerOffset: opts.mentionTriggerOffset,
        entities: opts.entities,
        renderEntityIconDOM: opts.renderEntityIconDOM,
        lastExtractedValue: opts.lastExtractedValue,
        setIsEmpty: opts.setIsEmpty,
        onChange: opts.onChange,
        setShowDropdown: opts.setShowDropdown,
        setMentionCategory: opts.setMentionCategory,
        setMentionFilter: opts.setMentionFilter,
        setSelectedIndex: opts.setSelectedIndex,
      });
    },
    [
      opts.editorRef,
      opts.mentionTriggerNode,
      opts.mentionTriggerOffset,
      opts.entities,
      opts.renderEntityIconDOM,
      opts.lastExtractedValue,
      opts.setIsEmpty,
      opts.onChange,
      opts.setShowDropdown,
      opts.setMentionCategory,
      opts.setMentionFilter,
      opts.setSelectedIndex,
    ],
  );
}

function useHandleInput(opts: {
  editorRef: React.RefObject<HTMLDivElement | null>;
  isComposing: React.MutableRefObject<boolean>;
  lastExtractedValue: React.MutableRefObject<string>;
  setIsEmpty: (v: boolean) => void;
  onChange: (v: string) => void;
  detect: () => void;
}) {
  return useCallback(() => {
    const editor = opts.editorRef.current;
    if (!editor || opts.isComposing.current) return;
    const rawText = extractRawText(editor);
    if (rawText === opts.lastExtractedValue.current) {
      opts.detect();
      return;
    }
    opts.lastExtractedValue.current = rawText;
    opts.setIsEmpty(!rawText);
    opts.onChange(rawText);
    opts.detect();
  }, [
    opts.editorRef,
    opts.isComposing,
    opts.lastExtractedValue,
    opts.setIsEmpty,
    opts.onChange,
    opts.detect,
  ]);
}

function useHandleKeyDown(opts: {
  showDropdown: boolean;
  filteredEntities: MentionEntity[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  insertMention: (e: MentionEntity) => void;
  setShowDropdown: (v: boolean) => void;
  handleInput: () => void;
  externalKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
}) {
  return useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (
        handleDropdownNav({
          e,
          showDropdown: opts.showDropdown,
          filtered: opts.filteredEntities,
          selectedIndex: opts.selectedIndex,
          setSelectedIndex: opts.setSelectedIndex,
          insert: opts.insertMention,
          setShowDropdown: opts.setShowDropdown,
        })
      )
        return;
      if (handleBrInsert(e, opts.showDropdown, opts.handleInput)) return;
      opts.externalKeyDown?.(e as React.KeyboardEvent<HTMLElement>);
    },
    [
      opts.showDropdown,
      opts.filteredEntities,
      opts.selectedIndex,
      opts.setSelectedIndex,
      opts.insertMention,
      opts.setShowDropdown,
      opts.handleInput,
      opts.externalKeyDown,
    ],
  );
}

function useHandlePaste(handleInput: () => void) {
  return useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
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
}

function useMentionCore(opts: {
  editorRef: React.RefObject<HTMLDivElement | null>;
  isComposing: React.MutableRefObject<boolean>;
  lastExtractedValue: React.MutableRefObject<string>;
  setIsEmpty: (v: boolean) => void;
  onChange: (v: string) => void;
  setShowDropdown: (v: boolean) => void;
  setMentionCategory: (v: MentionEntity["category"] | null) => void;
  setMentionFilter: (v: string) => void;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  mentionTriggerNode: React.MutableRefObject<Text | null>;
  mentionTriggerOffset: React.MutableRefObject<number>;
  entities: MentionEntity[];
  renderEntityIconDOM?: (e: MentionEntity) => HTMLElement | null;
}) {
  const detectMentionTrigger = useDetectTrigger({
    setShowDropdown: opts.setShowDropdown,
    setMentionCategory: opts.setMentionCategory,
    setMentionFilter: opts.setMentionFilter,
    setSelectedIndex: opts.setSelectedIndex,
    mentionTriggerNode: opts.mentionTriggerNode,
    mentionTriggerOffset: opts.mentionTriggerOffset,
  });
  const handleInput = useHandleInput({
    editorRef: opts.editorRef,
    isComposing: opts.isComposing,
    lastExtractedValue: opts.lastExtractedValue,
    setIsEmpty: opts.setIsEmpty,
    onChange: opts.onChange,
    detect: detectMentionTrigger,
  });
  const insertMention = useInsertMention({
    editorRef: opts.editorRef,
    mentionTriggerNode: opts.mentionTriggerNode,
    mentionTriggerOffset: opts.mentionTriggerOffset,
    entities: opts.entities,
    renderEntityIconDOM: opts.renderEntityIconDOM,
    lastExtractedValue: opts.lastExtractedValue,
    setIsEmpty: opts.setIsEmpty,
    onChange: opts.onChange,
    setShowDropdown: opts.setShowDropdown,
    setMentionCategory: opts.setMentionCategory,
    setMentionFilter: opts.setMentionFilter,
    setSelectedIndex: opts.setSelectedIndex,
  });
  return { detectMentionTrigger, handleInput, insertMention };
}

function useMentionInteractions(opts: {
  showDropdown: boolean;
  filteredEntities: MentionEntity[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  insertMention: (e: MentionEntity) => void;
  setShowDropdown: (v: boolean) => void;
  handleInput: () => void;
  externalKeyDown: ((e: React.KeyboardEvent<HTMLElement>) => void) | undefined;
  detectMentionTrigger: () => void;
}) {
  const handleKeyDown = useHandleKeyDown({
    showDropdown: opts.showDropdown,
    filteredEntities: opts.filteredEntities,
    selectedIndex: opts.selectedIndex,
    setSelectedIndex: opts.setSelectedIndex,
    insertMention: opts.insertMention,
    setShowDropdown: opts.setShowDropdown,
    handleInput: opts.handleInput,
    externalKeyDown: opts.externalKeyDown,
  });
  const handlePaste = useHandlePaste(opts.handleInput);
  const handleClick = useCallback(() => {
    opts.detectMentionTrigger();
  }, [opts.detectMentionTrigger]);
  const handleBlur = useCallback(() => {
    setTimeout(() => opts.setShowDropdown(false), 150);
  }, [opts.setShowDropdown]);
  return { handleKeyDown, handlePaste, handleClick, handleBlur };
}

export function useMentionCallbacks(opts: {
  editorRef: React.RefObject<HTMLDivElement | null>;
  isComposing: React.MutableRefObject<boolean>;
  lastExtractedValue: React.MutableRefObject<string>;
  setIsEmpty: (v: boolean) => void;
  onChange: (v: string) => void;
  showDropdown: boolean;
  filteredEntities: MentionEntity[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  setShowDropdown: (v: boolean) => void;
  entities: MentionEntity[];
  renderEntityIconDOM?: (e: MentionEntity) => HTMLElement | null;
  mentionTriggerNode: React.MutableRefObject<Text | null>;
  mentionTriggerOffset: React.MutableRefObject<number>;
  setMentionCategory: (v: MentionEntity["category"] | null) => void;
  setMentionFilter: (v: string) => void;
  externalKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
}) {
  const core = useMentionCore(opts);
  const interactions = useMentionInteractions({
    showDropdown: opts.showDropdown,
    filteredEntities: opts.filteredEntities,
    selectedIndex: opts.selectedIndex,
    setSelectedIndex: opts.setSelectedIndex,
    insertMention: core.insertMention,
    setShowDropdown: opts.setShowDropdown,
    handleInput: core.handleInput,
    externalKeyDown: opts.externalKeyDown,
    detectMentionTrigger: core.detectMentionTrigger,
  });
  return {
    detectMentionTrigger: core.detectMentionTrigger,
    handleInput: core.handleInput,
    insertMention: core.insertMention,
    handleKeyDown: interactions.handleKeyDown,
    handlePaste: interactions.handlePaste,
    handleClick: interactions.handleClick,
    handleBlur: interactions.handleBlur,
  };
}
