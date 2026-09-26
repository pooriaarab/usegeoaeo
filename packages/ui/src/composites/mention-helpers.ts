import { cn } from "../utils";
import type { MentionCategory, MentionEntity } from "./mention-textarea";

export const CATEGORY_LABELS: Record<MentionCategory, string> = {
  agent: "Agents",
  flow: "Flows",
  template: "Templates",
  tool: "Tools",
};

export const CATEGORY_ORDER: MentionCategory[] = ["agent", "flow", "template", "tool"];

export const MENTION_REGEX = /@(agent|flow|template|tool):([a-z0-9][a-z0-9-]*)/g;
export const URL_REGEX = /https?:\/\/[^\s)>\]]+/g;

export type Segment =
  | { type: "text"; content: string }
  | { type: "mention"; category: MentionCategory; name: string }
  | { type: "url"; url: string };

function collectMentionTokens(text: string) {
  type Token = { index: number; length: number; kind: "mention" | "url"; data: unknown };
  const tokens: Token[] = [];
  const mentionRe = new RegExp(MENTION_REGEX.source, "g");
  let m: RegExpExecArray | null;
  while ((m = mentionRe.exec(text)) !== null) {
    tokens.push({
      index: m.index,
      length: m[0].length,
      kind: "mention",
      data: { category: m[1] as MentionCategory, name: m[2] },
    });
  }
  return tokens;
}

function collectUrlTokens(text: string, tokens: { index: number; length: number }[]) {
  const urlRe = new RegExp(URL_REGEX.source, "g");
  let m: RegExpExecArray | null;
  while ((m = urlRe.exec(text)) !== null) {
    if (!m) continue;
    const idx = m.index;
    const overlaps = tokens.some((t) => idx >= t.index && idx < t.index + t.length);
    if (!overlaps)
      tokens.push({
        index: idx,
        length: m[0].length,
        kind: "url" as const,
        data: { url: m[0] },
      } as never);
  }
}

function tokensToSegments(
  text: string,
  tokens: { index: number; length: number; kind: string; data: unknown }[],
) {
  tokens.sort((a, b) => a.index - b.index);
  const segments: Segment[] = [];
  let lastIndex = 0;
  for (const token of tokens) {
    if (token.index > lastIndex)
      segments.push({ type: "text", content: text.slice(lastIndex, token.index) });
    if (token.kind === "mention") {
      const { category, name } = token.data as { category: MentionCategory; name: string };
      segments.push({ type: "mention", category, name });
    } else {
      const { url } = token.data as { url: string };
      segments.push({ type: "url", url });
    }
    lastIndex = token.index + token.length;
  }
  if (lastIndex < text.length) segments.push({ type: "text", content: text.slice(lastIndex) });
  return segments;
}

/** Parse raw text into an ordered list of text / mention / url segments */
export function parseSegments(text: string): Segment[] {
  const tokens = collectMentionTokens(text) as unknown as {
    index: number;
    length: number;
    kind: string;
    data: unknown;
  }[];
  collectUrlTokens(text, tokens);
  return tokensToSegments(text, tokens);
}

export function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function appendTextNode(text: string, el: string): string {
  return text + el.replace(/\u200B/g, "");
}

function handleElementNode(node: HTMLElement, text: string): string {
  if (node.dataset.mentionCategory && node.dataset.mentionName)
    return text + `@${node.dataset.mentionCategory}:${node.dataset.mentionName}`;
  if (node.dataset.urlValue) return text + node.dataset.urlValue;
  if (node.tagName === "BR") return text + "\n";
  if (node.tagName === "DIV" || node.tagName === "P") {
    const separator = text.length > 0 && !text.endsWith("\n") ? "\n" : "";
    return text + separator + extractRawText(node);
  }
  return text;
}

/** Walk DOM children and extract the raw text value with @category:name tokens */
export function extractRawText(el: HTMLElement): string {
  let text = "";
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) text = appendTextNode(text, node.textContent ?? "");
    else if (node instanceof HTMLElement) text = handleElementNode(node, text);
  }
  return text;
}

function appendAvatarIcon(span: HTMLSpanElement, entity: MentionEntity) {
  const px = 14;
  const avatarUrl = entity.avatarUrl;
  if (!avatarUrl) throw new Error("Missing avatarUrl");
  const img = document.createElement("img");
  img.src = avatarUrl;
  img.alt = "";
  img.width = px;
  img.height = px;
  img.className = "rounded-full object-cover shrink-0";
  img.style.cssText = `width:${px}px;height:${px}px`;
  span.appendChild(img);
}

function appendEmojiIcon(span: HTMLSpanElement, emoji: string) {
  const em = document.createElement("span");
  em.className = "shrink-0 leading-none";
  em.textContent = emoji;
  span.appendChild(em);
}

