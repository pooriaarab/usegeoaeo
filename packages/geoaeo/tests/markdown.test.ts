import { describe, expect, it, afterEach } from "vitest";
import { defineConfig } from "../src/config.js";
import { generateMdmirror } from "../src/generators/index.js";
import {
  estimateTokens,
  generateMarkdownPage,
  markdownHeaders,
  markdownResponse,
  type MarkdownPage,
} from "../src/markdown.js";
import { auditTarget, type AuditCheck } from "../src/audit.js";

const page: MarkdownPage = {
  title: "Pricing",
  summary: "What a seat costs.",
  canonical: "https://reply.example/pricing",
  lastUpdated: "2026-10-25",
  body: "## Plans\n\n- Pro: $9 a month.",
  related: [{ title: "Docs", url: "https://reply.example/docs" }],
};

const config = defineConfig({
  siteName: "Reply Kit",
  siteUrl: "https://reply.example",
  description: "Draft replies for social posts.",
  tools: [],
});

const liveUrl = "https://artifact.example";
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function check(report: { checks: AuditCheck[] }, id: string): AuditCheck {
  const found = report.checks.find((item) => item.id === id);
  if (!found) throw new Error(`${id} check missing`);
  return found;
}

describe("generateMarkdownPage", () => {
  it("writes the title, summary, canonical, and date in order", () => {
    const output = generateMarkdownPage(page);
    expect(output.startsWith("# Pricing\n\n> What a seat costs.\n\n")).toBe(true);
    expect(output).toContain("Canonical: https://reply.example/pricing");
    expect(output).toContain("Last updated: 2026-10-25");
    expect(output).toContain("## Plans");
  });

  it("lists related links with absolute URLs", () => {
    const output = generateMarkdownPage(page);
    expect(output).toContain("## Related");
    expect(output).toContain("- [Docs](https://reply.example/docs)");
  });

  it("leaves out the summary and related block when absent", () => {
    const output = generateMarkdownPage({ title: "T", canonical: "https://x.test/", body: "Body" });
    expect(output).not.toContain(">");
    expect(output).not.toContain("## Related");
  });
});

describe("markdownHeaders", () => {
  it("sets the markdown content type and keeps the page out of the index", () => {
    const headers = markdownHeaders(page);
    expect(headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    expect(headers.get("x-robots-tag")).toBe("noindex, follow");
    expect(headers.get("content-location")).toBe("https://reply.example/pricing");
  });

  it("reports the token estimate for the body it will send", () => {
    const body = generateMarkdownPage(page);
    expect(markdownHeaders(page).get("x-markdown-tokens")).toBe(String(estimateTokens(body)));
  });

  it("varies on Accept only for a negotiated response", () => {
    expect(markdownHeaders(page).get("vary")).toBeNull();
    expect(markdownHeaders(page, { negotiated: true }).get("vary")).toBe("Accept");
  });

  it("sets caching, CORS, and last-modified", () => {
    const headers = markdownHeaders(page);
    expect(headers.get("cache-control")).toContain("s-maxage=3600");
    expect(headers.get("access-control-allow-origin")).toBe("*");
    expect(headers.get("last-modified")).toBe("Sun, 25 Oct 2026 00:00:00 GMT");
  });
});

describe("markdownResponse", () => {
  it("returns the markdown body with the markdown headers", async () => {
    const response = markdownResponse(page);
    expect(await response.text()).toContain("# Pricing");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, follow");
  });
});

describe("generateMdmirror", () => {
  it("names the canonical page for the mirror", () => {
    const output = generateMdmirror(config, { path: "/pricing", title: "Pricing", body: "Plans." });
    expect(output).toContain("Canonical: https://reply.example/pricing");
    expect(output).toContain("> Draft replies for social posts.");
  });

  it("defaults to the site root and does not repeat the description", () => {
    const output = generateMdmirror(config);
    expect(output).toContain("Canonical: https://reply.example/");
    expect(output.match(/Draft replies for social posts\./g)).toHaveLength(1);
  });

  it("takes the date from the site config, so the CLI can reach it", () => {
    const configured = defineConfig({ ...config, lastUpdated: "2026-03-04" });
    expect(generateMdmirror(configured)).toContain("Last updated: 2026-03-04");
  });
});

describe("ai-summary audit check", () => {
  const pageWithSummary = `<html lang="en"><head><title>Reply Kit</title>
    <meta name="description" content="Draft replies.">
    <meta name="ai-summary" content="Reply Kit drafts replies for social posts.">
    </head><body><h1>Reply Kit</h1><p>${"word ".repeat(80)}</p></body></html>`;

  it("passes when every inspected page carries the tag", async () => {
    globalThis.fetch = async (input: RequestInfo | URL) =>
      String(input) === liveUrl || String(input) === `${liveUrl}/`
        ? new Response(pageWithSummary, {
            status: 200,
            headers: { "content-type": "text/html" },
          })
        : new Response("", { status: 404 });
    const report = await auditTarget(liveUrl);
    expect(check(report, "ai-summary").passed).toBe(true);
  });

  it("fails when the tag is missing", async () => {
    globalThis.fetch = async (input: RequestInfo | URL) =>
      String(input) === liveUrl || String(input) === `${liveUrl}/`
        ? new Response(pageWithSummary.replace(/<meta name="ai-summary"[^>]*>/, ""), {
            status: 200,
            headers: { "content-type": "text/html" },
          })
        : new Response("", { status: 404 });
    const report = await auditTarget(liveUrl);
    expect(check(report, "ai-summary").passed).toBe(false);
  });
});
