import type { AuditCheck, PageSnapshot, TargetSnapshot } from './types.js';
import { AI_AGENTS } from '../generators/robots.js';
import { analyzePage } from './analyze-page.js';
import { blockedAgents } from './robots-policy.js';

interface CheckContext {
  artifacts: Map<string, string>;
  mirrors: string[];
  pages: PageSnapshot[];
  blockedAiAgents: string[];
  pageSignals: ReturnType<typeof analyzePage>[];
  jsonTypes: string[];
  has: (value: string) => boolean;
  anyPage: (predicate: (page: ReturnType<typeof analyzePage>) => boolean) => boolean;
  allPage: (predicate: (page: ReturnType<typeof analyzePage>) => boolean) => boolean;
}

interface CheckDef {
  id: string;
  label: string;
  weight: number;
  details: string;
  passed: (ctx: CheckContext) => boolean;
}

function buildContext(snapshot: TargetSnapshot): CheckContext {
  const llms = snapshot.artifacts.get('llms.txt') ?? '';
  const llmsFull = snapshot.artifacts.get('llms-full.txt') ?? '';
  const sitemap = snapshot.artifacts.get('sitemap.xml') ?? '';
  const robots = snapshot.artifacts.get('robots.txt') ?? '';
  const webmcp = snapshot.artifacts.get('webmcp') ?? '';
  const mcpCard = snapshot.artifacts.get('mcp-card') ?? '';
  const agentCard = snapshot.artifacts.get('agent-card') ?? '';
  const agentSkills = snapshot.artifacts.get('agent-skills') ?? '';
  const apiCatalog = snapshot.artifacts.get('api-catalog') ?? '';
  const artifacts = new Map(snapshot.artifacts);
  artifacts.set('__llms', llms);
  artifacts.set('__llmsFull', llmsFull);
  artifacts.set('__sitemap', sitemap);
  artifacts.set('__robots', robots);
  artifacts.set('__webmcp', webmcp);
  artifacts.set('__mcpCard', mcpCard);
  artifacts.set('__agentCard', agentCard);
  artifacts.set('__agentSkills', agentSkills);
  artifacts.set('__apiCatalog', apiCatalog);
  const pageSignals = snapshot.pages.map(page => analyzePage(page.source, page.isHtml));
  const anyPage = (predicate: (page: ReturnType<typeof analyzePage>) => boolean) => pageSignals.some(predicate);
  const allPage = (predicate: (page: ReturnType<typeof analyzePage>) => boolean) => pageSignals.length > 0 && pageSignals.every(predicate);
  const jsonTypes = [...new Set(pageSignals.flatMap(page => page.jsonLdTypes))];
  const has = (value: string) => value.trim().length > 0;
  const blockedAiAgents = blockedAgents(robots, AI_AGENTS);
  return { artifacts, mirrors: snapshot.mirrors, pages: snapshot.pages, blockedAiAgents, pageSignals, jsonTypes, has, anyPage, allPage };
}

function headerNoindex(pages: PageSnapshot[]): boolean {
  return pages.some(page => /noindex/i.test(page.xRobotsTag ?? ''));
}

function metaTagNoindex(signals: CheckContext['pageSignals']): boolean {
  return signals.some(page => !page.metaRobotsOk);
}

function noindexReasons(header: boolean, meta: boolean): string {
  const reasons = [
    header ? 'noindex set by X-Robots-Tag header' : '',
    meta ? 'noindex set by meta tag' : '',
  ];
  return reasons.filter(reason => reason.length > 0).join('; ');
}

