import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import siteConfig from "../../geoaeo.config";

const CONTENT_PATHS = new Set([
  ...(siteConfig.pages ?? []),
  "/brand",
  "/docs/install",
  "/docs/cli",
  "/docs/mcp",
  ...["claude-code", "codex", "cursor", "windsurf", "gemini-cli", "github-copilot", "continue"].map(
    (slug) => `/docs/harnesses/${slug}`,
  ),
]);
const EXISTING_MARKDOWN = new Set(
  ["agents", "design", "docs", "checklist", "examples", "tools"].map((name) => `/${name}.md`),
);

export function isMarkdownPage(path: string) {
  return CONTENT_PATHS.has(path);
}

function mediaQuality(range: string): [string, number] {
  const media = range.split(";")[0].trim().toLowerCase();
  const value = range.match(/;\s*q\s*=\s*([^;]*)/i)?.[1].trim() ?? "1";
  return [media.trim(), /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(value) ? Number(value) : 0];
}

function prefersMarkdown(accept: string | null) {
  const qualities = new Map<string, number>();
  for (const range of accept?.split(",") ?? []) {
    const [type, quality] = mediaQuality(range);
    qualities.set(type, Math.max(quality, qualities.get(type) ?? 0));
  }
  const markdown = qualities.get("text/markdown") ?? 0;
  const html = qualities.get("text/html") ?? qualities.get("text/*") ?? qualities.get("*/*") ?? 0;
  return markdown > html;
}

function markdownPage(path: string) {
  if (EXISTING_MARKDOWN.has(path)) return null;
  const page = path === "/index.md" ? "/" : path.replace(/\.md$/, "");
  return isMarkdownPage(page) ? page : null;
}

export function negotiateMarkdown(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) return NextResponse.next();
  // The allowlist leaves real .md routes and every non-content endpoint alone.
  const page = markdownPage(path);
  if (!page) return NextResponse.next();
  let response = NextResponse.next();
  if (
    ["GET", "HEAD"].includes(request.method) &&
    (path.endsWith(".md") || prefersMarkdown(request.headers.get("accept")))
  ) {
    const url = new URL("/api/markdown", request.nextUrl.origin);
    url.searchParams.set("path", page);
    // Carry the selected page even when the handler sees the original URL.
    const headers = new Headers(request.headers);
    headers.set("x-geoaeo-markdown-path", page);
    response = NextResponse.rewrite(url, { request: { headers } });
  }
  response.headers.set("Vary", "Accept");
  return response;
}
