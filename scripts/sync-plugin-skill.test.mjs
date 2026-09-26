import assert from "node:assert/strict";
import { lstatSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, test } from "node:test";

import {
  TARGET_DIR,
  checkPluginSkill,
  syncPluginSkill,
} from "./sync-plugin-skill.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const PLUGIN_MANIFESTS = [
  ".claude-plugin/marketplace.json",
  ".cursor-plugin/marketplace.json",
  "plugins/geoaeo/mcp.json",
  "plugins/geoaeo/.claude-plugin/plugin.json",
  "plugins/geoaeo/.cursor-plugin/plugin.json",
  "plugins/geoaeo/.codex-plugin/plugin.json",
];

test("plugin manifests are valid JSON", () => {
  for (const rel of PLUGIN_MANIFESTS) {
    const contents = readFileSync(join(repoRoot, rel), "utf8");
    try {
      JSON.parse(contents);
    } catch (error) {
      assert.fail(`${rel} is not valid JSON: ${error.message}`);
    }
  }
});

const temps = [];
afterEach(() => {
  for (const dir of temps.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function tempDir() {
  const dir = mkdtempSync(join(tmpdir(), "geoaeo-plugin-skill-"));
  temps.push(dir);
  return dir;
}

test("committed plugin skill matches the canonical source and is not a symlink", () => {
  checkPluginSkill();
  assert.equal(lstatSync(join(TARGET_DIR, "SKILL.md")).isSymbolicLink(), false);
});

test("check fails when the generated copy drifts by one byte", () => {
  const source = join(tempDir(), "source");
  const target = join(tempDir(), "target");
  mkdirSync(source);
  writeFileSync(join(source, "SKILL.md"), "canonical\n");
  syncPluginSkill(source, target);
  checkPluginSkill(source, target);
  writeFileSync(join(target, "SKILL.md"), "canonicalX\n");
  assert.throws(() => checkPluginSkill(source, target), /drifted/);
});

test("check fails when the generated copy is a symlink", () => {
  const source = join(tempDir(), "source");
  const target = join(tempDir(), "target");
  mkdirSync(source);
  writeFileSync(join(source, "SKILL.md"), "canonical\n");
  mkdirSync(target);
  symlinkSync(join(source, "SKILL.md"), join(target, "SKILL.md"));
  assert.throws(() => checkPluginSkill(source, target), /symlink/);
});

test("sync writes a real file even when asked to copy a symlink", () => {
  const source = join(tempDir(), "source");
  const real = join(tempDir(), "real");
  const target = join(tempDir(), "target");
  mkdirSync(source);
  mkdirSync(real);
  writeFileSync(join(real, "SKILL.md"), "canonical\n");
  symlinkSync(join(real, "SKILL.md"), join(source, "SKILL.md"));
  syncPluginSkill(source, target);
  assert.equal(lstatSync(join(target, "SKILL.md")).isSymbolicLink(), false);
  checkPluginSkill(source, target);
});
