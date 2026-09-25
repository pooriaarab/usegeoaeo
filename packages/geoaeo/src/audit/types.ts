export interface AuditCheck {
  id: string;
  label: string;
  passed: boolean;
  weight: number;
  details: string;
}

export interface AuditReport {
  target: string;
  score: number;
  checks: AuditCheck[];
  pages: string[];
  topFixes: string[];
}

export interface PageSnapshot {
  url: string;
  source: string;
  isHtml: boolean;
  /** X-Robots-Tag from a live response. Directory snapshots omit it. */
  xRobotsTag?: string;
}

export interface TargetSnapshot {
  artifacts: Map<string, string>;
  pages: PageSnapshot[];
  mirrors: string[];
}

export interface PageSignals {
  title: boolean;
  description: boolean;
  canonical: boolean;
  og: boolean;
  twitter: boolean;
  jsonLd: boolean;
  jsonLdTypes: string[];
  h1: boolean;
  earlyFaq: boolean;
  directAnswer: boolean;
  wordCount: number;
  questionHeadings: boolean;
  freshness: boolean;
  author: boolean;
  headingOrder: boolean;
  imageAlt: boolean;
  metaRobotsOk: boolean;
  hreflang: boolean;
}
