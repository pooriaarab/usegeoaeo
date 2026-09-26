import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { GET } from "../app/design.md/route";

describe("GET /design.md", () => {
  it("serves the canonical design context exactly", async () => {
    const canonicalPath = resolve(
      fileURLToPath(new URL(".", import.meta.url)),
      "../../../.agents/design.md",
    );
    const canonical = await readFile(canonicalPath, "utf8");
    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
    await expect(response.text()).resolves.toBe(canonical);
  });
});
