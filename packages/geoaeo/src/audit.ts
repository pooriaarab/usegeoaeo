import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

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

interface PageSnapshot {
  url: string;
  source: string;
  isHtml: boolean;
}

interface TargetSnapshot {
  artifacts: Map<string, string>;
  pages: PageSnapshot[];
  mirrors: string[];
}

const SKIPPED_DIRS = new Set(['.git', 'node_modules', '.next', 'dist', 'coverage']);
const PAGE_EXTENSIONS = new Set(['.html', '.htm', '.tsx', '.jsx', '.mdx']);

export function scoreAuditChecks(checks: AuditCheck[]): number {
  const total = checks.reduce((sum, check) => sum + check.weight, 0);
  if (total === 0) return 0;
  const earned = checks.reduce((sum, check) => sum + (check.passed ? check.weight : 0), 0);
  return Math.round((earned / total) * 100);
}

async function walkFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory() && !SKIPPED_DIRS.has(entry.name)) {
      files.push(...(await walkFiles(path.join(directory, entry.name))));
    } else if (entry.isFile()) {
      files.push(path.join(directory, entry.name));
    }
  }
  return files;
}

function findArtifact(files: string[], name: string): string | undefined {
  return files.find(file => {
    const relative = file.replaceAll('\\', '/');
    return relative.endsWith(`/${name}`) || path.basename(relative) === name || relative.endsWith(`/${name}/route.ts`);
  });
}

async function readOptional(file: string | undefined): Promise<string> {
  if (!file) return '';
  try {
    return await readFile(file, 'utf8');
  } catch {
    return '';
  }
}

function sourceHas(source: string, patterns: RegExp[]): boolean {
  return patterns.some(pattern => pattern.test(source));
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
  // GEO/AEO answerability signals
  directAnswer: boolean;
  questionHeadings: boolean;
  freshness: boolean;
  author: boolean;
  // deeper technical SEO signals
  headingOrder: boolean;
  imageAlt: boolean;
  metaRobotsOk: boolean;
  hreflang: boolean;
}

