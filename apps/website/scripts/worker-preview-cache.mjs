import { createHash } from "node:crypto";
import { open, readFile, unlink } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { canonical, ID, listAll, request, required } from "./worker-preview-shared.mjs";
import { verifyAccess } from "./worker-preview-access.mjs";

export { listAll } from "./worker-preview-shared.mjs";
export { validateAccess, verifyAccess } from "./worker-preview-access.mjs";

const NAME = /^use-[0-9]+-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PREFIX = "usegeoaeo-preview-";
const PLACEHOLDER = "__PREVIEW_KV_ID__";
const FORBIDDEN = new Set([
  "d1_databases",
  "r2_buckets",
  "durable_objects",
  "services",
  "queues",
  "hyperdrive",
  "vectorize",
  "ai",
  "browser",
  "mtls_certificates",
  "dispatch_namespaces",
  "analytics_engine_datasets",
  "workflows",
  "pipelines",
  "secrets_store_secrets",
  "unsafe",
  "env",
  "routes",
]);
const CONFIG_KEYS = new Set([
  "$schema",
  "name",
  "main",
  "compatibility_date",
  "compatibility_flags",
  "minify",
  "assets",
  "observability",
  "placement",
  "kv_namespaces",
  "vars",
  "workers_dev",
  "preview_urls",
]);

export function validatePreviewName(name) {
  if (!NAME.test(name) || name.length > 63) throw new Error(`Unsafe Preview name: ${name}`);
}

export function cacheTitle(name) {
  validatePreviewName(name);
  const title = `${PREFIX}${name}`;
  if (title.length <= 64) return title;
  const hash = createHash("sha256").update(name).digest("hex").slice(0, 8);
  return `${PREFIX}${name.slice(0, 64 - PREFIX.length - 9)}-${hash}`;
}

function scanBindings(value, found = []) {
  if (!value || typeof value !== "object") return found;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN.has(key)) throw new Error(`Unapproved Preview binding: ${key}`);
    if (key === "kv_namespaces") found.push(child);
    scanBindings(child, found);
  }
  return found;
}

export function renderRuntimeConfig(source, namespaceId) {
  if (!ID.test(namespaceId) || source.split(PLACEHOLDER).length !== 2)
    throw new Error("Expected one safe Preview KV placeholder");
  let config;
  try {
    config = JSON.parse(source.replace(PLACEHOLDER, namespaceId));
  } catch {
    throw new Error("Preview runtime template must be strict JSON");
  }
  if (
    !config ||
    Array.isArray(config) ||
    Object.keys(config).some((key) => !CONFIG_KEYS.has(key)) ||
    canonical(config.vars) !== canonical({ ENVIRONMENT: "preview", WORKER_PREVIEW: "true" })
  )
    throw new Error("Preview runtime contains an unapproved setting");
  const bindings = scanBindings(config);
  const binding = bindings[0]?.[0];
  if (
    bindings.length !== 1 ||
    bindings[0] !== config.kv_namespaces ||
    bindings[0].length !== 1 ||
    canonical(binding) !== canonical({ binding: "NEXT_INC_CACHE_KV", id: namespaceId })
  )
    throw new Error("Preview runtime must contain only the isolated cache binding");
  return `${JSON.stringify(config, null, 2)}\n`;
}

async function namespaces(account, token) {
  return listAll(`/accounts/${account}/storage/kv/namespaces`, token);
}

function exactLive(items, record) {
  const byId = items.filter((item) => item.id === record.id);
  const byTitle = items.filter((item) => item.title === record.title);
  if (!byId.length && !byTitle.length) return undefined;
  if (byId.length !== 1 || byTitle.length !== 1 || byId[0] !== byTitle[0])
    throw new Error("Recorded Preview KV identity does not match Cloudflare");
  return byId[0];
}

async function writeExclusive(path, content, written) {
  const handle = await open(path, "wx");
  written.push(path);
  try {
    await handle.writeFile(content);
  } finally {
    await handle.close();
  }
}

export async function prepareCache(name, sourcePath, outputPath, statePath) {
  validatePreviewName(name);
  await verifyAccess();
  const account = required("CLOUDFLARE_ACCOUNT_ID");
  const token = required("CLOUDFLARE_API_TOKEN");
  const title = cacheTitle(name);
  const source = await readFile(sourcePath, "utf8");
  renderRuntimeConfig(source, "a".repeat(32));
  const existing = (await namespaces(account, token)).filter((item) => item.title === title);
  if (existing.length > 1) throw new Error("Duplicate Preview KV namespaces");
  let resource = existing[0];
  let created = false;
  const written = [];
  try {
    if (!resource) {
      resource = (
        await request(`/accounts/${account}/storage/kv/namespaces`, token, {
          method: "POST",
          body: JSON.stringify({ title }),
        })
      ).result;
      created = true;
    }
    if (!ID.test(resource?.id) || resource.title !== title)
      throw new Error("Cloudflare returned an unsafe Preview KV namespace");
    const confirmed = (await namespaces(account, token)).filter((item) => item.title === title);
    if (confirmed.length !== 1 || confirmed[0].id !== resource.id)
      throw new Error("Concurrent Preview KV preparation detected");
    const state = { previewName: name, cache: { id: resource.id, title } };
    await writeExclusive(outputPath, renderRuntimeConfig(source, resource.id), written);
    await writeExclusive(statePath, `${JSON.stringify(state, null, 2)}\n`, written);
    return state;
  } catch (error) {
    const failures = [error];
    if (created) {
      try {
        const live = (await namespaces(account, token)).find((item) => item.id === resource.id);
        if (live && live.title !== title)
          throw new Error("Preview KV namespace title changed unexpectedly", { cause: error });
        if (live)
          await request(`/accounts/${account}/storage/kv/namespaces/${live.id}`, token, {
            method: "DELETE",
          });
      } catch (cleanupError) {
        failures.push(cleanupError);
      }
    }
    const unlinkResults = await Promise.allSettled(written.map((path) => unlink(path)));
    for (const result of unlinkResults)
      if (result.status === "rejected") failures.push(result.reason);
    throw new AggregateError(failures, "Preview cache preparation failed", { cause: error });
  }
}

export async function cleanupCache(name, state) {
  validatePreviewName(name);
  const record = state?.cache;
  if (state?.previewName !== name || !ID.test(record?.id) || record.title !== cacheTitle(name))
    throw new AggregateError([new Error("Unsafe Preview KV state")], "Preview cleanup failed");
  const account = required("CLOUDFLARE_ACCOUNT_ID");
  const token = required("CLOUDFLARE_API_TOKEN");
  const failures = [];
  try {
    const live = exactLive(await namespaces(account, token), record);
    if (live)
      await request(`/accounts/${account}/storage/kv/namespaces/${live.id}`, token, {
        method: "DELETE",
      });
  } catch (error) {
    failures.push(error);
  }
  if (failures.length) throw new AggregateError(failures, "Preview cleanup failed");
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === "verify-access" && !args.length) return verifyAccess();
  if (command === "prepare" && args.length === 4) return prepareCache(...args);
  if (command === "cleanup" && args.length === 2)
    return cleanupCache(args[0], JSON.parse(await readFile(args[1], "utf8")));
  throw new Error("Invalid Worker Preview cache command");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
