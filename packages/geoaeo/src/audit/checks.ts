import type { AuditCheck, TargetSnapshot } from "./types.js";
import { AI_SEARCH_AGENTS } from "../generators/robots.js";
import { analyzePage } from "./analyze-page.js";
import { blockedAgents } from "./robots-policy.js";
import type { CheckContext, CheckDef } from "./check-types.js";
import { getCheckDefinitions } from "./check-definitions.js";
import {
  answerabilityDetails,
  faqSchemaDetails,
  findSharedCanonical,
  headerNoindex,
  schemaValidDetails,
} from "./check-predicates.js";

const ARTIFACT_ALIASES: Array<[string, string]> = [
  ["__llms", "llms.txt"],
  ["__llmsFull", "llms-full.txt"],
  ["__aiTxt", "ai.txt"],
  ["__sitemap", "sitemap.xml"],
  ["__robots", "robots.txt"],
  ["__webmcp", "webmcp"],
  ["__mcpCard", "mcp-card"],
  ["__agentCard", "agent-card"],
  ["__agentSkills", "agent-skills"],
  ["__apiCatalog", "api-catalog"],
  ["__poppy", "poppy"],
];

function aliasedArtifacts(snapshot: TargetSnapshot): Map<string, string> {
  const artifacts = new Map(snapshot.artifacts);
  for (const [alias, key] of ARTIFACT_ALIASES) {
    artifacts.set(alias, snapshot.artifacts.get(key) ?? "");
  }
  return artifacts;
}

function buildContext(snapshot: TargetSnapshot): CheckContext {
  const artifacts = aliasedArtifacts(snapshot);
  const robots = artifacts.get("__robots") ?? "";
  const pageSignals = snapshot.pages.map((page) => analyzePage(page.source, page.isHtml));
  const anyPage = (predicate: (page: ReturnType<typeof analyzePage>) => boolean) =>
    pageSignals.some(predicate);
  const allPage = (predicate: (page: ReturnType<typeof analyzePage>) => boolean) =>
    pageSignals.length > 0 && pageSignals.every(predicate);
  const jsonTypes = [...new Set(pageSignals.flatMap((page) => page.jsonLdTypes))];
  const has = (value: string) => value.trim().length > 0;
  const blockedAiAgents = blockedAgents(robots, AI_SEARCH_AGENTS);
  const sharedCanonical = findSharedCanonical(snapshot.pages, pageSignals);
  return {
    artifacts,
    mirrors: snapshot.mirrors,
    pages: snapshot.pages,
    blockedAiAgents,
    sharedCanonical,
    pageSignals,
    jsonTypes,
    has,
    anyPage,
    allPage,
  };
}

function metaTagNoindex(signals: CheckContext["pageSignals"]): boolean {
  return signals.some((page) => !page.metaRobotsOk);
}

function noindexReasons(header: boolean, meta: boolean): string {
  const reasons = [
    header ? "noindex set by X-Robots-Tag header" : "",
    meta ? "noindex set by meta tag" : "",
  ];
  return reasons.filter((reason) => reason.length > 0).join("; ");
}

const detailFns: Record<string, (ctx: CheckContext, check: CheckDef) => string> = {
  markdown: (ctx) =>
    ctx.mirrors.length
      ? `${ctx.mirrors.length} mirror file(s) found.`
      : "No page markdown mirrors were found.",
  "json-ld": (ctx) =>
    ctx.jsonTypes.length
      ? `Types: ${ctx.jsonTypes.join(", ")}.`
      : "No schema.org JSON-LD was found.",
  "meta-robots": (ctx, check) =>
    noindexReasons(headerNoindex(ctx.pages), metaTagNoindex(ctx.pageSignals)) || check.details,
  canonical: (ctx, check) =>
    ctx.sharedCanonical
      ? `All inspected pages declare the same canonical URL: ${ctx.sharedCanonical}.`
      : check.details,
  "ai-crawlers": (ctx, check) =>
    ctx.blockedAiAgents.length ? `Blocked: ${ctx.blockedAiAgents.join(", ")}.` : check.details,
  answerability: (ctx) => answerabilityDetails(ctx),
  "schema-valid": (ctx) => schemaValidDetails(ctx),
  "faq-schema": (ctx) => faqSchemaDetails(ctx),
};

function detailFor(check: CheckDef, ctx: CheckContext): string {
  return detailFns[check.id]?.(ctx, check) ?? check.details;
}

function applyFailurePrefix(check: AuditCheck, ctx: CheckContext): AuditCheck {
  if (
    check.passed ||
    check.id === "ai-crawlers" ||
    check.id === "answerability" ||
    check.id === "schema-valid" ||
    check.id === "faq-schema" ||
    (check.id === "canonical" && ctx.sharedCanonical !== undefined) ||
    check.details.startsWith("noindex set by ")
  )
    return check;
  return { ...check, details: `Missing: ${check.details.toLowerCase()}` };
}

export function buildChecks(snapshot: TargetSnapshot): AuditCheck[] {
  const ctx = buildContext(snapshot);
  const defs = getCheckDefinitions();
  const checks: AuditCheck[] = defs.map((def) => ({
    id: def.id,
    label: def.label,
    passed: def.passed(ctx),
    weight: def.weight,
    details: detailFor(def, ctx),
  }));
  return checks.map((check) => applyFailurePrefix(check, ctx));
}
