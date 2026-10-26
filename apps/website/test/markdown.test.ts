import { readFileSync, readdirSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { generateAiTxt } from "geoaeo";
import siteConfig from "../geoaeo.config";
import { GET as getAiTxt } from "../app/ai.txt/route";
import { markdownNotFound } from "../src/utils/markdown-http";
import { pageAlternates, withAiSummary } from "../src/utils/page-alternates";

import { GET as getDocs } from "../app/docs.md/route";
import { GET as getAgents } from "../app/agents.md/route";
import { GET as getDesign } from "../app/design.md/route";
import { GET as getChecklist } from "../app/checklist.md/route";
import { GET as getExamples } from "../app/examples.md/route";
import { GET as getTools } from "../app/tools.md/route";
import { GET as getSkill } from "../app/.well-known/agent-skills/[skill]/SKILL.md/route";
import { GET, OPTIONS } from "../app/api/markdown/route";

describe("markdown HTTP responses", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("sets headers on all seven existing routes without changing their bodies", async () => {
    const responses = [getDocs, getAgents, getDesign, getChecklist, getExamples, getTools].map(
      (get) => get(),
    );
    responses.push(
      await getSkill(new Request("https://usegeoaeo.com"), {
        params: Promise.resolve({ skill: "geoaeo" }),
      }),
    );
    for (const response of responses) {
      const body = await response.text();
      expect(response.headers.get("X-Markdown-Tokens")).toBe(String(Math.ceil(body.length / 4)));
      expect(response.headers.get("X-Robots-Tag")).toBe("noindex, follow");
      expect(response.headers.get("Content-Location")).toMatch(/^https:\/\/usegeoaeo.com\//);
      expect(response.headers.get("Cache-Control")).toContain("s-maxage=3600");
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    }
  });

  it("shares the existing renderer for negotiation", async () => {
    const response = GET(new Request("https://usegeoaeo.com/api/markdown?path=/docs"));
    expect(await response.text()).toBe(await getDocs().text());
    expect(response.headers.get("Content-Location")).toBe("https://usegeoaeo.com/docs");
  });

  it.each(["/missing", "/admin", "/api/audit", "/docs/missing", "//evil.com", "http://"])(
    "returns a fixed, uncached 404 for %s",
    async (path) => {
      const endpoint = "https://usegeoaeo.com/api/markdown";
      for (const response of [
        GET(new Request(`${endpoint}?path=${encodeURIComponent(path)}`)),
        GET(new Request(endpoint, { headers: { "x-geoaeo-markdown-path": path } })),
      ]) {
        expect(response.status).toBe(404);
        expect(response.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
        expect(response.headers.get("X-Robots-Tag")).toBe("noindex, follow");
        expect(response.headers.get("Content-Location")).toBeNull();
        expect(response.headers.get("Cache-Control")).toBe("private, no-store");
        expect(await response.text()).toBe(await markdownNotFound().text());
      }
    },
  );

  it("hardens markdown 404s on Worker Previews", () => {
    vi.stubEnv("WORKER_PREVIEW", "true");
    expect(markdownNotFound().headers.get("X-Robots-Tag")).toContain("nofollow");
  });

  it("serves ai.txt from the site config", async () => {
    const response = getAiTxt();
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    expect(await response.text()).toBe(generateAiTxt(siteConfig));
  });

  it("keeps AI summaries and markdown alternates on every public page", () => {
    const app = new URL("../app/", import.meta.url);
    expect(readFileSync(new URL("layout.tsx", app), "utf8")).toContain('"ai-summary": description');
    expect(withAiSummary({ description: "Summary" }).other?.["ai-summary"]).toBe("Summary");
    for (const file of readdirSync(app, { recursive: true, encoding: "utf8" })) {
      if (!file.endsWith("page.tsx")) continue;
      const source = readFileSync(new URL(file, app), "utf8");
      expect(source, file).toMatch(/metadata[^=]*= withAiSummary\(/);
      expect(source, file).toContain("alternates: pageAlternates(");
      const path = `/${file.replace(/\/?page\.tsx$/, "")}`;
      expect(pageAlternates(path).types).toEqual({
        "text/markdown": path === "/" ? "/index.md" : `${path}.md`,
      });
    }
  });

  it("allows GET, HEAD, and OPTIONS for cross-origin readers", () => {
    const response = OPTIONS();
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("GET, HEAD, OPTIONS");
  });
});
