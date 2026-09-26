#!/usr/bin/env node
// Codex copies the plugin tree and skips symlinks, so plugins/geoaeo/skills
// must hold real files. The canonical skill is .claude/skills/geoaeo.
// This script copies with dereference. `--check` fails the build on drift.
//
// The same run stamps packages/geoaeo/package.json onto the plugin manifests,
// both server.json version fields, and the README badge alt text. The agent
// card reads the generated server card, so it has no second copy of the number.

import {
  cpSync,
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
export const SOURCE_DIR = join(repoRoot, ".claude/skills/geoaeo");
export const TARGET_DIR = join(repoRoot, "plugins/geoaeo/skills/geoaeo");
const PACKAGE_JSON = join(repoRoot, "packages/geoaeo/package.json");

const VERSION_SINKS = [
  { rel: "plugins/geoaeo/.claude-plugin/plugin.json", kind: "json-version" },
  { rel: "plugins/geoaeo/.cursor-plugin/plugin.json", kind: "json-version" },
  { rel: "plugins/geoaeo/.codex-plugin/plugin.json", kind: "json-version" },
  { rel: "plugins/geoaeo/mcp.json", kind: "npm-pin" },
  { rel: "server.json", kind: "json-version" },
  { rel: "README.md", kind: "readme-badge" },
];

const AGENT_CARD_REL = "apps/website/app/.well-known/agent-card.json/route.ts";
const AGENT_CARD_IMPORT = 'from "../../../src/generated/server-card.generated"';

function listRelativeFiles(dir) {
  return readdirSync(dir, { recursive: true })
    .filter((rel) => {
      const stat = lstatSync(join(dir, rel));
      return stat.isFile() || stat.isSymbolicLink();
    })
    .toSorted();
}

// Node's recursive cp leaves a symlink in place on macOS even with
// dereference set. Codex skips symlinks, so the copy has to be a real file.
function materializeSymlinks(dir) {
  for (const rel of listRelativeFiles(dir)) {
    const targetPath = join(dir, rel);
    if (!lstatSync(targetPath).isSymbolicLink()) continue;
    const bytes = readFileSync(targetPath);
    rmSync(targetPath);
    writeFileSync(targetPath, bytes);
  }
}

export function syncPluginSkill(sourceDir = SOURCE_DIR, targetDir = TARGET_DIR) {
  rmSync(targetDir, { recursive: true, force: true });
  cpSync(sourceDir, targetDir, { recursive: true, dereference: true });
  materializeSymlinks(targetDir);
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function readPackageIdentity(packageJsonPath = PACKAGE_JSON) {
  const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  if (typeof pkg.name !== "string" || pkg.name.length === 0) {
    throw new Error(`No package name in ${packageJsonPath}`);
  }
  if (typeof pkg.version !== "string" || pkg.version.length === 0) {
    throw new Error(`No version string in ${packageJsonPath}`);
  }
  return { name: pkg.name, version: pkg.version };
}

function collectVersionFields(value, found = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectVersionFields(item, found);
    return found;
  }
  if (value === null || typeof value !== "object") return found;
  for (const [key, item] of Object.entries(value)) {
    if (key === "version" && typeof item === "string") found.push(item);
    else collectVersionFields(item, found);
  }
  return found;
}

function pinVersion(parsed, name) {
  const args = parsed?.mcpServers?.[name]?.args;
  if (!Array.isArray(args)) throw new Error(`mcp.json is missing ${name} args`);
  const prefix = `${name}@`;
  const pin = args.find((arg) => typeof arg === "string" && arg.startsWith(prefix));
  if (typeof pin !== "string") throw new Error(`mcp.json is missing the ${prefix} pin`);
  return pin.slice(prefix.length);
}

function badgeVersion(text, name) {
  const match = new RegExp(`alt="npm ${escapeRegExp(name)} ([^"]*)"`).exec(text);
  if (!match) throw new Error("README npm badge alt text is missing");
  return match[1];
}

function versionsIn(sink, text, name) {
  if (sink.kind === "json-version") return collectVersionFields(JSON.parse(text));
  if (sink.kind === "npm-pin") return [pinVersion(JSON.parse(text), name)];
  if (sink.kind === "readme-badge") return [badgeVersion(text, name)];
  throw new Error(`Unknown version sink: ${sink.kind}`);
}

function writeJsonVersions(text, version) {
  const found = collectVersionFields(JSON.parse(text));
  if (found.length === 0) throw new Error("JSON has no version field");
  if (found.every((value) => value === version)) return text;
  const next = text.replace(
    /("version"\s*:\s*")[^"]*(")/g,
    (_match, open, close) => `${open}${version}${close}`,
  );
  const updated = collectVersionFields(JSON.parse(next));
  if (updated.length !== found.length || updated.some((value) => value !== version)) {
    throw new Error("JSON version update did not apply");
  }
  return next;
}

function writeNpmPin(text, name, version) {
  const parsed = JSON.parse(text);
  if (pinVersion(parsed, name) === version) return text;
  const next = text.replace(
    new RegExp(`"${escapeRegExp(name)}@[^"]*"`),
    `"${name}@${version}"`,
  );
  if (pinVersion(JSON.parse(next), name) !== version) {
    throw new Error("mcp.json pin update did not apply");
  }
  return next;
}

function writeBadge(text, name, version) {
  if (badgeVersion(text, name) === version) return text;
  return text.replace(
    new RegExp(`alt="npm ${escapeRegExp(name)} [^"]*"`),
    `alt="npm ${name} ${version}"`,
  );
}

function writeSink(sink, text, name, version) {
  if (sink.kind === "json-version") return writeJsonVersions(text, version);
  if (sink.kind === "npm-pin") return writeNpmPin(text, name, version);
  if (sink.kind === "readme-badge") return writeBadge(text, name, version);
  throw new Error(`Unknown version sink: ${sink.kind}`);
}

function withSinkPath(sink, fn) {
  try {
    return fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${sink.rel}: ${message}`, { cause: error });
  }
}

export function checkVersions(root = repoRoot, identity = readPackageIdentity()) {
  for (const sink of VERSION_SINKS) {
    withSinkPath(sink, () => {
      const text = readFileSync(join(root, sink.rel), "utf8");
      for (const found of versionsIn(sink, text, identity.name)) {
        if (found !== identity.version) {
          throw new Error(
            `version drifted: found ${found}, package.json is ${identity.version}`,
          );
        }
      }
    });
  }
}

export function syncVersions(root = repoRoot, identity = readPackageIdentity()) {
  for (const sink of VERSION_SINKS) {
    const path = join(root, sink.rel);
    const text = readFileSync(path, "utf8");
    const next = withSinkPath(sink, () => writeSink(sink, text, identity.name, identity.version));
    if (next !== text) writeFileSync(path, next);
  }
}

export function checkAgentCard(root = repoRoot) {
  const text = readFileSync(join(root, AGENT_CARD_REL), "utf8");
  if (/version:\s*["']/.test(text)) {
    throw new Error(`${AGENT_CARD_REL} has a hand-written version string`);
  }
  const importsPackage = text.includes(AGENT_CARD_IMPORT);
  const usesPackageVersion = /JSON\.parse\(serverCardJson\)/.test(text);
  if (!importsPackage || !usesPackageVersion) {
    throw new Error(
      `${AGENT_CARD_REL} must read its version from the generated server card`,
    );
  }
}

function isMain() {
  const invoked = process.argv[1] && resolve(process.argv[1]);
  return invoked === fileURLToPath(import.meta.url);
}

function main() {
  if (process.argv.includes("--check")) {
    checkPluginSkill();
    checkVersions();
    checkAgentCard();
    process.stdout.write("Plugin skill matches .claude/skills/geoaeo\n");
    process.stdout.write("Versions match packages/geoaeo/package.json\n");
    return;
  }
  syncPluginSkill();
  syncVersions();
  process.stdout.write("Synced .claude/skills/geoaeo into plugins/geoaeo/skills/geoaeo\n");
  process.stdout.write("Synced package version into the plugin, server.json, and the README badge\n");
}

if (isMain()) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
