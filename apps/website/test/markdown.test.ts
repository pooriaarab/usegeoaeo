import { describe, expect, it } from "vitest";

import { GET as getDocs } from "../app/docs.md/route";
import { GET as getAgents } from "../app/agents.md/route";
import { GET as getDesign } from "../app/design.md/route";
import { GET as getChecklist } from "../app/checklist.md/route";
import { GET as getExamples } from "../app/examples.md/route";
import { GET as getTools } from "../app/tools.md/route";
import { GET as getSkill } from "../app/.well-known/agent-skills/[skill]/SKILL.md/route";
import { GET, OPTIONS } from "../app/api/markdown/route";

describe("markdown HTTP responses", () => {
  it("sets headers on all seven existing routes without changing their bodies", async () => {
    const responses = [getDocs(), getAgents(), getDesign(), getChecklist(), getExamples(), getTools(),
      await getSkill(new Request("https://usegeoaeo.com"), { params: Promise.resolve({ skill: "geoaeo" }) })];
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

  it("returns a markdown 404 for unknown and private pages", async () => {
    for (const path of ["/missing", "/admin", "/api/audit", "/docs/missing"]) {
      const response = GET(new Request(`https://usegeoaeo.com/api/markdown?path=${path}`));
      expect(response.status).toBe(404);
      expect(response.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
      expect(await response.text()).toContain("Not Found");
    }
  });

  it("allows GET, HEAD, and OPTIONS for cross-origin readers", () => {
    const response = OPTIONS();
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("GET, HEAD, OPTIONS");
  });
});
