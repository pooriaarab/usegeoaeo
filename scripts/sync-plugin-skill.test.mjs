import assert from "node:assert/strict";
import { lstatSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, test } from "node:test";

import {
  TARGET_DIR,
  checkPluginSkill,
  syncPluginSkill,
} from "./sync-plugin-skill.mjs";

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
