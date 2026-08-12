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

function inspectPage(page: PageSnapshot) {
  const source = page.source;
  if (page.isHtml) {
    const $ = load(source);
    const visible = $.root().text();
    const jsonLdTypes = $('script[type="application/ld+json"]')
      .map((_, element) => $(element).text())
      .get()
      .flatMap(value => {
        try {
          const parsed = JSON.parse(value) as { '@type'?: string | string[] };
          return parsed['@type'] ? (Array.isArray(parsed['@type']) ? parsed['@type'] : [parsed['@type']]) : [];
        } catch {
          return [];
        }
      });
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
  };
}

function buildChecks(snapshot: TargetSnapshot): AuditCheck[] {
  const llms = snapshot.artifacts.get('llms.txt') ?? '';
  const llmsFull = snapshot.artifacts.get('llms-full.txt') ?? '';
  const sitemap = snapshot.artifacts.get('sitemap.xml') ?? '';
  const robots = snapshot.artifacts.get('robots.txt') ?? '';
  const webmcp = snapshot.artifacts.get('webmcp') ?? '';
  const pageSignals = snapshot.pages.map(inspectPage);
  const anyPage = (predicate: (page: ReturnType<typeof inspectPage>) => boolean) => pageSignals.some(predicate);
  const allPage = (predicate: (page: ReturnType<typeof inspectPage>) => boolean) => pageSignals.length > 0 && pageSignals.every(predicate);
  const jsonTypes = [...new Set(pageSignals.flatMap(page => page.jsonLdTypes))];
  const checks: AuditCheck[] = [
    { id: 'llms', label: '/llms.txt', passed: /generateLlms|#\s+\S+/i.test(llms), weight: 10, details: 'Short site map is present.' },
    { id: 'llms-full', label: '/llms-full.txt', passed: /generateLlmsFull|##\s+(What it is|Common questions)/i.test(llmsFull), weight: 10, details: 'Full site map is present.' },
    { id: 'sitemap', label: '/sitemap.xml', passed: /<urlset|generateSitemap|sitemap\s*\(/i.test(sitemap), weight: 10, details: 'A sitemap artifact is present.' },
    { id: 'robots', label: '/robots.txt', passed: /User-agent:|generateRobots/i.test(robots) && /Sitemap:|sitemap\s*:/i.test(robots), weight: 8, details: 'Robots policy includes a sitemap URL.' },
    { id: 'title', label: 'Page titles', passed: allPage(page => page.title), weight: 6, details: 'Every inspected page has a title.' },
    { id: 'description', label: 'Meta descriptions', passed: allPage(page => page.description), weight: 6, details: 'Every inspected page has a meta description.' },
    { id: 'canonical', label: 'Canonical links', passed: allPage(page => page.canonical), weight: 6, details: 'Every inspected page has a canonical URL.' },
    { id: 'open-graph', label: 'Open Graph tags', passed: anyPage(page => page.og), weight: 5, details: 'Open Graph tags are present.' },
    { id: 'twitter', label: 'Twitter tags', passed: anyPage(page => page.twitter), weight: 4, details: 'Twitter card tags are present.' },
    { id: 'json-ld', label: 'JSON-LD', passed: anyPage(page => page.jsonLd), weight: 10, details: jsonTypes.length ? `Types: ${jsonTypes.join(', ')}.` : 'No schema.org JSON-LD was found.' },
    { id: 'webmcp', label: 'WebMCP manifest', passed: /generateWebmcp|"tools"|tools\s*[:=]/i.test(webmcp), weight: 8, details: 'A WebMCP-style tool manifest is present.' },
    { id: 'markdown', label: 'Markdown mirrors', passed: snapshot.mirrors.length > 0, weight: 6, details: snapshot.mirrors.length ? `${snapshot.mirrors.length} mirror file(s) found.` : 'No page markdown mirrors were found.' },
    { id: 'answer-first', label: 'Answer-first content', passed: anyPage(page => page.h1 && page.earlyFaq), weight: 11, details: 'An inspected page has an H1 and an early FAQ signal.' },
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
