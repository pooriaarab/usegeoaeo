import { readFile, writeFile } from 'node:fs/promises';

export interface HumanizeFinding {
  rule: string;
  before: string;
  after: string;
}

export interface HumanizeResult {
  text: string;
  findings: HumanizeFinding[];
}

function applyRule(
  text: string,
  findings: HumanizeFinding[],
  rule: string,
  pattern: RegExp,
  replacement: string | ((...matches: string[]) => string)
): string {
  return text.replace(pattern, (...matches) => {
    const before = matches[0];
    const after = typeof replacement === 'function' ? replacement(...matches) : before.replace(pattern, replacement);
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
    .join(' ');
}

function rewriteHeadings(text: string, findings: HumanizeFinding[]): string {
  let output = applyRule(text, findings, 'sentence-case-heading', /^(#{1,6}\s+)([^\n]+)$/gm, (...matches) => {
    return `${matches[1]}${sentenceCaseHeading(matches[2])}`;
  });
  output = applyRule(output, findings, 'sentence-case-heading', /(<h[1-6][^>]*>)([^<]+)(<\/h[1-6]>)/gi, (...matches) => {
    return `${matches[1]}${sentenceCaseHeading(matches[2])}${matches[3]}`;
  });
  return output;
}

function protect(source: string): { masked: string; blocks: string[] } {
  const blocks: string[] = [];
  const masked = source.replace(/```[\s\S]*?```|`[^`\n]+`|<[^>]*>|\{(?:[^{}]|\{[^{}]*\})*\}|^[ \t]*(?:import|export|const|let|var|function|class|type|interface|return)\b[^\n]*$/gm, block => {
    const index = blocks.push(block) - 1;
    return `\u0000${index}\u0000`;
  });
  return { masked, blocks };
}

function restore(masked: string, blocks: string[]): string {
  return masked.replace(/\u0000(\d+)\u0000/g, (_, index: string) => blocks[Number(index)]);
}

function transformVisible(text: string, findings: HumanizeFinding[]): string {
  let output = text;
  output = applyRule(output, findings, 'curly-quotes', /[“”]/g, '"');
  output = applyRule(output, findings, 'curly-apostrophe', /[‘’]/g, "'");
  output = applyRule(output, findings, 'em-dash-range', /(\b\d+)\s*—\s*(\d+\b)/g, '$1 to $2');
  output = applyRule(output, findings, 'em-dash', /\s*—\s*/g, ', ');
  output = applyRule(output, findings, 'negative-parallelism', /It(?:'s| is) not just [^,.!?]+,\s*it(?:'s| is)\s+([^.!?]+)/gi, '$1');
  output = applyRule(output, findings, 'copula-avoidance', /\b(?:serves|stands|functions|acts) as\b/gi, 'is');
  output = applyRule(output, findings, 'copula-avoidance', /\bboasts\b/gi, 'has');
  output = applyRule(output, findings, 'filler', /\bin order to\b/gi, 'to');
  output = applyRule(output, findings, 'filler', /\bat the end of the day,?\s*/gi, '');
  output = applyRule(output, findings, 'filler', /\bit(?:'s| is) important to note that\s*/gi, '');
  output = applyRule(output, findings, 'rule-of-three', /\b(innovative|intuitive|powerful),\s*(\w+),\s*and\s+(\w+)\b/gi, '$1 and $2');
  output = applyRule(output, findings, 'fake-depth', /,?\s*(?:highlighting|underscoring|emphasizing|ensuring|reflecting|symbolizing|showcasing|contributing to|fostering|cultivating)\s+[^.!?]+/gi, '');
  output = applyRule(output, findings, 'ai-vocabulary', /\bseamless(?:ly)?\b/gi, 'simple');
  output = applyRule(output, findings, 'ai-vocabulary', /\brobust\b/gi, 'strong');
  output = applyRule(output, findings, 'ai-vocabulary', /\bleverage\b|\bleveraging\b/gi, 'use');
  output = applyRule(output, findings, 'ai-vocabulary', /\bvibrant\b/gi, 'lively');
  output = applyRule(output, findings, 'ai-vocabulary', /\bshowcase\b|\bshowcasing\b/gi, 'show');
  output = applyRule(output, findings, 'ai-vocabulary', /\belevate\b/gi, 'improve');
  output = applyRule(output, findings, 'ai-vocabulary', /\bunlock\b/gi, 'allow');
  output = applyRule(output, findings, 'ai-vocabulary', /\bdeep dive\b/gi, 'detailed look');
  output = applyRule(output, findings, 'ai-vocabulary', /\bstreamline\b|\bstreamlined\b/gi, 'simplify');
  output = applyRule(output, findings, 'ai-vocabulary', /\bempower\b/gi, 'help');
  output = applyRule(output, findings, 'ai-vocabulary', /\btestament\b/gi, 'proof');
  output = applyRule(output, findings, 'ai-vocabulary', /\bpivotal\b/gi, 'important');
  output = applyRule(output, findings, 'ai-vocabulary', /\b(?:abstract )?landscape\b/gi, 'area');
  output = applyRule(output, findings, 'ai-vocabulary', /\btapestry\b/gi, 'mix');
  output = applyRule(output, findings, 'ai-vocabulary', /\bfoster\b|\bfostering\b/gi, 'support');
  output = applyRule(output, findings, 'ai-vocabulary', /\bcomprehensive\b/gi, 'full');
  output = applyRule(output, findings, 'ai-vocabulary', /\bcrucial\b/gi, 'important');
  output = applyRule(output, findings, 'ai-vocabulary', /\bdelve\b/gi, 'examine');
  output = applyRule(output, findings, 'ai-vocabulary', /\bnavigate\b/gi, 'handle');
  output = applyRule(output, findings, 'ai-vocabulary', /\brealm\b/gi, 'area');
  output = applyRule(output, findings, 'hype-closer', /(?:The future looks bright[^.!?]*[.!?]|Exciting times lie ahead[^.!?]*[.!?])/gi, '');
  const cleaned = output.replace(/[ \t]{2,}/g, ' ').replace(/ +([,.!?])/g, '$1');
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
  const prefix = frontmatter?.[0] ?? '';
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
    .join('');
  return { text: `${prefix}${output}`, findings };
}

export async function humanizeFile(filePath: string, write = false): Promise<HumanizeResult> {
  const source = await readFile(filePath, 'utf8');
  const result = humanizeBody(source);
  if (write && result.text !== source) await writeFile(filePath, result.text, 'utf8');
  return result;
}
