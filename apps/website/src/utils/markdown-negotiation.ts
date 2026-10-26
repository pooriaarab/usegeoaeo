import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const CONTENT_PATHS = new Set([
  "/",
  "/brand",
  "/docs",
  "/checklist",
  "/examples",
  "/tools",
  "/docs/install",
  "/docs/cli",
  "/docs/mcp",
  ...["claude-code", "codex", "cursor", "windsurf", "gemini-cli", "github-copilot", "continue"].map(
    (slug) => `/docs/harnesses/${slug}`,
  ),
]);
const EXISTING_MARKDOWN = new Set([
  "/agents.md",
  "/design.md",
  "/docs.md",
  "/checklist.md",
  "/examples.md",
  "/tools.md",
]);

export function isMarkdownPage(path: string) {
  return CONTENT_PATHS.has(path);
}

function mediaQuality(range: string): [string, number] {
  const [media, ...parameters] = range.toLowerCase().trim().split(";");
  const value =
    parameters
      .map((parameter) => parameter.trim())
      .find((parameter) => /^q\s*=/.test(parameter))
      ?.split("=")[1]
      ?.trim() ?? "1";
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
  let response;
  if (path.endsWith(".md") || prefersMarkdown(request.headers.get("accept"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/markdown";
    url.search = "";
    url.searchParams.set("path", page);
    // Carry the selected page even when the handler sees the original URL.
    const headers = new Headers(request.headers);
    headers.set("x-geoaeo-markdown-path", page);
    response = NextResponse.rewrite(url, { request: { headers } });
  } else {
    response = NextResponse.next();
  }
  response.headers.set("Vary", "Accept");
  return response;
}
