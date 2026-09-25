import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { GET as getServerCard } from "../app/.well-known/mcp/server-card.json/route";
import { GET as getAgentSkillsIndex } from "../app/.well-known/agent-skills/index.json/route";
import { GET as getSkillFile } from "../app/.well-known/agent-skills/[skill]/SKILL.md/route";
import { GET as getDocsMirror } from "../app/docs.md/route";
import { GET as getChecklistMirror } from "../app/checklist.md/route";
import { GET as getExamplesMirror } from "../app/examples.md/route";
import { GET as getToolsMirror } from "../app/tools.md/route";

const here = fileURLToPath(new URL(".", import.meta.url));

describe("GET /.well-known/mcp/server-card.json", () => {
  it("serves the repo server.json exactly", async () => {
    const canonical = await readFile(resolve(here, "../../../server.json"), "utf8");
    const response = getServerCard();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "application/json; charset=utf-8",
    );
    await expect(response.text()).resolves.toBe(canonical);
  });
});

describe("GET /.well-known/agent-skills/index.json", () => {
  it("lists the shipped geoaeo skill", async () => {
    const response = getAgentSkillsIndex();
    expect(response.status).toBe(200);
    const body = (await response.json()) as { skills: { id: string }[] };
    const ids = body.skills.map((skill) => skill.id);
    expect(ids).toContain("geoaeo");
  });
});

describe("GET /.well-known/agent-skills/[skill]/SKILL.md", () => {
  it("serves the canonical SKILL.md", async () => {
    const canonical = await readFile(
      resolve(here, "../../../.claude/skills/geoaeo/SKILL.md"),
      "utf8",
    );
    const response = await getSkillFile(new Request("https://usegeoaeo.com"), {
      params: Promise.resolve({ skill: "geoaeo" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    await expect(response.text()).resolves.toBe(canonical);
  });

  it("404s for a skill that does not exist", async () => {
    const response = await getSkillFile(new Request("https://usegeoaeo.com"), {
      params: Promise.resolve({ skill: "nope" }),
    });
    expect(response.status).toBe(404);
  });

  it("404s for prototype-property segments instead of resolving Object.prototype", async () => {
    for (const skill of ["__proto__", "constructor", "toString", "hasOwnProperty"]) {
      const response = await getSkillFile(new Request("https://usegeoaeo.com"), {
        params: Promise.resolve({ skill }),
      });
      expect(response.status).toBe(404);
    }
  });
});

describe("GET /docs.md", () => {
  it("serves a markdown mirror of the docs page", async () => {
    const response = getDocsMirror();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    await expect(response.text()).resolves.toContain("# geoaeo documentation");
  });
});

describe("GET /checklist.md", () => {
  it("serves a markdown mirror of the checklist page", async () => {
    const response = getChecklistMirror();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    await expect(response.text()).resolves.toContain("# GEO/AEO checklist");
  });
});

describe("GET /examples.md", () => {
  it("serves a markdown mirror of the examples page", async () => {
    const response = getExamplesMirror();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    await expect(response.text()).resolves.toContain(
      "# Examples — three GeoWeather targets, three audit scores",
    );
  });
});

describe("GET /tools.md", () => {
  it("serves a markdown mirror of the tools page", async () => {
    const response = getToolsMirror();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    await expect(response.text()).resolves.toContain("# Free GEO & AEO tools");
  });
});
