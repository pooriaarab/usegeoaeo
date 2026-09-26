"use client";

import { useState, useRef } from "react";
import type { MentionCategory } from "./mention-textarea";

export function useMentionState(initialValue: string) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [mentionCategory, setMentionCategory] = useState<MentionCategory | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isEmpty, setIsEmpty] = useState(!initialValue);
  const mentionTriggerNode = useRef<Text | null>(null);
  const mentionTriggerOffset = useRef(-1);
  return {
    showDropdown,
    setShowDropdown,
    mentionFilter,
    setMentionFilter,
    mentionCategory,
    setMentionCategory,
    selectedIndex,
    setSelectedIndex,
    isEmpty,
    setIsEmpty,
    mentionTriggerNode,
    mentionTriggerOffset,
  };
}

export function useMentionRefs(initialValue: string) {
  const editorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastExtractedValue = useRef(initialValue);
  const hasRendered = useRef(false);
  const hasRenderedWithEntities = useRef(false);
  const isComposing = useRef(false);
  return {
    editorRef,
    dropdownRef,
    lastExtractedValue,
    hasRendered,
    hasRenderedWithEntities,
    isComposing,
  };
}
