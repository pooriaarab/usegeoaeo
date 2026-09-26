export interface VisibleRule {
  rule: string;
  pattern: RegExp;
  replacement: string | ((...matches: string[]) => string);
}

interface FindingSink {
  rule: string;
  before: string;
  after: string;
}

// Each rule is the same transformVisible pass as before, stored as data so
// oxfmt wrapping cannot push one function over the 50-line budget.
export const VISIBLE_RULES: VisibleRule[] = [
  { rule: "curly-quotes", pattern: /[“”]/g, replacement: '"' },
  { rule: "curly-apostrophe", pattern: /[‘’]/g, replacement: "'" },
  { rule: "em-dash-range", pattern: /(\b\d+)\s*—\s*(\d+\b)/g, replacement: "$1 to $2" },
  { rule: "em-dash", pattern: /\s*—\s*/g, replacement: ", " },
  {
    rule: "negative-parallelism",
    pattern: /It(?:'s| is) not just [^,.!?]+,\s*it(?:'s| is)\s+([^.!?]+)/gi,
    replacement: "$1",
  },
  {
    rule: "copula-avoidance",
    pattern: /\b(?:serves|stands|functions|acts) as\b/gi,
    replacement: "is",
  },
  { rule: "copula-avoidance", pattern: /\bboasts\b/gi, replacement: "has" },
  { rule: "filler", pattern: /\bin order to\b/gi, replacement: "to" },
  { rule: "filler", pattern: /\bat the end of the day,?\s*/gi, replacement: "" },
  { rule: "filler", pattern: /\bit(?:'s| is) important to note that\s*/gi, replacement: "" },
  {
    rule: "rule-of-three",
    pattern: /\b(innovative|intuitive|powerful),\s*(\w+),\s*and\s+(\w+)\b/gi,
    replacement: "$1 and $2",
  },
  {
    rule: "fake-depth",
    pattern:
      /,?\s*(?:highlighting|underscoring|emphasizing|ensuring|reflecting|symbolizing|showcasing|contributing to|fostering|cultivating)\s+[^.!?]+/gi,
    replacement: "",
  },
  { rule: "ai-vocabulary", pattern: /\bseamless(?:ly)?\b/gi, replacement: "simple" },
  { rule: "ai-vocabulary", pattern: /\brobust\b/gi, replacement: "strong" },
  { rule: "ai-vocabulary", pattern: /\bleverage\b|\bleveraging\b/gi, replacement: "use" },
  { rule: "ai-vocabulary", pattern: /\bvibrant\b/gi, replacement: "lively" },
  { rule: "ai-vocabulary", pattern: /\bshowcase\b|\bshowcasing\b/gi, replacement: "show" },
  { rule: "ai-vocabulary", pattern: /\belevate\b/gi, replacement: "improve" },
  { rule: "ai-vocabulary", pattern: /\bunlock\b/gi, replacement: "allow" },
  { rule: "ai-vocabulary", pattern: /\bdeep dive\b/gi, replacement: "detailed look" },
  { rule: "ai-vocabulary", pattern: /\bstreamline\b|\bstreamlined\b/gi, replacement: "simplify" },
  { rule: "ai-vocabulary", pattern: /\bempower\b/gi, replacement: "help" },
  { rule: "ai-vocabulary", pattern: /\btestament\b/gi, replacement: "proof" },
  { rule: "ai-vocabulary", pattern: /\bpivotal\b/gi, replacement: "important" },
  { rule: "ai-vocabulary", pattern: /\b(?:abstract )?landscape\b/gi, replacement: "area" },
  { rule: "ai-vocabulary", pattern: /\btapestry\b/gi, replacement: "mix" },
  { rule: "ai-vocabulary", pattern: /\bfoster\b|\bfostering\b/gi, replacement: "support" },
  { rule: "ai-vocabulary", pattern: /\bcomprehensive\b/gi, replacement: "full" },
  { rule: "ai-vocabulary", pattern: /\bcrucial\b/gi, replacement: "important" },
  { rule: "ai-vocabulary", pattern: /\bdelve\b/gi, replacement: "examine" },
  { rule: "ai-vocabulary", pattern: /\bnavigate\b/gi, replacement: "handle" },
  { rule: "ai-vocabulary", pattern: /\brealm\b/gi, replacement: "area" },
  {
    rule: "hype-closer",
    pattern: /(?:The future looks bright[^.!?]*[.!?]|Exciting times lie ahead[^.!?]*[.!?])/gi,
    replacement: "",
  },
];

export function applyVisibleRules(
  text: string,
  findings: FindingSink[],
  applyRule: (options: {
    text: string;
    findings: FindingSink[];
    rule: string;
    pattern: RegExp;
    replacement: string | ((...matches: string[]) => string);
  }) => string,
): string {
  let output = text;
  for (const item of VISIBLE_RULES) {
    output = applyRule({ text: output, findings, ...item });
  }
  return output;
}
