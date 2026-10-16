import path from "node:path";
import type { PageSnapshot, TargetSnapshot } from "./types.js";
import { PAGE_EXTENSIONS } from "./constants.js";
import {
  createFetchPolicy,
  destinationAllowed,
  openAudit,
  readLimited,
  type AuditFetchPolicy,
} from "./fetch-guard.js";
import { findArtifact, readOptional, walkFiles } from "./utils.js";

async function collectArtifacts(files: string[]): Promise<Map<string, string>> {
  const artifactNames = ["llms.txt", "llms-full.txt", "sitemap.xml", "robots.txt", "webmcp.json"];
  const artifacts = new Map<string, string>();
  for (const name of artifactNames) {
    const file =
      name === "webmcp.json"
        ? (findArtifact(files, name) ?? findArtifact(files, "webmcp"))
        : findArtifact(files, name);
    artifacts.set(name === "webmcp.json" ? "webmcp" : name, await readOptional(file));
  }
  const wellKnown: Array<[string, RegExp]> = [
    ["mcp-card", /well-known\/mcp\/server-card\.json|well-known\/mcp\.json/i],
    ["agent-card", /well-known\/agent-card\.json|well-known\/ai-plugin\.json/i],
    ["agent-skills", /well-known\/agent-skills(\/index)?\.json/i],
    ["api-catalog", /well-known\/api-catalog/i],
    ["poppy", /well-known\/poppy\.json/i],
  ];
  for (const [key, pattern] of wellKnown) {
    const file = files.find((candidate) => pattern.test(candidate.replaceAll("\\", "/")));
    artifacts.set(key, await readOptional(file));
  }
  return artifacts;
}

function collectMirrors(files: string[]): string[] {
  return files.filter(
    (file) => /\.md$|\.md\/route\.ts$/.test(file) && !/README|BUILD_BRIEF/i.test(file),
  );
}

async function collectPages(files: string[]): Promise<PageSnapshot[]> {
  const pages: PageSnapshot[] = [];
  const pageFiles = files.filter((file) => {
    if (/\.html?$/.test(file)) return true;
    return (
      PAGE_EXTENSIONS.has(path.extname(file)) &&
      /(?:^|\/)(?:page|layout)\.(?:tsx|jsx|mdx)$/.test(file)
    );
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
  contentType: string;
  xRobotsTag: string;
}

const EMPTY_FETCH: FetchedText = { status: 0, text: "", contentType: "", xRobotsTag: "" };
const MAX_REDIRECTS = 5;

async function fetchText(rawUrl: string, policy: AuditFetchPolicy): Promise<FetchedText> {
  try {
    let current = new URL(rawUrl);
    // First hop keeps the caller's string. new URL().href adds a slash stubs compare against.
    let requestUrl = rawUrl;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
      if (!(await destinationAllowed(current, policy))) return EMPTY_FETCH;
      const response = await openAudit(requestUrl, current, policy);
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        await response.body?.cancel().catch(() => undefined);
        if (!location || hop === MAX_REDIRECTS) return EMPTY_FETCH;
        current = new URL(location, current);
        requestUrl = current.href;
        continue;
      }
      if (response.url && new URL(response.url).host !== current.host) {
        await response.body?.cancel().catch(() => undefined);
        return EMPTY_FETCH;
      }
      const text = await readLimited(response, policy);
      if (text === undefined) return EMPTY_FETCH;
      return {
        status: response.status,
        text,
        contentType: response.headers.get("content-type") ?? "",
        xRobotsTag: response.headers.get("x-robots-tag") ?? "",
      };
    }
    return EMPTY_FETCH;
  } catch {
    return EMPTY_FETCH;
  }
}

function pageFromFetch(url: string, fetched: FetchedText): PageSnapshot {
  // Some fetch implementations (including existing test stubs) omit content-type.
  // Treat that as HTML only when the body looks like HTML; explicit non-HTML wins.
  const contentType = fetched.contentType.toLowerCase();
  const isHtml =
    !contentType ||
    /(?:^|;)\s*(?:text\/html|application\/xhtml\+xml)\b/i.test(contentType) ||
    /(?:^|;)\s*text\/plain\b/i.test(contentType);
  return { url, source: fetched.text, isHtml, xRobotsTag: fetched.xRobotsTag };
}

async function fetchSingleArtifact(base: string, paths: string[], policy: AuditFetchPolicy): Promise<string> {
  for (const artifactPath of paths) {
    const result = await fetchText(`${base}${artifactPath}`, policy);
    if (result.status >= 200 && result.status < 400 && result.text) return result.text;
  }
  return "";
}