// Exported for tests. Analyze one page's source (rendered HTML or framework source).
export function analyzePage(source: string, isHtml: boolean): PageSignals {
  if (isHtml) {
    const $ = load(source);
    const visible = $.root().text();
    const top = visible.slice(0, 3000);
    const jsonLdTypes = $('script[type="application/ld+json"]')
      .map((_, element) => $(element).text())
      .get()
      .flatMap(value => {
        try {
          const parsed = JSON.parse(value) as Record<string, unknown>;
          // A script can hold a single node, an array of nodes, or a { "@graph": [...] } wrapper.
          const nodes = Array.isArray(parsed)
            ? parsed
            : Array.isArray((parsed as { '@graph'?: unknown[] })['@graph'])
              ? ((parsed as { '@graph': unknown[] })['@graph'])
              : [parsed];
          return nodes.flatMap(node => {
            const type = (node as { '@type'?: string | string[] })?.['@type'];
            return type ? (Array.isArray(type) ? type : [type]) : [];
          });
        } catch {
          return [];
        }
      });
    const firstParagraph = $('p').first().text().trim();
    const questionHeadings = $('h2, h3')
      .toArray()
      .some(element => $(element).text().trim().endsWith('?'));
    const images = $('img').toArray();
    return {
      title: $('title').text().trim().length > 0,
      description: $('meta[name="description"]').attr('content')?.trim().length ? true : false,
      canonical: $('link[rel="canonical"]').attr('href')?.trim().length ? true : false,
      og: $('meta[property^="og:"]').length >= 2,
      twitter: $('meta[name^="twitter:"]').length >= 1,
      jsonLd: jsonLdTypes.length > 0,
      jsonLdTypes,
      h1: $('h1').length > 0,
      earlyFaq: /\bfaq\b|frequently asked questions/i.test(visible.slice(0, 5000)),
      directAnswer: firstParagraph.length >= 40 && firstParagraph.length <= 600,
      questionHeadings,
      freshness:
        $('time').length > 0 ||
        $('meta[property="article:published_time"], meta[property="og:updated_time"], meta[name="date"]').length > 0 ||
        /(updated|published|last modified|posted)[^.]{0,40}\b20\d{2}\b/i.test(top) ||
        jsonLdTypes.length > 0 && /"date(Published|Modified)"/i.test(source),
      author:
        !!$('meta[name="author"]').attr('content')?.trim() ||
        $('[rel="author"], [itemprop="author"]').length > 0 ||
        /"@type"\s*:\s*"Person"/i.test(source),
      headingOrder: $('h1').length === 1 && $('h2').length >= 1,
      imageAlt: images.length === 0 || images.every(element => ($(element).attr('alt') ?? '').trim().length > 0),
      metaRobotsOk: !/noindex/i.test($('meta[name="robots"]').attr('content') ?? ''),
      hreflang: $('link[rel="alternate"][hreflang]').length > 0,
    };
  }
  return {
    title: sourceHas(source, [/<title[\s>]/i, /metadata\s*=|title\s*:/i]),
    description: sourceHas(source, [/name=["']description["']/i, /description\s*:/i]),
    canonical: sourceHas(source, [/rel=["']canonical["']/i, /canonical\s*:/i]),
    og: sourceHas(source, [/og:title/i, /og:description/i]),
    twitter: sourceHas(source, [/twitter:card/i, /twitter:title/i]),
    jsonLd: sourceHas(source, [/application\/ld\+json/i, /['"]@type['"]\s*:/i]),
    jsonLdTypes: [...source.matchAll(/['"]@type['"]\s*:\s*['"]([^'"]+)['"]/gi)].map(match => match[1]),
    h1: sourceHas(source, [/<h1[\s>]/i, /<h1>/i]),
    earlyFaq: /\bfaq\b|frequently asked questions/i.test(source.slice(0, 5000)),
    directAnswer: sourceHas(source, [/<h1[\s>]/i]) && sourceHas(source, [/<p[\s>]/i]),
    questionHeadings: /<h[23][^>]*>[^<]*\?/i.test(source),
    freshness: sourceHas(source, [/date(Published|Modified)/i, /<time[\s>]/i, /(updated|published|last modified)[^.]{0,40}\b20\d{2}\b/i]),
    author: sourceHas(source, [/name=["']author["']/i, /rel=["']author["']/i, /itemprop=["']author["']/i, /"@type"\s*:\s*"Person"/i]),
    headingOrder: sourceHas(source, [/<h1[\s>]/i]) && sourceHas(source, [/<h2[\s>]/i]),
    imageAlt: !/<img(?![^>]*\balt=)[^>]*>/i.test(source),
    metaRobotsOk: !/noindex/i.test(source),
    hreflang: /hreflang/i.test(source),
  };
}

function inspectPage(page: PageSnapshot): PageSignals {
  return analyzePage(page.source, page.isHtml);
}

function buildChecks(snapshot: TargetSnapshot): AuditCheck[] {
  const llms = snapshot.artifacts.get('llms.txt') ?? '';
  const llmsFull = snapshot.artifacts.get('llms-full.txt') ?? '';
  const sitemap = snapshot.artifacts.get('sitemap.xml') ?? '';
  const robots = snapshot.artifacts.get('robots.txt') ?? '';
  const webmcp = snapshot.artifacts.get('webmcp') ?? '';
  const mcpCard = snapshot.artifacts.get('mcp-card') ?? '';
  const agentCard = snapshot.artifacts.get('agent-card') ?? '';
  const agentSkills = snapshot.artifacts.get('agent-skills') ?? '';
  const apiCatalog = snapshot.artifacts.get('api-catalog') ?? '';
  const pageSignals = snapshot.pages.map(inspectPage);
  const anyPage = (predicate: (page: ReturnType<typeof inspectPage>) => boolean) => pageSignals.some(predicate);
  const allPage = (predicate: (page: ReturnType<typeof inspectPage>) => boolean) => pageSignals.length > 0 && pageSignals.every(predicate);
  const jsonTypes = [...new Set(pageSignals.flatMap(page => page.jsonLdTypes))];
  const has = (value: string) => value.trim().length > 0;
  const checks: AuditCheck[] = [
    // Discovery artifacts (30)
    { id: 'llms', label: '/llms.txt', passed: /generateLlms|#\s+\S+/i.test(llms), weight: 6, details: 'Short site map is present.' },
    { id: 'llms-full', label: '/llms-full.txt', passed: /generateLlmsFull|##\s+(What it is|Common questions)/i.test(llmsFull), weight: 6, details: 'Full site map is present.' },
    { id: 'sitemap', label: '/sitemap.xml', passed: /<urlset|generateSitemap|sitemap\s*\(/i.test(sitemap), weight: 6, details: 'A sitemap artifact is present.' },
    { id: 'robots', label: '/robots.txt', passed: /User-agent:|generateRobots/i.test(robots) && /Sitemap:|sitemap\s*:/i.test(robots), weight: 4, details: 'Robots policy includes a sitemap URL.' },
    { id: 'webmcp', label: 'WebMCP manifest', passed: /generateWebmcp|"tools"|tools\s*[:=]/i.test(webmcp), weight: 4, details: 'A WebMCP-style tool manifest is present.' },
    { id: 'markdown', label: 'Markdown mirrors', passed: snapshot.mirrors.length > 0, weight: 4, details: snapshot.mirrors.length ? `${snapshot.mirrors.length} mirror file(s) found.` : 'No page markdown mirrors were found.' },
    // Meta and structured data (32)
    { id: 'title', label: 'Page titles', passed: allPage(page => page.title), weight: 4, details: 'Every inspected page has a title.' },
    { id: 'description', label: 'Meta descriptions', passed: allPage(page => page.description), weight: 4, details: 'Every inspected page has a meta description.' },
    { id: 'canonical', label: 'Canonical links', passed: allPage(page => page.canonical), weight: 3, details: 'Every inspected page has a canonical URL.' },
    { id: 'open-graph', label: 'Open Graph tags', passed: anyPage(page => page.og), weight: 3, details: 'Open Graph tags are present.' },
    { id: 'twitter', label: 'Twitter tags', passed: anyPage(page => page.twitter), weight: 2, details: 'Twitter card tags are present.' },
    { id: 'json-ld', label: 'JSON-LD', passed: anyPage(page => page.jsonLd), weight: 7, details: jsonTypes.length ? `Types: ${jsonTypes.join(', ')}.` : 'No schema.org JSON-LD was found.' },
    { id: 'hreflang', label: 'hreflang alternates', passed: anyPage(page => page.hreflang), weight: 3, details: 'Language alternates are declared.' },
    { id: 'meta-robots', label: 'Indexable', passed: allPage(page => page.metaRobotsOk), weight: 2, details: 'No page is set to noindex.' },
    { id: 'image-alt', label: 'Image alt text', passed: allPage(page => page.imageAlt), weight: 1, details: 'Every image has alt text.' },
    { id: 'heading-order', label: 'Heading structure', passed: anyPage(page => page.headingOrder), weight: 3, details: 'A page has one H1 and section H2s.' },
    // Answerability — GEO and AEO (26)
    { id: 'answerability', label: 'Answer-first content', passed: anyPage(page => page.directAnswer && page.h1), weight: 9, details: 'A page opens with a concise, direct answer under a clear H1.' },
    { id: 'qa-framing', label: 'Question framing', passed: anyPage(page => page.questionHeadings || page.earlyFaq), weight: 5, details: 'Content is framed as questions an engine can quote.' },
    { id: 'freshness', label: 'Freshness signals', passed: anyPage(page => page.freshness), weight: 6, details: 'Pages show a published or updated date.' },
    { id: 'author', label: 'Author and E-E-A-T', passed: anyPage(page => page.author), weight: 6, details: 'Pages name an author or organization.' },
    // Agent interfaces — the AEO frontier (12)
    { id: 'mcp-card', label: 'MCP server card', passed: has(mcpCard), weight: 4, details: 'An MCP server card is published at /.well-known/mcp/server-card.json.' },
    { id: 'agent-card', label: 'Agent card', passed: has(agentCard), weight: 4, details: 'An agent card is published at /.well-known/agent-card.json.' },
    { id: 'agent-skills', label: 'Agent skills', passed: has(agentSkills), weight: 2, details: 'An agent-skills index is published under /.well-known/agent-skills/.' },
    { id: 'api-catalog', label: 'API catalog', passed: has(apiCatalog), weight: 2, details: 'An API catalog is published at /.well-known/api-catalog.' },
  ];
  return checks.map(check => ({ ...check, details: check.passed ? check.details : `Missing: ${check.details.toLowerCase()}` }));
}

async function snapshotDirectory(directory: string): Promise<TargetSnapshot> {
  const files = await walkFiles(directory);
  const artifactNames = ['llms.txt', 'llms-full.txt', 'sitemap.xml', 'robots.txt', 'webmcp.json'];
  const artifacts = new Map<string, string>();
  for (const name of artifactNames) {
    const file = name === 'webmcp.json'
      ? findArtifact(files, name) ?? findArtifact(files, 'webmcp')
      : findArtifact(files, name);
    artifacts.set(name === 'webmcp.json' ? 'webmcp' : name, await readOptional(file));
  }
  // Agent-discovery artifacts under .well-known/ (or a route that emits them).
  const wellKnown: Array<[string, RegExp]> = [
    ['mcp-card', /well-known\/mcp\/server-card\.json|well-known\/mcp\.json/i],
    ['agent-card', /well-known\/agent-card\.json|well-known\/ai-plugin\.json/i],
    ['agent-skills', /well-known\/agent-skills(\/index)?\.json/i],
    ['api-catalog', /well-known\/api-catalog/i],
  ];
  for (const [key, pattern] of wellKnown) {
    const file = files.find(candidate => pattern.test(candidate.replaceAll('\\', '/')));
    artifacts.set(key, await readOptional(file));
  }
  const mirrors = files.filter(file => /\.md$|\.md\/route\.ts$/.test(file) && !/README|BUILD_BRIEF/i.test(file));
  const pages: PageSnapshot[] = [];
  const pageFiles = files.filter(file => {
    if (/\.html?$/.test(file)) return true;
    return PAGE_EXTENSIONS.has(path.extname(file)) && /(?:^|\/)(?:page|layout)\.(?:tsx|jsx|mdx)$/.test(file);
  });
  for (const file of pageFiles) {
    const source = await readOptional(file);
    if (source) pages.push({ url: file, source, isHtml: /\.html?$/.test(file) });
  }
  return { artifacts, pages, mirrors };
}

async function fetchText(url: string): Promise<{ status: number; text: string }> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    return { status: response.status, text: await response.text() };
  } catch {
    return { status: 0, text: '' };
  }
}

async function snapshotUrl(siteUrl: string): Promise<TargetSnapshot> {
  const base = siteUrl.replace(/\/+$/, '');
  const artifactPaths: Array<[string, string[]]> = [
    ['llms.txt', ['/llms.txt']],
    ['llms-full.txt', ['/llms-full.txt']],
    ['sitemap.xml', ['/sitemap.xml']],
    ['robots.txt', ['/robots.txt']],
    ['webmcp', ['/webmcp', '/webmcp.json']],
    ['mcp-card', ['/.well-known/mcp/server-card.json', '/.well-known/mcp.json']],
    ['agent-card', ['/.well-known/agent-card.json', '/.well-known/ai-plugin.json']],
    ['agent-skills', ['/.well-known/agent-skills/index.json', '/.well-known/agent-skills.json']],
    ['api-catalog', ['/.well-known/api-catalog']],
  ];
  const artifacts = new Map<string, string>();
  for (const [name, paths] of artifactPaths) {
    let text = '';
    for (const artifactPath of paths) {
      const result = await fetchText(`${base}${artifactPath}`);
      if (result.status >= 200 && result.status < 400 && result.text) {
        text = result.text;
        break;
      }
    }
    artifacts.set(name, text);
  }
  const pages: PageSnapshot[] = [];
  const home = await fetchText(base);
  if (home.text) pages.push({ url: base, source: home.text, isHtml: true });
  const sitemap = artifacts.get('sitemap.xml') ?? '';
  const sitemapUrls = [...sitemap.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)]
    .map(match => match[1])
    .filter(Boolean)
    .slice(0, 4);
  for (const url of sitemapUrls) {
    if (url === base) continue;
    const page = await fetchText(url);
    if (page.text) pages.push({ url, source: page.text, isHtml: true });
  }
  const mirrors: string[] = [];
  for (const page of pages.slice(0, 4)) {
    const mirror = await fetchText(`${page.url.replace(/\/$/, '')}.md`);
    if (mirror.status >= 200 && mirror.status < 400 && mirror.text) mirrors.push(`${page.url}.md`);
  }
  return { artifacts, pages, mirrors };
}

export async function auditTarget(target: string): Promise<AuditReport> {
  const targetStat = await stat(target).catch(() => undefined);
  const snapshot = targetStat?.isDirectory() ? await snapshotDirectory(target) : await snapshotUrl(target);
  const checks = buildChecks(snapshot);
  const score = scoreAuditChecks(checks);
  const topFixes = checks
    .filter(check => !check.passed)
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 5)
    .map(check => check.label);
  return {
    target,
    score,
    checks,
    pages: snapshot.pages.map(page => page.url),
    topFixes,
  };
}

export function formatAuditReport(report: AuditReport): string {
  const lines = [`${report.target}: ${report.score}/100`, ''];
  for (const check of report.checks) lines.push(`${check.passed ? 'PASS' : 'FAIL'}  ${check.label}: ${check.details}`);
  lines.push('', 'Top fixes:');
  if (report.topFixes.length) report.topFixes.forEach((fix, index) => lines.push(`${index + 1}. ${fix}`));
  else lines.push('None.');
  return lines.join('\n');
}
