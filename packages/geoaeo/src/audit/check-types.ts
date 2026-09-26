import type { PageSnapshot } from "./types.js";
import type { analyzePage } from "./analyze-page.js";

export interface CheckContext {
  artifacts: Map<string, string>;
  mirrors: string[];
  pages: PageSnapshot[];
  blockedAiAgents: string[];
  sharedCanonical: string | undefined;
  pageSignals: ReturnType<typeof analyzePage>[];
  jsonTypes: string[];
  has: (value: string) => boolean;
  anyPage: (predicate: (page: ReturnType<typeof analyzePage>) => boolean) => boolean;
  allPage: (predicate: (page: ReturnType<typeof analyzePage>) => boolean) => boolean;
}

export interface CheckDef {
  id: string;
  label: string;
  weight: number;
  details: string;
  passed: (ctx: CheckContext) => boolean;
}
