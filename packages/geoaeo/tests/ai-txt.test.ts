import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { defineConfig } from "../src/config.js";
import { generateAiTxt } from "../src/generators/index.js";
import { GENERATED_ARTIFACTS } from "../src/commands/gen.js";
import { MCP_GEN_ARTIFACTS } from "../src/mcp.js";
import { auditTarget, type AuditCheck } from "../src/audit.js";

const config = defineConfig({
  siteName: "Reply Kit",
  siteUrl: "https://reply.example",
  description: "Draft replies for social posts.",
  tools: [],
  pages: ["pricing", "/faq/"],
});

const liveUrl = "https://artifact.example";
const originalFetch = globalThis.fetch;

function check(report: { checks: AuditCheck[] }, id: string): AuditCheck {
  const found = report.checks.find((item) => item.id === id);
  if (!found) throw new Error(`${id} check missing`);
  return found;
}

const dirs: string[] = [];

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("generateAiTxt", () => {
  it("states identity from the site config", () => {
    const output = generateAiTxt(config, { lastUpdated: "2026-10-25" });
    expect(output).toContain("[identity]");
    expect(output).toContain("name: Reply Kit");
    expect(output).toContain("url: https://reply.example");
    expect(output).toContain("description: Draft replies for social posts.");
  });

  it("states permissions, restrictions, and attribution", () => {
    const output = generateAiTxt(config);
    expect(output).toContain("[permissions]");
    expect(output).toContain("allow: quote with attribution");
    expect(output).toContain("[restrictions]");
    expect(output).toContain("disallow: fabricated quotes, reviews, or ratings");
    expect(output).toContain("cite: Reply Kit - https://reply.example");
  });

  it("scopes included config pages and excluded private paths", () => {
    const output = generateAiTxt(config);
    expect(output).toContain("include: /");
    expect(output).toContain("include: /pricing");
    expect(output).toContain("include: /faq");
    expect(output).toContain("exclude: /api/");
    expect(output).toContain("exclude: /admin/");
  });

  it("turns an absolute page URL into a scope path", () => {
    const absolute = defineConfig({
      ...config,
      pages: ["https://reply.example/pricing", "https://reply.example/docs/cli"],
    });
    const output = generateAiTxt(absolute);
    expect(output).toContain("include: /pricing");
    expect(output).toContain("include: /docs/cli");
    expect(output).not.toContain("include: /https://reply.example/pricing");
  });

  it("takes the contact and date from the site config", () => {
    const configured = defineConfig({
      ...config,
      contact: "hello@reply.example",
      lastUpdated: "2026-03-04",
    });
    const output = generateAiTxt(configured);
    expect(output).toContain("Last updated: 2026-03-04");
    expect(output).toContain("contact: hello@reply.example");
    expect(output).toContain("[contact]\nemail: hello@reply.example");
    expect(output).not.toContain("url: hello@reply.example");
  });

  it("lets a caller override the configured contact and date", () => {
    const configured = defineConfig({
      ...config,
      contact: "hello@reply.example",
      lastUpdated: "2026-03-04",
    });
    const output = generateAiTxt(configured, {
      contact: "https://reply.example/contact",
      lastUpdated: "2026-01-02",
    });
    expect(output).toContain("Last updated: 2026-01-02");
    expect(output).toContain("[contact]\nurl: https://reply.example/contact");
  });
});

describe("ai-txt parity", () => {
  it("is a CLI artifact", () => {
    expect(GENERATED_ARTIFACTS).toContain("ai-txt");
  });

  it("is an MCP artifact", () => {
    expect(MCP_GEN_ARTIFACTS).toContain("ai-txt");
  });
});

describe("ai-txt audit check", () => {
  it("passes a live ai.txt with identity and permissions sections", async () => {
    globalThis.fetch = async (input: RequestInfo | URL) =>
      String(input) === `${liveUrl}/ai.txt`
        ? new Response(generateAiTxt(config), { status: 200 })
        : new Response("", { status: 404 });
    const report = await auditTarget(liveUrl);
    expect(check(report, "ai-txt").passed).toBe(true);
  });

  it("fails a site with no ai.txt", async () => {
    globalThis.fetch = async () => new Response("", { status: 404 });
    const report = await auditTarget(liveUrl);
    expect(check(report, "ai-txt").passed).toBe(false);
  });

  it("passes a directory whose route calls generateAiTxt", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "geoaeo-ai-txt-"));
    dirs.push(dir);
    const routeDir = path.join(dir, "app", "ai.txt");
    mkdirSync(routeDir, { recursive: true });
    writeFileSync(
      path.join(routeDir, "route.ts"),
      "import { generateAiTxt } from 'geoaeo';\nexport function GET() { return new Response(generateAiTxt(siteConfig)); }\n",
    );
    const report = await auditTarget(dir);
    expect(check(report, "ai-txt").passed).toBe(true);
  });
});
