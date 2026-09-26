import type { MentionCategory, MentionEntity } from "./mention-textarea";
import { CATEGORY_ORDER, buildMentionNode, extractRawText } from "./mention-helpers";

function isTriggerAtWordBoundary(beforeCursor: string, lastAt: number): boolean {
  if (lastAt === 0) return true;
  return beforeCursor[lastAt - 1] === " " || beforeCursor[lastAt - 1] === "\n";
}

function parseTriggerCategory(afterAt: string) {
  const colonIdx = afterAt.indexOf(":");
  if (colonIdx === -1)
    return { category: null as MentionCategory | null, filter: afterAt, valid: true };
  const prefix = afterAt.slice(0, colonIdx) as MentionCategory;
  if (CATEGORY_ORDER.includes(prefix))
    return { category: prefix, filter: afterAt.slice(colonIdx + 1), valid: true };
  return { category: null, filter: "", valid: false };
}

function getSelectionInfo() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !sel.focusNode) return null;
  return { sel, focusNode: sel.focusNode, focusOffset: sel.focusOffset };
}

function shouldShowTrigger(beforeCursor: string, lastAt: number, afterAt: string): boolean {
  if (lastAt === -1) return false;
  if (!isTriggerAtWordBoundary(beforeCursor, lastAt)) return false;
  if (afterAt.includes(" ") || afterAt.includes("\n")) return false;
  return parseTriggerCategory(afterAt).valid;
}

export function doDetectTrigger(opts: {
  setShowDropdown: (v: boolean) => void;
  setMentionCategory: (v: MentionCategory | null) => void;
  setMentionFilter: (v: string) => void;
  setSelectedIndex: (v: number) => void;
  triggerNode: React.MutableRefObject<Text | null>;
  triggerOffset: React.MutableRefObject<number>;
}) {
  const info = getSelectionInfo();
  if (!info) {
    opts.setShowDropdown(false);
    return;
  }
  if (info.focusNode.nodeType !== Node.TEXT_NODE) {
    opts.setShowDropdown(false);
    return;
  }
  const text = info.focusNode.textContent ?? "";
  const beforeCursor = text.slice(0, info.focusOffset);
  const lastAt = beforeCursor.lastIndexOf("@");
  const afterAt = beforeCursor.slice(lastAt + 1);
  if (!shouldShowTrigger(beforeCursor, lastAt, afterAt)) {
    opts.setShowDropdown(false);
    return;
  }
  const parsed = parseTriggerCategory(afterAt);
  opts.setMentionCategory(parsed.category);
  opts.setMentionFilter(parsed.filter);
  opts.triggerNode.current = info.focusNode as Text;
  opts.triggerOffset.current = lastAt;
  opts.setShowDropdown(true);
  opts.setSelectedIndex(0);
}

function canInsert(opts: {
  editor: HTMLDivElement | null;
  textNode: Text | null;
  atOffset: number;
}): boolean {
  if (!opts.editor || !opts.textNode || opts.atOffset < 0) return false;
  return opts.editor.contains(opts.textNode);
}

function prepareInsertRange(textNode: Text, atOffset: number, cursorOffset: number) {
  const fullText = textNode.textContent ?? "";
  return { before: fullText.slice(0, atOffset), after: fullText.slice(cursorOffset), fullText };
}

function placeMentionNodes(opts: {
  parent: Node;
  assertNode: Text;
  before: string;
  after: string;
  entity: MentionEntity;
  entities: MentionEntity[];
  renderEntityIconDOM?: (e: MentionEntity) => HTMLElement | null;
}) {
  if (opts.before) opts.parent.insertBefore(document.createTextNode(opts.before), opts.assertNode);
  const mentionSpan = buildMentionNode(
    opts.entity.category,
    opts.entity.name,
    opts.entities,
    opts.renderEntityIconDOM,
  );
  opts.parent.insertBefore(mentionSpan, opts.assertNode);
  const afterTextNode = document.createTextNode(" " + opts.after);
  opts.parent.insertBefore(afterTextNode, opts.assertNode);
  opts.parent.removeChild(opts.assertNode);
  return afterTextNode;
}

