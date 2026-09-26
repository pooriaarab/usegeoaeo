import type { AuditCheck, TargetSnapshot } from "./types.js";
import { AI_AGENTS } from "../generators/robots.js";
import { analyzePage } from "./analyze-page.js";
import { blockedAgents } from "./robots-policy.js";
import type { CheckContext, CheckDef } from "./check-types.js";
import { getCheckDefinitions } from "./check-definitions.js";
import { answerabilityDetails, headerNoindex } from "./check-predicates.js";

function buildContext(snapshot: TargetSnapshot): CheckContext {
  const llms = snapshot.artifacts.get("llms.txt") ?? "";
  const llmsFull = snapshot.artifacts.get("llms-full.txt") ?? "";
  const sitemap = snapshot.artifacts.get("sitemap.xml") ?? "";
  const robots = snapshot.artifacts.get("robots.txt") ?? "";
  const webmcp = snapshot.artifacts.get("webmcp") ?? "";
  const mcpCard = snapshot.artifacts.get("mcp-card") ?? "";
  const agentCard = snapshot.artifacts.get("agent-card") ?? "";
  const agentSkills = snapshot.artifacts.get("agent-skills") ?? "";
  const apiCatalog = snapshot.artifacts.get("api-catalog") ?? "";
  const artifacts = new Map(snapshot.artifacts);
  artifacts.set("__llms", llms);
  artifacts.set("__llmsFull", llmsFull);
  artifacts.set("__sitemap", sitemap);
  artifacts.set("__robots", robots);
  artifacts.set("__webmcp", webmcp);
  artifacts.set("__mcpCard", mcpCard);
  artifacts.set("__agentCard", agentCard);
  artifacts.set("__agentSkills", agentSkills);
  artifacts.set("__apiCatalog", apiCatalog);
  const pageSignals = snapshot.pages.map((page) => analyzePage(page.source, page.isHtml));
  const anyPage = (predicate: (page: ReturnType<typeof analyzePage>) => boolean) =>
    pageSignals.some(predicate);
  const allPage = (predicate: (page: ReturnType<typeof analyzePage>) => boolean) =>
    pageSignals.length > 0 && pageSignals.every(predicate);
  const jsonTypes = [...new Set(pageSignals.flatMap((page) => page.jsonLdTypes))];
  const has = (value: string) => value.trim().length > 0;
  const blockedAiAgents = blockedAgents(robots, AI_AGENTS);
  return {
    artifacts,
    mirrors: snapshot.mirrors,
    pages: snapshot.pages,
    blockedAiAgents,
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

function detailFor(check: CheckDef, ctx: CheckContext): string {
  if (check.id === "markdown")
    return ctx.mirrors.length
      ? `${ctx.mirrors.length} mirror file(s) found.`
      : "No page markdown mirrors were found.";
  if (check.id === "json-ld")
    return ctx.jsonTypes.length
      ? `Types: ${ctx.jsonTypes.join(", ")}.`
      : "No schema.org JSON-LD was found.";
  if (check.id === "meta-robots") {
    const reasons = noindexReasons(headerNoindex(ctx.pages), metaTagNoindex(ctx.pageSignals));
    return reasons || check.details;
  }
  if (check.id === "ai-crawlers" && ctx.blockedAiAgents.length)
    return `Blocked: ${ctx.blockedAiAgents.join(", ")}.`;
  if (check.id === "answerability") return answerabilityDetails(ctx);
  return check.details;
}

function applyFailurePrefix(check: AuditCheck): AuditCheck {
  if (
    check.passed ||
    check.id === "ai-crawlers" ||
    check.id === "answerability" ||
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
  return checks.map(applyFailurePrefix);
}
