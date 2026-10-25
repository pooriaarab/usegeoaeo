import { describe, expect, it } from "vitest";
import { defineConfig } from "../src/config.js";
import {
  AI_AGENTS,
  AI_SEARCH_AGENTS,
  AI_TRAINING_AGENTS,
  generateLlms,
  generateLlmsFull,
  generateRobots,
} from "../src/generators/index.js";
import { blockedAgents } from "../src/audit/robots-policy.js";

const config = defineConfig({
  siteName: "Reply Kit",
  siteUrl: "https://reply.example",
  description: "Draft replies for social posts.",
  tools: [{ name: "Rate calculator", url: "/tools/rate", description: "Calculate interaction rate." }],
  pages: ["pricing", "/faq/"],
});

describe("robots.txt AI crawler policy", () => {
  it("allows every answer-engine crawler by default", () => {
    const output = generateRobots(config);
    for (const agent of AI_SEARCH_AGENTS) {
      expect(output).toContain(`User-agent: ${agent}\nAllow: /`);
    }
  });

  it("names the answer engines the prompt requires", () => {
    expect(AI_SEARCH_AGENTS).toContain("Claude-SearchBot");
    expect(AI_SEARCH_AGENTS).toContain("Claude-User");
    expect(AI_SEARCH_AGENTS).toContain("Perplexity-User");
    expect(AI_SEARCH_AGENTS).toContain("OAI-SearchBot");
  });

  it("keeps training crawlers separate from search crawlers", () => {
    expect(AI_AGENTS).toEqual([...AI_SEARCH_AGENTS, ...AI_TRAINING_AGENTS]);
    for (const agent of AI_TRAINING_AGENTS) {
      expect(AI_SEARCH_AGENTS).not.toContain(agent);
    }
  });

  it("allows training crawlers by default", () => {
    const output = generateRobots(config);
    expect(output).toContain(`User-agent: ${AI_TRAINING_AGENTS[0]}\nAllow: /`);
  });

  it("disallows only training crawlers when the site opts out", () => {
    const optedOut = defineConfig({ ...config, allowTrainingCrawlers: false });
    const output = generateRobots(optedOut);
    expect(output).toContain(`User-agent: ${AI_TRAINING_AGENTS[0]}\nDisallow: /`);
    expect(output).toContain(`User-agent: ${AI_SEARCH_AGENTS[0]}\nAllow: /`);
    expect(blockedAgents(output, AI_SEARCH_AGENTS)).toEqual([]);
    expect(blockedAgents(output, AI_TRAINING_AGENTS).length).toBe(AI_TRAINING_AGENTS.length);
  });

  it("disallows private paths for every agent", () => {
    const output = generateRobots(config);
    expect(output).toContain("User-agent: *\nAllow: /\nDisallow: /api/");
    expect(output).toContain("Disallow: /auth/");
    for (const agent of [...AI_SEARCH_AGENTS, ...AI_TRAINING_AGENTS]) {
      expect(blockedAgents(output, [agent], "/auth/")).toEqual([agent]);
    }
  });

  it("points at llms.txt and ai.txt and keeps the sitemap line", () => {
    const output = generateRobots(config);
    expect(output).toContain("Keep this file in sync with /llms.txt and /ai.txt.");
    expect(output).toContain("Sitemap: https://reply.example/sitemap.xml");
  });
});

describe("llms.txt for agents", () => {
  it("lists core pages with absolute URLs", () => {
    const output = generateLlms(config);
    expect(output).toContain("## Core pages");
    expect(output).toContain("- [Home](https://reply.example/): Draft replies for social posts.");
    expect(output).toContain("- [pricing](https://reply.example/pricing): The pricing page.");
    expect(output).toContain("- [faq](https://reply.example/faq): The faq page.");
  });

  it("links the machine-readable files", () => {
    const output = generateLlms(config);
    expect(output).toContain("## Machine-readable");
    expect(output).toContain("[Full content](https://reply.example/llms-full.txt)");
    expect(output).toContain("[Sitemap](https://reply.example/sitemap.xml)");
    expect(output).toContain("[AI usage policy](https://reply.example/ai.txt)");
  });
});

describe("llms-full.txt for agents", () => {
  it("states a generation date", () => {
    const output = generateLlmsFull(config, { generated: "2026-10-25" });
    expect(output).toContain("Generated: 2026-10-25");
  });

  it("marks each block with its source URL", () => {
    const output = generateLlmsFull(config, { generated: "2026-10-25" });
    expect(output).toContain("<!-- source: https://reply.example/ -->");
    expect(output).toContain("<!-- source: https://reply.example/pricing -->");
    expect(output).toContain("<!-- source: https://reply.example/faq -->");
  });

  it("keeps the FAQ answers and the tool links", () => {
    const output = generateLlmsFull(config, { generated: "2026-10-25" });
    expect(output).toContain("## Common questions");
    expect(output).toContain("[Rate calculator](https://reply.example/tools/rate)");
  });
});
