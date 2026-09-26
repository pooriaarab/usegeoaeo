#!/usr/bin/env node
// Codex copies the plugin tree and skips symlinks, so plugins/geoaeo/skills
// must hold real files. The canonical skill is .claude/skills/geoaeo.
// This script copies with dereference. `--check` fails the build on drift.

import { cpSync, existsSync, lstatSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
export const SOURCE_DIR = join(repoRoot, ".claude/skills/geoaeo");
export const TARGET_DIR = join(repoRoot, "plugins/geoaeo/skills/geoaeo");

function listRelativeFiles(dir) {
  return readdirSync(dir, { recursive: true })
    .filter((rel) => {
      const stat = lstatSync(join(dir, rel));
      return stat.isFile() || stat.isSymbolicLink();
    })
    .toSorted();
}

export function syncPluginSkill(sourceDir = SOURCE_DIR, targetDir = TARGET_DIR) {
  rmSync(targetDir, { recursive: true, force: true });
  cpSync(sourceDir, targetDir, { recursive: true, dereference: true });
}

export function checkPluginSkill(sourceDir = SOURCE_DIR, targetDir = TARGET_DIR) {
  if (!existsSync(targetDir)) {
    throw new Error(`Missing generated skill directory: ${targetDir}`);
  }
  if (lstatSync(targetDir).isSymbolicLink()) {
    throw new Error(`Plugin skill must be a real directory, not a symlink: ${targetDir}`);
  }

  const sourceFiles = listRelativeFiles(sourceDir);
  const targetFiles = listRelativeFiles(targetDir);
  if (sourceFiles.join("\0") !== targetFiles.join("\0")) {
    throw new Error(
      `Plugin skill file list drifted from .claude/skills/geoaeo (${sourceFiles.join(", ")} vs ${targetFiles.join(", ")})`,
    );
  }

  for (const rel of targetFiles) {
    const targetPath = join(targetDir, rel);
    if (lstatSync(targetPath).isSymbolicLink()) {
      throw new Error(`Plugin skill must be a real file, not a symlink: ${targetPath}`);
    }
    const sourceBytes = readFileSync(join(sourceDir, rel));
    const targetBytes = readFileSync(targetPath);
    if (!sourceBytes.equals(targetBytes)) {
      throw new Error(`${rel} drifted from .claude/skills/geoaeo`);
    }
  }
}

function isMain() {
  const invoked = process.argv[1] && resolve(process.argv[1]);
  return invoked === fileURLToPath(import.meta.url);
}

function main() {
  if (process.argv.includes("--check")) {
    checkPluginSkill();
    process.stdout.write("Plugin skill matches .claude/skills/geoaeo\n");
    return;
  }
  syncPluginSkill();
  process.stdout.write("Synced .claude/skills/geoaeo into plugins/geoaeo/skills/geoaeo\n");
}

if (isMain()) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
