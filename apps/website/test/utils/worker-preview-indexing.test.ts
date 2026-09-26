import { describe, expect, it } from "vitest";

import { protectWorkerPreview } from "../../src/utils/worker-preview-indexing";

describe("Worker Preview indexing", () => {
  it("keeps production responses unchanged", () => {
    const response = new Response("production", {
      headers: { Link: "</llms.txt>; rel=describedby" },
    });
    expect(protectWorkerPreview("/", response, "false")).toBe(response);
    expect(response.headers.get("Link")).toContain("llms.txt");
  });

  it("blocks robots and discovery artifacts", async () => {
    const robots = protectWorkerPreview("/robots.txt", new Response(), "true");
    expect(await robots.text()).toBe("User-agent: *\nDisallow: /\n");
    expect(robots.headers.get("X-Robots-Tag")).toContain("noindex");

    for (const path of [
      "/llms.txt",
      "/agents.md",
      "/design.md",
      "/sitemap.xml",
      "/.well-known/agent-card.json",
    ]) {
      expect(protectWorkerPreview(path, new Response(), "1").status).toBe(404);
    }
  });

  it("hardens every other Preview response", () => {
    const response = new Response("preview", {
      headers: { Link: "</llms.txt>; rel=describedby" },
    });
    protectWorkerPreview("/docs", response, "true");
    expect(response.headers.get("Link")).toBeNull();
    expect(response.headers.get("Cache-Control")).toBe("private, no-store, max-age=0");
    expect(response.headers.get("X-Robots-Tag")).toContain("noimageindex");
  });
});
