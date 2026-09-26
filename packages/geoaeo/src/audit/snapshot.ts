import path from 'node:path';
import type { PageSnapshot, TargetSnapshot } from './types.js';
import { PAGE_EXTENSIONS } from './constants.js';
import { findArtifact, readOptional, walkFiles } from './utils.js';

async function collectArtifacts(files: string[]): Promise<Map<string, string>> {
  const artifactNames = ['llms.txt', 'llms-full.txt', 'sitemap.xml', 'robots.txt', 'webmcp.json'];
  const artifacts = new Map<string, string>();
  for (const name of artifactNames) {
    const file = name === 'webmcp.json'
      ? findArtifact(files, name) ?? findArtifact(files, 'webmcp')
      : findArtifact(files, name);
    artifacts.set(name === 'webmcp.json' ? 'webmcp' : name, await readOptional(file));
  }
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
  return artifacts;
}

function collectMirrors(files: string[]): string[] {
  return files.filter(file => /\.md$|\.md\/route\.ts$/.test(file) && !/README|BUILD_BRIEF/i.test(file));
}

async function collectPages(files: string[]): Promise<PageSnapshot[]> {
  const pages: PageSnapshot[] = [];
  const pageFiles = files.filter(file => {
    if (/\.html?$/.test(file)) return true;
    return PAGE_EXTENSIONS.has(path.extname(file)) && /(?:^|\/)(?:page|layout)\.(?:tsx|jsx|mdx)$/.test(file);
  });
  for (const file of pageFiles) {
    const source = await readOptional(file);
    if (source) pages.push({ url: file, source, isHtml: /\.html?$/.test(file) });
  }
  return pages;
}

export async function snapshotDirectory(directory: string): Promise<TargetSnapshot> {
  const files = await walkFiles(directory);
  const artifacts = await collectArtifacts(files);
  const mirrors = collectMirrors(files);
  const pages = await collectPages(files);
  return { artifacts, pages, mirrors };
}

interface FetchedText {
  status: number;
  text: string;
  xRobotsTag: string;
}

async function fetchText(url: string): Promise<FetchedText> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    // response.url reflects the post-redirect URL: a target-served redirect can
    // otherwise carry the fetch off the pinned host while the result is still
    // recorded under the pinned URL. Compare host, not origin, so a same-host
    // http->https upgrade (routine on most sites) still passes. Empty
    // response.url (e.g. a stubbed Response in tests) skips this check rather
    // than throwing on new URL('').
    if (response.url && new URL(response.url).host !== new URL(url).host) {
      return { status: 0, text: '', xRobotsTag: '' };
    }
    const xRobotsTag = response.headers.get('x-robots-tag') ?? '';
    return { status: response.status, text: await response.text(), xRobotsTag };
  } catch {
    return { status: 0, text: '', xRobotsTag: '' };
  }
}

function pageFromFetch(url: string, fetched: FetchedText): PageSnapshot {
  return { url, source: fetched.text, isHtml: true, xRobotsTag: fetched.xRobotsTag };
}

async function fetchSingleArtifact(base: string, paths: string[]): Promise<string> {
  for (const artifactPath of paths) {
    const result = await fetchText(`${base}${artifactPath}`);
    if (result.status >= 200 && result.status < 400 && result.text) return result.text;
  }
  return '';
}

async function fetchArtifacts(base: string): Promise<Map<string, string>> {
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
    artifacts.set(name, await fetchSingleArtifact(base, paths));
  }
  return artifacts;
}

function parseSitemapUrls(sitemap: string): string[] {
  return [...sitemap.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)]
    .map(match => match[1])
    .filter(Boolean)
    .slice(0, 4);
}

/** Rewrite a sitemap <loc> onto the target's origin: keep the path, replace scheme, host and port. */
function resolveOnTarget(rawUrl: string, target: URL): string | undefined {
  try {
    const loc = new URL(rawUrl, target.href);
    return `${target.origin}${loc.pathname}${loc.search}${loc.hash}`;
  } catch {
    return undefined;
  }
}

async function fetchSitemapPages(base: string, sitemap: string): Promise<PageSnapshot[]> {
  const pages: PageSnapshot[] = [];
  const home = await fetchText(base);
  if (home.text) pages.push(pageFromFetch(base, home));
  let target: URL;
  try {
    target = new URL(base);
  } catch {
    return pages;
  }
  const seen = new Set<string>([target.href]);
  for (const rawUrl of parseSitemapUrls(sitemap)) {
    const url = resolveOnTarget(rawUrl, target);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const page = await fetchText(url);
    if (page.text) pages.push(pageFromFetch(url, page));
  }
  return pages;
}

async function fetchMirrors(pages: PageSnapshot[]): Promise<string[]> {
  const mirrors: string[] = [];
  for (const page of pages.slice(0, 4)) {
    const mirror = await fetchText(`${page.url.replace(/\/$/, '')}.md`);
    if (mirror.status >= 200 && mirror.status < 400 && mirror.text) mirrors.push(`${page.url}.md`);
  }
  return mirrors;
}

export async function snapshotUrl(siteUrl: string): Promise<TargetSnapshot> {
  const base = siteUrl.replace(/\/+$/, '');
  const artifacts = await fetchArtifacts(base);
  const sitemap = artifacts.get('sitemap.xml') ?? '';
  const pages = await fetchSitemapPages(base, sitemap);
  const mirrors = await fetchMirrors(pages);
  return { artifacts, pages, mirrors };
}
