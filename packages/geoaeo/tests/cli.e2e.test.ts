import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "dist", "cli.js");

function run(args: string[], cwd = root): string {
  return execFileSync("node", [cli, ...args], { encoding: "utf8", cwd });
}

describe("geoaeo CLI end-to-end", () => {
  it("has a built binary (run npm run build first)", () => {
    expect(existsSync(cli)).toBe(true);
  });

  it("prints the version from package.json", () => {
    const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
    expect(run(["--version"]).trim()).toBe(pkg.version);
  });

  it("audits a fixture and returns a scored report whose weights sum to 100", () => {
    const report = JSON.parse(run(["audit", "examples/static-html", "--json"]));
    expect(typeof report.score).toBe("number");
    expect(report.score).toBeGreaterThan(0);
    expect(Array.isArray(report.checks)).toBe(true);
    expect(report.checks.reduce((sum: number, c: { weight: number }) => sum + c.weight, 0)).toBe(
      100,
    );
  });

  it("generates an Organization JSON-LD from a config directory", () => {
    const out = run(
      ["gen", "jsonld", "--type", "organization"],
      path.join(root, "examples", "static-html"),
    );
    expect(out).toContain('"@type": "Organization"');
  });

  it("exits non-zero for --ci below the threshold", () => {
    expect(() => run(["audit", "examples/static-html", "--ci", "--min-score", "200"])).toThrow();
  });
});
