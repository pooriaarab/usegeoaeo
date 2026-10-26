import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { config, middleware } from "../middleware";

describe("middleware matcher", () => {
  it("still runs the middleware for favicon.ico and _next/image", () => {
    // Regression guard: these paths must stay covered so
    // protectWorkerPreview can harden them during Worker Previews.
    expect(config.matcher).not.toContain("favicon.ico");
    expect(config.matcher).not.toContain("_next/image");
  });

  it("excludes _next/static for performance", () => {
    expect(config.matcher).toContain("_next/static");
  });
});

function responseFor(url: string, headers?: HeadersInit) {
  return middleware(new NextRequest(url, headers ? { headers } : undefined));
}

describe("markdown negotiation", () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each<[string, string | undefined, string]>([
    ["/", "text/markdown", "/"],
    ["/docs/harnesses/claude-code", "text/markdown", "/docs/harnesses/claude-code"],
    ["/brand", "text/markdown", "/brand"],
    ["/docs/install.md", undefined, "/docs/install"],
    ["/index.md", undefined, "/"],
    ...[
      "text/markdown",
      "text/html;q=0.5, text/markdown;q=0.9",
      "TEXT/MARKDOWN; charset=utf-8; q=0.8, text/html;q=0.2",
      "text/*;q=0.5, text/markdown;q=0.9",
    ].map((accept): [string, string, string] => ["/docs", accept, "/docs"]),
  ])("rewrites %s with Accept %s", (path, accept, page) => {
    const response = responseFor(`https://usegeoaeo.com${path}`, accept ? { accept } : undefined);
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      `https://usegeoaeo.com/api/markdown?path=${encodeURIComponent(page)}`,
    );
    expect(response.headers.get("Vary")).toContain("Accept");
    expect(response.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
  });

  it.each([
    undefined,
    "*/*",
    "text/*",
    "text/html",
    "text/markdown;q=0",
    "text/markdown, text/html",
    "text/markdown;q=0.5, text/html;q=0.9",
    "text/markdown;q=0.5, */*;q=0.9",
    "text/markdown;q=invalid",
    "text/markdown;q=1.1",
    "text/markdown;q=0.8, text/html;q=1, text/html;q=0.1",
  ])("keeps HTML without a higher markdown preference: %s", (accept) => {
    const response = responseFor("https://usegeoaeo.com/docs", accept ? { accept } : undefined);
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get("Vary")).toContain("Accept");
  });

  it.each([
    "/llms.txt",
    "/llms-full.txt",
    "/ai.txt",
    "/robots.txt",
    "/sitemap.xml",
    "/api/audit",
    "/_next/image",
    "/.well-known/agent-card.json",
    "/favicon.svg",
    "/docs.md",
    "/agents.md",
    "/design.md",
    "/auth.md",
    "/missing",
    "/admin",
  ])("does not negotiate excluded or unknown paths: %s", (path) => {
    const response = responseFor(`https://usegeoaeo.com${path}`, { accept: "text/markdown" });
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it.each(["POST", "HEAD", "OPTIONS"])("does not rewrite %s requests", (method) => {
    const response = middleware(
      new NextRequest("https://usegeoaeo.com/tools", {
        method,
        headers: { accept: "text/markdown" },
      }),
    );
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("keeps Worker Preview protections on negotiated pages and ai.txt", () => {
    vi.stubEnv("WORKER_PREVIEW", "true");
    const response = responseFor("https://preview.example/docs", { accept: "text/markdown" });
    expect(response.headers.get("X-Robots-Tag")).toContain("nofollow");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(response.headers.get("Link")).toBeNull();
    expect(responseFor("https://preview.example/ai.txt").status).toBe(404);
  });

  it("advertises all discovery files on public pages", () => {
    const link = responseFor("https://usegeoaeo.com/docs").headers.get("Link");
    for (const path of ["llms.txt", "llms-full.txt", "ai.txt"]) {
      expect(link).toContain(`</${path}>; rel="describedby"`);
    }
  });
});

describe("browser security headers", () => {
  const previousPreview = process.env.WORKER_PREVIEW;

  afterEach(() => {
    vi.unstubAllEnvs();
    if (previousPreview === undefined) delete process.env.WORKER_PREVIEW;
    else process.env.WORKER_PREVIEW = previousPreview;
  });

  it("denies framing and sets nosniff, referrer policy, and HSTS on HTTPS pages", () => {
    vi.stubEnv("NODE_ENV", "production");
    const response = responseFor("https://usegeoaeo.com/tools");
    const csp = response.headers.get("Content-Security-Policy") ?? "";

    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toMatch(/script-src 'self' 'unsafe-inline'(;|$)/);
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(response.headers.get("Strict-Transport-Security")).toBe("max-age=31536000");
  });

  it("allows eval in development for Next.js client bundles", () => {
    vi.stubEnv("NODE_ENV", "development");
    const response = responseFor("https://usegeoaeo.com/tools");
    const csp = response.headers.get("Content-Security-Policy") ?? "";

    expect(csp).toMatch(/script-src 'self' 'unsafe-inline' 'unsafe-eval'(;|$)/);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("omits HSTS on cleartext requests and keeps the home Link header", () => {
    const response = responseFor("http://usegeoaeo.com/");

    expect(response.headers.get("Strict-Transport-Security")).toBeNull();
    expect(response.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Link")).toContain("llms.txt");
  });

  it("sets HSTS when the edge forwards HTTPS", () => {
    const response = responseFor("http://usegeoaeo.com/docs", {
      "x-forwarded-proto": "https",
    });

    expect(response.headers.get("Strict-Transport-Security")).toBe("max-age=31536000");
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("keeps the same headers when Worker Preview replaces the response", () => {
    process.env.WORKER_PREVIEW = "true";
    const response = responseFor("https://preview.example/llms.txt");

    expect(response.status).toBe(404);
    expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
    expect(response.headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Strict-Transport-Security")).toBe("max-age=31536000");
  });
});
