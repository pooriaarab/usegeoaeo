import { readFile, writeFile } from "node:fs/promises";
import { applyVisibleRules } from "./humanize-rules.js";

export interface HumanizeFinding {
  rule: string;
  before: string;
  after: string;
}

export interface HumanizeResult {
  text: string;
  findings: HumanizeFinding[];
}

interface ApplyRuleOptions {
  text: string;
  findings: HumanizeFinding[];
  rule: string;
  pattern: RegExp;
  replacement: string | ((...matches: string[]) => string);
}

function applyRule(options: ApplyRuleOptions): string {
  const { text, findings, rule, pattern, replacement } = options;
  return text.replace(pattern, (...matches) => {
    const before = matches[0];
    const after =
      typeof replacement === "function"
        ? replacement(...matches)
        : before.replace(pattern, replacement);
    if (before !== after) findings.push({ rule, before, after });
    return after;
  });
}

function sentenceCaseHeading(heading: string): string {
  const words = heading.trim().split(/\s+/);
  if (words.length === 0) return heading;
  return words
    .map((word, index) => {
      if (/^[A-Z]{2,}\d*$/.test(word)) return word;
      const lower = word.toLowerCase();
      return index === 0 ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
    })
    .join(" ");
}

function rewriteHeadings(text: string, findings: HumanizeFinding[]): string {
  let output = applyRule({
    text,
    findings,
    rule: "sentence-case-heading",
    pattern: /^(#{1,6}\s+)([^\n]+)$/gm,
    replacement: (...matches) => {
      return `${matches[1]}${sentenceCaseHeading(matches[2])}`;
    },
  });
  output = applyRule({
    text: output,
    findings,
    rule: "sentence-case-heading",
    pattern: /(<h[1-6][^>]*>)([^<]+)(<\/h[1-6]>)/gi,
    replacement: (...matches) => {
      return `${matches[1]}${sentenceCaseHeading(matches[2])}${matches[3]}`;
    },
  });
  return output;
}

function protect(source: string): { masked: string; blocks: string[] } {
  const blocks: string[] = [];
  const masked = source.replace(
    /```[\s\S]*?```|`[^`\n]+`|<[^>]*>|\{(?:[^{}]|\{[^{}]*\})*\}|^[ \t]*(?:import|export|const|let|var|function|class|type|interface|return)\b[^\n]*$/gm,
    (block) => {
      const index = blocks.push(block) - 1;
      return `\u0000${index}\u0000`;
    },
  );
  return { masked, blocks };
}

function restore(masked: string, blocks: string[]): string {
  return masked.replace(/\u0000(\d+)\u0000/g, (_, index: string) => blocks[Number(index)]);
}

function transformVisible(text: string, findings: HumanizeFinding[]): string {
  const output = applyVisibleRules(text, findings, applyRule);
  const cleaned = output.replace(/[ \t]{2,}/g, " ").replace(/ +([,.!?])/g, "$1");
  // Re-capitalize the first word when a leading filler removal left it lowercase.
  return cleaned.replace(/^(\s*)([a-z])/, (_m, ws, ch) => ws + ch.toUpperCase());
}

export function humanizeText(text: string): HumanizeResult {
  const findings: HumanizeFinding[] = [];
  const headed = rewriteHeadings(text, findings);
  const protectedText = protect(headed);
  const transformed = transformVisible(protectedText.masked, findings);
  return { text: restore(transformed, protectedText.blocks), findings };
}

function humanizeBody(text: string): HumanizeResult {
  const frontmatter = text.match(/^---\n[\s\S]*?\n---\n?/);
  const prefix = frontmatter?.[0] ?? "";
  const body = text.slice(prefix.length);
  const chunks = body.split(/(```[\s\S]*?```)/g);
  const findings: HumanizeFinding[] = [];
  const output = chunks
    .map((chunk, index) => {
      if (index % 2 === 1) return chunk;
      const result = humanizeText(chunk);
      findings.push(...result.findings);
      return result.text;
    })
    .join("");
  return { text: `${prefix}${output}`, findings };
}

export async function humanizeFile(filePath: string, write = false): Promise<HumanizeResult> {
  const source = await readFile(filePath, "utf8");
  const result = humanizeBody(source);
  if (write && result.text !== source) await writeFile(filePath, result.text, "utf8");
  return result;
}