function getCheckDefinitions(): CheckDef[] {
  return [
    { id: 'llms', label: '/llms.txt', weight: 6, details: 'Short site map is present.', passed: ctx => /generateLlms|#\s+\S+/i.test(ctx.artifacts.get('__llms') ?? '') },
    { id: 'llms-full', label: '/llms-full.txt', weight: 6, details: 'Full site map is present.', passed: ctx => /generateLlmsFull|##\s+(What it is|Common questions)/i.test(ctx.artifacts.get('__llmsFull') ?? '') },
    { id: 'sitemap', label: '/sitemap.xml', weight: 6, details: 'A sitemap artifact is present.', passed: ctx => /<urlset|generateSitemap|sitemap\s*\(/i.test(ctx.artifacts.get('__sitemap') ?? '') },
    { id: 'robots', label: '/robots.txt', weight: 1, details: 'Robots policy includes a sitemap URL.', passed: ctx => /User-agent:|generateRobots/i.test(ctx.artifacts.get('__robots') ?? '') && /Sitemap:|sitemap\s*:/i.test(ctx.artifacts.get('__robots') ?? '') },
    { id: 'ai-crawlers', label: 'AI crawler access', weight: 3, details: 'No named AI crawler is disallowed from /.', passed: ctx => ctx.blockedAiAgents.length === 0 },
    { id: 'webmcp', label: 'WebMCP manifest', weight: 4, details: 'A WebMCP-style tool manifest is present.', passed: ctx => /generateWebmcp|"tools"|tools\s*[:=]/i.test(ctx.artifacts.get('__webmcp') ?? '') },
    { id: 'markdown', label: 'Markdown mirrors', weight: 4, details: '', passed: ctx => ctx.mirrors.length > 0 },
    { id: 'title', label: 'Page titles', weight: 4, details: 'Every inspected page has a title.', passed: ctx => ctx.allPage(page => page.title) },
    { id: 'description', label: 'Meta descriptions', weight: 4, details: 'Every inspected page has a meta description.', passed: ctx => ctx.allPage(page => page.description) },
    { id: 'canonical', label: 'Canonical links', weight: 3, details: 'Every inspected page has a canonical URL.', passed: ctx => ctx.allPage(page => page.canonical) },
    { id: 'open-graph', label: 'Open Graph tags', weight: 3, details: 'Open Graph tags are present.', passed: ctx => ctx.anyPage(page => page.og) },
    { id: 'twitter', label: 'Twitter tags', weight: 2, details: 'Twitter card tags are present.', passed: ctx => ctx.anyPage(page => page.twitter) },
    { id: 'json-ld', label: 'JSON-LD', weight: 7, details: '', passed: ctx => ctx.anyPage(page => page.jsonLd) },
    { id: 'hreflang', label: 'hreflang alternates', weight: 3, details: 'Language alternates are declared.', passed: ctx => ctx.anyPage(page => page.hreflang) },
    { id: 'meta-robots', label: 'Indexable', weight: 2, details: 'No page is set to noindex.', passed: ctx => ctx.allPage(page => page.metaRobotsOk) && !headerNoindex(ctx.pages) },
    { id: 'image-alt', label: 'Image alt text', weight: 1, details: 'Every image has alt text.', passed: ctx => ctx.allPage(page => page.imageAlt) },
    { id: 'heading-order', label: 'Heading structure', weight: 3, details: 'A page has one H1 and section H2s.', passed: ctx => ctx.anyPage(page => page.headingOrder) },
    { id: 'answerability', label: 'Answer-first content', weight: 9, details: 'A page opens with a concise, direct answer under a clear H1.', passed: ctx => ctx.anyPage(page => page.directAnswer && page.h1) },
    { id: 'qa-framing', label: 'Question framing', weight: 5, details: 'Content is framed as questions an engine can quote.', passed: ctx => ctx.anyPage(page => page.questionHeadings || page.earlyFaq) },
    { id: 'freshness', label: 'Freshness signals', weight: 6, details: 'Pages show a published or updated date.', passed: ctx => ctx.anyPage(page => page.freshness) },
    { id: 'author', label: 'Author and E-E-A-T', weight: 6, details: 'Pages name an author or organization.', passed: ctx => ctx.anyPage(page => page.author) },
    { id: 'mcp-card', label: 'MCP server card', weight: 4, details: 'An MCP server card is published at /.well-known/mcp/server-card.json.', passed: ctx => ctx.has(ctx.artifacts.get('__mcpCard') ?? '') },
    { id: 'agent-card', label: 'Agent card', weight: 4, details: 'An agent card is published at /.well-known/agent-card.json.', passed: ctx => ctx.has(ctx.artifacts.get('__agentCard') ?? '') },
    { id: 'agent-skills', label: 'Agent skills', weight: 2, details: 'An agent-skills index is published under /.well-known/agent-skills/.', passed: ctx => ctx.has(ctx.artifacts.get('__agentSkills') ?? '') },
    { id: 'api-catalog', label: 'API catalog', weight: 2, details: 'An API catalog is published at /.well-known/api-catalog.', passed: ctx => ctx.has(ctx.artifacts.get('__apiCatalog') ?? '') },
  ];
}

function detailFor(check: CheckDef, ctx: CheckContext): string {
  if (check.id === 'markdown') return ctx.mirrors.length ? `${ctx.mirrors.length} mirror file(s) found.` : 'No page markdown mirrors were found.';
  if (check.id === 'json-ld') return ctx.jsonTypes.length ? `Types: ${ctx.jsonTypes.join(', ')}.` : 'No schema.org JSON-LD was found.';
  if (check.id === 'meta-robots') {
    const reasons = noindexReasons(headerNoindex(ctx.pages), metaTagNoindex(ctx.pageSignals));
    return reasons || check.details;
  }
  if (check.id === 'ai-crawlers' && ctx.blockedAiAgents.length) return `Blocked: ${ctx.blockedAiAgents.join(', ')}.`;
  return check.details;
}

function applyFailurePrefix(check: AuditCheck): AuditCheck {
  if (check.passed || check.id === 'ai-crawlers' || check.details.startsWith('noindex set by ')) return check;
  return { ...check, details: `Missing: ${check.details.toLowerCase()}` };
}

export function buildChecks(snapshot: TargetSnapshot): AuditCheck[] {
  const ctx = buildContext(snapshot);
  const defs = getCheckDefinitions();
  const checks: AuditCheck[] = defs.map(def => ({
    id: def.id,
    label: def.label,
    passed: def.passed(ctx),
    weight: def.weight,
    details: detailFor(def, ctx),
  }));
  return checks.map(applyFailurePrefix);
}
