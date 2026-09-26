import assert from "node:assert/strict";
import { lstatSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, test } from "node:test";

import {
  TARGET_DIR,
  checkAgentCard,
  checkPluginSkill,
  checkVersions,
  syncPluginSkill,
  syncVersions,
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

const SINK_FIXTURES = [
  ["plugins/geoaeo/.claude-plugin/plugin.json", (version) => `{\n  "version": "${version}"\n}\n`],
  ["plugins/geoaeo/.cursor-plugin/plugin.json", (version) => `{\n  "version": "${version}"\n}\n`],
  ["plugins/geoaeo/.codex-plugin/plugin.json", (version) => `{\n  "version": "${version}"\n}\n`],
  [
    "plugins/geoaeo/mcp.json",
    (version) =>
      `{\n  "mcpServers": {\n    "geoaeo": {\n      "args": ["-y", "geoaeo@${version}", "mcp"]\n    }\n  }\n}\n`,
  ],
  [
    "server.json",
    (version) => `{\n  "version": "${version}",\n  "packages": [{ "version": "${version}" }]\n}\n`,
  ],
  ["README.md", (version) => `<img alt="npm geoaeo ${version}"/>\n`],
];

function writeSinks(root, version) {
  for (const [rel, render] of SINK_FIXTURES) {
    const path = join(root, rel);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, render(version));
  }
}

test("committed versions match packages/geoaeo/package.json", () => {
  checkVersions();
  checkAgentCard();
});

test("check fails when a generated version drifts", () => {
  const root = tempDir();
  writeSinks(root, "9.9.9");
  assert.throws(() => checkVersions(root, { name: "geoaeo", version: "0.5.0" }), /drifted/);
});

test("check fails when package.json is ahead of the copies", () => {
  const root = tempDir();
  writeSinks(root, "0.5.0");
  assert.throws(() => checkVersions(root, { name: "geoaeo", version: "0.6.0" }), /drifted/);
});

test("sync rewrites drifted versions and the JSON still parses", () => {
  const root = tempDir();
  writeSinks(root, "9.9.9");
  const identity = { name: "geoaeo", version: "0.5.0" };
  syncVersions(root, identity);
  checkVersions(root, identity);
  for (const [rel] of SINK_FIXTURES) {
    if (!rel.endsWith(".json")) continue;
    const parsed = JSON.parse(readFileSync(join(root, rel), "utf8"));
    assert.equal(typeof parsed, "object");
  }
  const server = JSON.parse(readFileSync(join(root, "server.json"), "utf8"));
  assert.equal(server.version, "0.5.0");
  assert.equal(server.packages[0].version, "0.5.0");
});

test("sync keeps file bytes when the version already matches", () => {
  const root = tempDir();
  writeSinks(root, "0.5.0");
  const rel = "plugins/geoaeo/.claude-plugin/plugin.json";
  const before = readFileSync(join(root, rel), "utf8");
  syncVersions(root, { name: "geoaeo", version: "0.5.0" });
  assert.equal(readFileSync(join(root, rel), "utf8"), before);
});

test("check fails when the agent card hard-codes a version", () => {
  const root = tempDir();
  const dir = join(root, "apps/website/app/.well-known/agent-card.json");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "route.ts"),
    [
      'import { serverCardJson } from "../../../src/generated/server-card.generated";',
      'const agentCard = { version: "9.9.9" };',
      "",
    ].join("\n"),
  );
  assert.throws(() => checkAgentCard(root), /hand-written/);
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
