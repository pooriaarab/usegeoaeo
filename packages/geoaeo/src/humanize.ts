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
  let output = applyRule({ text, findings, rule: 'sentence-case-heading', pattern: /^(#{1,6}\s+)([^\n]+)$/gm, replacement: (...matches) => {
    return `${matches[1]}${sentenceCaseHeading(matches[2])}`;
  } });
  output = applyRule({ text: output, findings, rule: 'sentence-case-heading', pattern: /(<h[1-6][^>]*>)([^<]+)(<\/h[1-6]>)/gi, replacement: (...matches) => {
    return `${matches[1]}${sentenceCaseHeading(matches[2])}${matches[3]}`;
  } });
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
  output = applyRule({ text: output, findings, rule: 'curly-quotes', pattern: /[“”]/g, replacement: '"' });
  output = applyRule({ text: output, findings, rule: 'curly-apostrophe', pattern: /[‘’]/g, replacement: "'" });
  output = applyRule({ text: output, findings, rule: 'em-dash-range', pattern: /(\b\d+)\s*—\s*(\d+\b)/g, replacement: '$1 to $2' });
  output = applyRule({ text: output, findings, rule: 'em-dash', pattern: /\s*—\s*/g, replacement: ', ' });
  output = applyRule({ text: output, findings, rule: 'negative-parallelism', pattern: /It(?:'s| is) not just [^,.!?]+,\s*it(?:'s| is)\s+([^.!?]+)/gi, replacement: '$1' });
  output = applyRule({ text: output, findings, rule: 'copula-avoidance', pattern: /\b(?:serves|stands|functions|acts) as\b/gi, replacement: 'is' });
  output = applyRule({ text: output, findings, rule: 'copula-avoidance', pattern: /\bboasts\b/gi, replacement: 'has' });
  output = applyRule({ text: output, findings, rule: 'filler', pattern: /\bin order to\b/gi, replacement: 'to' });
  output = applyRule({ text: output, findings, rule: 'filler', pattern: /\bat the end of the day,?\s*/gi, replacement: '' });
  output = applyRule({ text: output, findings, rule: 'filler', pattern: /\bit(?:'s| is) important to note that\s*/gi, replacement: '' });
  output = applyRule({ text: output, findings, rule: 'rule-of-three', pattern: /\b(innovative|intuitive|powerful),\s*(\w+),\s*and\s+(\w+)\b/gi, replacement: '$1 and $2' });
  output = applyRule({ text: output, findings, rule: 'fake-depth', pattern: /,?\s*(?:highlighting|underscoring|emphasizing|ensuring|reflecting|symbolizing|showcasing|contributing to|fostering|cultivating)\s+[^.!?]+/gi, replacement: '' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\bseamless(?:ly)?\b/gi, replacement: 'simple' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\brobust\b/gi, replacement: 'strong' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\bleverage\b|\bleveraging\b/gi, replacement: 'use' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\bvibrant\b/gi, replacement: 'lively' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\bshowcase\b|\bshowcasing\b/gi, replacement: 'show' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\belevate\b/gi, replacement: 'improve' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\bunlock\b/gi, replacement: 'allow' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\bdeep dive\b/gi, replacement: 'detailed look' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\bstreamline\b|\bstreamlined\b/gi, replacement: 'simplify' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\bempower\b/gi, replacement: 'help' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\btestament\b/gi, replacement: 'proof' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\bpivotal\b/gi, replacement: 'important' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\b(?:abstract )?landscape\b/gi, replacement: 'area' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\btapestry\b/gi, replacement: 'mix' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\bfoster\b|\bfostering\b/gi, replacement: 'support' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\bcomprehensive\b/gi, replacement: 'full' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\bcrucial\b/gi, replacement: 'important' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\bdelve\b/gi, replacement: 'examine' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\bnavigate\b/gi, replacement: 'handle' });
  output = applyRule({ text: output, findings, rule: 'ai-vocabulary', pattern: /\brealm\b/gi, replacement: 'area' });
  output = applyRule({ text: output, findings, rule: 'hype-closer', pattern: /(?:The future looks bright[^.!?]*[.!?]|Exciting times lie ahead[^.!?]*[.!?])/gi, replacement: '' });
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