function finishMentionInsert(opts: {
  editor: HTMLDivElement;
  lastExtractedValue: React.MutableRefObject<string>;
  setIsEmpty: (v: boolean) => void;
  onChange: (v: string) => void;
  setShowDropdown: (v: boolean) => void;
  setMentionCategory: (v: MentionCategory | null) => void;
  setMentionFilter: (v: string) => void;
  setSelectedIndex: (v: number) => void;
  triggerNode: React.MutableRefObject<Text | null>;
  triggerOffset: React.MutableRefObject<number>;
}) {
  const rawText = extractRawText(opts.editor);
  opts.lastExtractedValue.current = rawText;
  opts.setIsEmpty(!rawText);
  opts.onChange(rawText);
  opts.setShowDropdown(false);
  opts.setMentionCategory(null);
  opts.setMentionFilter("");
  opts.setSelectedIndex(0);
  opts.triggerNode.current = null;
  opts.triggerOffset.current = -1;
}

export function doInsertMention(opts: {
  entity: MentionEntity;
  editorRef: React.RefObject<HTMLDivElement | null>;
  triggerNode: React.MutableRefObject<Text | null>;
  triggerOffset: React.MutableRefObject<number>;
  entities: MentionEntity[];
  renderEntityIconDOM?: (e: MentionEntity) => HTMLElement | null;
  lastExtractedValue: React.MutableRefObject<string>;
  setIsEmpty: (v: boolean) => void;
  onChange: (v: string) => void;
  setShowDropdown: (v: boolean) => void;
  setMentionCategory: (v: MentionCategory | null) => void;
  setMentionFilter: (v: string) => void;
  setSelectedIndex: (v: number) => void;
}) {
  const editor = opts.editorRef.current;
  const textNode = opts.triggerNode.current;
  const atOffset = opts.triggerOffset.current;
  if (!canInsert({ editor, textNode, atOffset })) return;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const assertEditor = editor as HTMLDivElement;
  const assertNode = textNode as Text;
  const cursorOffset =
    sel.focusNode === assertNode ? sel.focusOffset : (assertNode.textContent?.length ?? 0);
  const { before, after } = prepareInsertRange(assertNode, atOffset, cursorOffset);
  const parent = assertNode.parentNode;
  if (!parent) throw new Error("Mention insert: detached node");
  const afterTextNode = placeMentionNodes({
    parent,
    assertNode,
    before,
    after,
    entity: opts.entity,
    entities: opts.entities,
    renderEntityIconDOM: opts.renderEntityIconDOM,
  });
  const range = document.createRange();
  range.setStart(afterTextNode, 1);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  finishMentionInsert({ ...opts, editor: assertEditor });
}

export function handleDropdownNav(opts: {
  e: React.KeyboardEvent<HTMLDivElement>;
  showDropdown: boolean;
  filtered: MentionEntity[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  insert: (e: MentionEntity) => void;
  setShowDropdown: (v: boolean) => void;
}): boolean {
  if (!opts.showDropdown || opts.filtered.length === 0) return false;
  const key = opts.e.key;
  if (key === "ArrowDown") {
    opts.e.preventDefault();
    opts.setSelectedIndex((i) => Math.min(i + 1, opts.filtered.length - 1));
    return true;
  }
  if (key === "ArrowUp") {
    opts.e.preventDefault();
    opts.setSelectedIndex((i) => Math.max(i - 1, 0));
    return true;
  }
  if (key === "Enter" || key === "Tab") {
    opts.e.preventDefault();
    opts.insert(opts.filtered[opts.selectedIndex]);
    return true;
  }
  if (key === "Escape") {
    opts.e.preventDefault();
    opts.setShowDropdown(false);
    return true;
  }
  return false;
}

function isPlainEnter(e: React.KeyboardEvent<HTMLDivElement>, showDropdown: boolean): boolean {
  return e.key === "Enter" && !e.metaKey && !e.ctrlKey && !e.shiftKey && !showDropdown;
}

export function handleBrInsert(
  e: React.KeyboardEvent<HTMLDivElement>,
  showDropdown: boolean,
  onInput: () => void,
): boolean {
  if (!isPlainEnter(e, showDropdown)) return false;
  e.preventDefault();
  insertBrAtSelection();
  onInput();
  return true;
}

function insertBrAtSelection() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const br = document.createElement("br");
  range.insertNode(br);
  if (!br.nextSibling || br.nextSibling instanceof HTMLBRElement) {
    const trailing = document.createElement("br");
    br.parentNode?.insertBefore(trailing, br.nextSibling);
  }
  range.setStartAfter(br);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}
