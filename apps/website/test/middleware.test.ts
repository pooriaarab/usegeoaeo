import { afterEach, describe, expect, it } from "vitest";
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

describe("browser security headers", () => {
  const previousPreview = process.env.WORKER_PREVIEW;

  afterEach(() => {
    if (previousPreview === undefined) delete process.env.WORKER_PREVIEW;
    else process.env.WORKER_PREVIEW = previousPreview;
  });

  it("denies framing and sets nosniff, referrer policy, and HSTS on HTTPS pages", () => {
    const response = responseFor("https://usegeoaeo.com/tools");
    const csp = response.headers.get("Content-Security-Policy") ?? "";

    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(response.headers.get("Strict-Transport-Security")).toBe("max-age=31536000");
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
