import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The audit's check count is quoted in prose all over this repo, including in
 * llms.txt and llms-full.txt -- the artifacts geoaeo exists to generate
 * correctly. A wrong number there is served to the answer engines the product
 * is built to be cited by.
 *
 * It has already drifted once: 0.3.0 added four agent-discovery checks and
 * rebalanced the weights, the CHANGELOG recorded 24, and ten other places kept
 * saying 20 for a month. Nothing noticed, because nothing was looking.
 *
 * These tests derive the number from the source and then hold every other
 * surface to it.
 */

const REPO = resolve(__dirname, "../../..");
const CHECKS = join(REPO, "packages/geoaeo/src/audit/check-definitions.ts");

function definedChecks(): { id: string; weight: number }[] {
  const src = readFileSync(CHECKS, "utf8");
  return [...src.matchAll(/\{\s*id:\s*['"]([^'"]+)['"],\s*label:[\s\S]*?weight:\s*(\d+)/g)].map(
    (m) => ({
      id: m[1],
      weight: Number(m[2]),
    }),
  );
}

/** Every tracked text file that a reader or an answer engine can see. */
function proseFiles(): string[] {
  const roots = [
    "README.md",
    "AGENTS.md",
    "WEBSITE-CONTENT.md",
    "docs",
    "apps/website/app",
    "apps/website/src",
    "apps/website/public",
    "packages/geoaeo/README.md",
  ];
  const out: string[] = [];
  const walk = (p: string) => {
    let s;
    try {
      s = statSync(p);
    } catch {
      return;
    }
    if (s.isDirectory()) {
      if (/node_modules|\.next|\.open-next|dist/.test(p)) return;
      for (const e of readdirSync(p)) walk(join(p, e));
    } else if (/\.(md|mdx|txt|tsx?|jsonc?)$/.test(p)) {
      out.push(p);
    }
  };
  for (const r of roots) walk(join(REPO, r));
  return out;
}

describe("audit check count", () => {
  it("the weights sum to exactly 100", () => {
    const total = definedChecks().reduce((n, c) => n + c.weight, 0);
    expect(total).toBe(100);
  });

  it("every check id is unique", () => {
    const ids = definedChecks().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no doc or artifact quotes a stale check count", () => {
    const actual = definedChecks().length;
    expect(actual).toBeGreaterThan(0);

    // Spelled-out numbers count too. The first version of this test only
    // matched digits, and missed "Twenty weighted checks" in the root README
    // -- the one place a new reader looks first.
    const WORDS: Record<string, number> = {
      ten: 10,
      twelve: 12,
      fifteen: 15,
      sixteen: 16,
      eighteen: 18,
      twenty: 20,
      "twenty-one": 21,
      "twenty-two": 22,
      "twenty-three": 23,
      "twenty-four": 24,
      "twenty-five": 25,
      "twenty-six": 26,
      thirty: 30,
    };

    const stale: string[] = [];
    for (const file of proseFiles()) {
      const text = readFileSync(file, "utf8");
      const pattern = /([0-9]+|[a-z]+(?:-[a-z]+)?)[\s]+(?:weighted\s+)?checks\b/gi;
      for (const m of text.matchAll(pattern)) {
        const raw = m[1].toLowerCase();
        const n = /^[0-9]+$/.test(raw) ? Number(raw) : WORDS[raw];
        if (n === undefined) continue; // "these checks", "the checks", ...
        if (n !== actual) {
          stale.push(`${file.slice(REPO.length + 1)}: "${m[0].trim()}" (code defines ${actual})`);
        }
      }
    }
    expect(stale, `Stale check counts:\n${stale.join("\n")}`).toEqual([]);
  });
});