function appendInitialIcon(span: HTMLSpanElement, entity: MentionEntity | undefined) {
  const px = 14;
  const initial = document.createElement("span");
  initial.className = cn(
    "shrink-0 rounded-full flex items-center justify-center text-white font-medium",
    entity?.avatarColor || "bg-muted-foreground/50",
  );
  initial.style.cssText = `width:${px}px;height:${px}px;font-size:${Math.round(px * 0.55)}px`;
  initial.textContent = entity?.displayName?.charAt(0).toUpperCase() ?? "?";
  span.appendChild(initial);
}

function appendFallbackIcon(span: HTMLSpanElement, entity: MentionEntity | undefined) {
  if (entity?.avatarUrl) appendAvatarIcon(span, entity);
  else if (entity?.emoji) appendEmojiIcon(span, entity.emoji);
  else appendInitialIcon(span, entity);
}

/** Build a non-editable mention badge DOM element */
export function buildMentionNode(
  category: MentionCategory,
  name: string,
  entities: MentionEntity[],
  iconBuilder?: (entity: MentionEntity) => HTMLElement | null,
): HTMLSpanElement {
  const entity = entities.find((e) => e.category === category && e.name === name);
  const span = document.createElement("span");
  span.contentEditable = "false";
  span.dataset.mentionCategory = category;
  span.dataset.mentionName = name;
  span.className =
    "inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap align-baseline cursor-default";
  const customIcon = entity && iconBuilder ? iconBuilder(entity) : null;
  if (customIcon) span.appendChild(customIcon);
  else appendFallbackIcon(span, entity);
  const label = document.createElement("span");
  label.textContent = entity?.displayName ?? name;
  span.appendChild(label);
  return span;
}

/** Build a non-editable URL badge DOM element */
export function buildUrlNode(url: string): HTMLSpanElement {
  const domain = extractDomain(url);
  const span = document.createElement("span");
  span.contentEditable = "false";
  span.dataset.urlValue = url;
  span.className =
    "inline-flex items-center gap-1 bg-muted text-foreground border border-border rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap align-baseline cursor-default";
  if (domain) {
    const img = document.createElement("img");
    img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
    img.alt = "";
    img.width = 14;
    img.height = 14;
    img.className = "shrink-0 rounded-sm";
    span.appendChild(img);
  }
  const label = document.createElement("span");
  label.className = "max-w-[200px] truncate";
  label.textContent = domain || url;
  span.appendChild(label);
  return span;
}

/** Render parsed segments into a contentEditable element */
export function renderSegmentsToDOM(
  el: HTMLDivElement,
  segments: Segment[],
  entities: MentionEntity[],
  iconBuilder?: (entity: MentionEntity) => HTMLElement | null,
) {
  el.innerHTML = "";
  for (const seg of segments) {
    if (seg.type === "text") {
      const lines = seg.content.split("\n");
      lines.forEach((line, i) => {
        if (i > 0) el.appendChild(document.createElement("br"));
        if (line) el.appendChild(document.createTextNode(line));
      });
    } else if (seg.type === "mention") {
      el.appendChild(buildMentionNode(seg.category, seg.name, entities, iconBuilder));
    } else {
      el.appendChild(buildUrlNode(seg.url));
    }
  }
  const last = el.lastChild;
  if (
    last &&
    last instanceof HTMLElement &&
    (last.dataset.mentionCategory || last.dataset.urlValue)
  ) {
    el.appendChild(document.createTextNode("\u200B"));
  }
}

export function filterEntities(
  showDropdown: boolean,
  mentionFilter: string,
  mentionCategory: MentionCategory | null,
  entities: MentionEntity[],
): MentionEntity[] {
  if (!showDropdown) return [];
  const q = mentionFilter.toLowerCase();
  if (mentionCategory) {
    return entities
      .filter(
        (e) =>
          e.category === mentionCategory &&
          (e.displayName.toLowerCase().includes(q) || e.name.toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }
  const filtered = entities.filter(
    (e) =>
      e.displayName.toLowerCase().includes(q) ||
      e.name.toLowerCase().includes(q) ||
      e.category.includes(q),
  );
  const grouped: MentionEntity[] = [];
  for (const cat of CATEGORY_ORDER) {
    const catItems = filtered.filter((e) => e.category === cat).slice(0, 4);
    grouped.push(...catItems);
  }
  return grouped.slice(0, 10);
}

export function groupEntities(filteredEntities: MentionEntity[]) {
  const groups: { category: MentionCategory; items: MentionEntity[] }[] = [];
  let currentCat: MentionCategory | null = null;
  let currentItems: MentionEntity[] = [];
  for (const entity of filteredEntities) {
    if (entity.category !== currentCat) {
      if (currentCat !== null && currentItems.length > 0)
        groups.push({ category: currentCat, items: currentItems });
      currentCat = entity.category;
      currentItems = [entity];
    } else currentItems.push(entity);
  }
  if (currentCat !== null && currentItems.length > 0)
    groups.push({ category: currentCat, items: currentItems });
  return groups;
}