async function fetchArtifacts(base: string, policy: AuditFetchPolicy): Promise<Map<string, string>> {
  const artifactPaths: Array<[string, string[]]> = [
    ["llms.txt", ["/llms.txt"]],
    ["llms-full.txt", ["/llms-full.txt"]],
    ["sitemap.xml", ["/sitemap.xml"]],
    ["robots.txt", ["/robots.txt"]],
    ["webmcp", ["/webmcp", "/webmcp.json"]],
    ["mcp-card", ["/.well-known/mcp/server-card.json", "/.well-known/mcp.json"]],
    ["agent-card", ["/.well-known/agent-card.json", "/.well-known/ai-plugin.json"]],
    ["agent-skills", ["/.well-known/agent-skills/index.json", "/.well-known/agent-skills.json"]],
    ["api-catalog", ["/.well-known/api-catalog"]],
    ["poppy", ["/.well-known/poppy.json"]],
  ];
  const artifacts = new Map<string, string>();
  for (const [name, paths] of artifactPaths) {
    artifacts.set(name, await fetchSingleArtifact(base, paths, policy));
  }
  return artifacts;
}

function parseSitemapUrls(sitemap: string): string[] {
  return [...sitemap.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)]
    .map((match) => match[1])
    .filter(Boolean);
}

function isSitemapIndex(sitemap: string): boolean {
  return /<sitemapindex\b/i.test(sitemap);
}

function markdownAlternate(source: string, pageUrl: string): string | undefined {
  const match = source
    .match(/<link\b[^>]*>/gi)
    ?.find(
      (tag) =>
        /\brel\s*=\s*["']?alternate\b/i.test(tag) &&
        /\btype\s*=\s*["']?text\/markdown\b/i.test(tag),
    );
  const href = match?.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
  if (!href) return undefined;
  try {
    return new URL(href, pageUrl).href;
  } catch {
    return undefined;
  }
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

async function fetchSitemapPages(base: string, sitemap: string, policy: AuditFetchPolicy): Promise<PageSnapshot[]> {
  const pages: PageSnapshot[] = [];
  const home = await fetchText(base, policy);
  if (home.text && pageFromFetch(base, home).isHtml) pages.push(pageFromFetch(base, home));
  let target: URL;
  try {
    target = new URL(base);
  } catch {
    return pages;
  }
  const seen = new Set<string>([target.href]);
  const sitemapUrls = parseSitemapUrls(sitemap);
  const pageUrls = isSitemapIndex(sitemap)
    ? (
        await Promise.all(
          sitemapUrls.slice(0, 4).map(async (rawUrl) => {
            const url = resolveOnTarget(rawUrl, target);
            if (!url) return [];
            return parseSitemapUrls((await fetchText(url, policy)).text);
          }),
        )
      )
        .flat()
        .slice(0, 4)
    : sitemapUrls.slice(0, 4);
  for (const rawUrl of pageUrls) {
    const url = resolveOnTarget(rawUrl, target);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    const page = await fetchText(url, policy);
    if (page.text && pageFromFetch(url, page).isHtml) pages.push(pageFromFetch(url, page));
  }
  return pages;
}

async function fetchMirrors(pages: PageSnapshot[], policy: AuditFetchPolicy): Promise<string[]> {
  const mirrors: string[] = [];
  for (const page of pages.slice(0, 4)) {
    const alternate = markdownAlternate(page.source, page.url);
    const fallbacks = [alternate, `${page.url.replace(/\/$/, "")}.md`];
    if (new URL(page.url).pathname === "/")
      fallbacks.push(`${page.url.replace(/\/$/, "")}/index.md`);
    for (const mirrorUrl of fallbacks.filter((url): url is string => Boolean(url))) {
      const mirror = await fetchText(mirrorUrl, policy);
      if (mirror.status >= 200 && mirror.status < 400 && mirror.text) {
        mirrors.push(mirrorUrl);
        break;
      }
    }
  }
  return mirrors;
}

export async function snapshotUrl(siteUrl: string): Promise<TargetSnapshot> {
  const base = siteUrl.replace(/\/+$/, "");
  let target: URL;
  try {
    target = new URL(base);
  } catch {
    return { artifacts: new Map(), pages: [], mirrors: [] };
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return { artifacts: new Map(), pages: [], mirrors: [] };
  }
  const policy = createFetchPolicy(target);
  const timer = setTimeout(() => policy.abort(), 20_000);
  timer.unref();
  try {
    const artifacts = await fetchArtifacts(base, policy);
    const sitemap = artifacts.get("sitemap.xml") ?? "";
    const pages = await fetchSitemapPages(base, sitemap, policy);
    const mirrors = await fetchMirrors(pages, policy);
    return { artifacts, pages, mirrors };
  } finally {
    clearTimeout(timer);
  }
}
