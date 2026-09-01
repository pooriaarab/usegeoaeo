import { createHash } from "node:crypto";
import { readFile, unlink, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const API = "https://api.cloudflare.com/client/v4";
const NAME = /^use-[0-9]+-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ID = /^[a-f0-9]{32}$/;
const PREFIX = "usegeoaeo-preview-";
const PLACEHOLDER = "__PREVIEW_KV_ID__";
const FORBIDDEN = new Set(["d1_databases", "r2_buckets", "durable_objects", "services", "queues", "hyperdrive", "vectorize", "ai", "browser", "mtls_certificates", "dispatch_namespaces", "analytics_engine_datasets", "workflows", "pipelines", "secrets_store_secrets", "unsafe", "env", "routes"]);
const CONFIG_KEYS = new Set(["$schema", "name", "main", "compatibility_date", "compatibility_flags", "minify", "assets", "observability", "placement", "kv_namespaces", "vars", "workers_dev", "preview_urls"]);

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

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

async function request(path, token, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Invalid Cloudflare response for ${path}`);
  }
  if (!response.ok || !payload || typeof payload !== "object" || payload.success !== true) throw new Error(`Cloudflare API rejected ${path}`);
  return payload;
}

export async function listAll(path, token = required("CLOUDFLARE_API_TOKEN")) {
  const items = [];
  async function readPage(page) {
    const join = path.includes("?") ? "&" : "?";
    const payload = await request(`${path}${join}page=${page}&per_page=100`, token);
    const info = payload.result_info;
    const result = payload.result;
    const pages = Number.isSafeInteger(info?.total_pages);
    const count = Number.isSafeInteger(info?.total_count);
    const nextSize = items.length + (Array.isArray(result) ? result.length : 0);
    if (!Array.isArray(result) || !Number.isSafeInteger(info?.page) || info.page !== page || (!pages && !count) || (pages && (info.total_pages < page || info.total_pages > 1000)) || (count && (info.total_count < 0 || nextSize > info.total_count))) throw new Error(`Invalid Cloudflare list pagination for ${path}`);
    items.push(...result);
    const pageDone = pages && page === info.total_pages;
    const countDone = count && items.length === info.total_count;
    if (pages && count && pageDone !== countDone) throw new Error(`Invalid Cloudflare list pagination for ${path}`);
    if (pages ? pageDone : countDone) return items;
    if (!result.length) throw new Error(`Invalid Cloudflare list pagination for ${path}`);
    if (page === 1000) throw new Error(`Invalid Cloudflare list pagination for ${path}`);
    return readPage(page + 1);
  }
  return readPage(1);
}

function hostMatches(uri, hostname) {
  if (typeof uri !== "string") return false;
  const host = uri
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .toLowerCase();
  const pattern = host.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replaceAll("*", "[^.]+");
  return new RegExp(`^${pattern}$`).test(hostname.toLowerCase());
}

function exactApp(app, id, destination) {
  return app?.id === id && app.type === "self_hosted" && app.service_auth_401_redirect === true && app.destinations?.length === 1 && Object.keys(app.destinations[0]).length === Object.keys(destination).length && Object.entries(destination).every(([key, value]) => app.destinations[0]?.[key] === value);
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).toSorted().join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.keys(value)
      .toSorted()
      .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
      .join(",")}}`;
  return JSON.stringify(value);
}

function exactPolicies(policies, expected, tokenId, selectors) {
  const ids = new Set([expected.ciPolicyId, expected.humanPolicyId]);
  if (policies.length !== 2 || policies.some((policy) => !ids.has(policy.id))) return false;
  const ci = policies.find((policy) => policy.id === expected.ciPolicyId);
  const human = policies.find((policy) => policy.id === expected.humanPolicyId);
  const ciSelector = ci?.include?.[0]?.service_token;
  const safeSelectorKeys = new Set(["email", "email_domain", "email_list", "login_method", "github-organization", "gsuite", "azureAD", "okta", "saml"]);
  const humanKeysSafe = human?.include?.every((rule) => {
    const keys = Object.keys(rule);
    return keys.length === 1 && safeSelectorKeys.has(keys[0]);
  });
  return ci?.decision === "non_identity" && ci.include?.length === 1 && Object.keys(ci.include[0]).length === 1 && ciSelector?.token_id === tokenId && (ci.exclude ?? []).length === 0 && (ci.require ?? []).length === 0 && human?.decision === "allow" && humanKeysSafe && canonical(human.include) === canonical(selectors) && (human.exclude ?? []).length === 0 && (human.require ?? []).length === 0;
}

export function validateAccess({ apps, policiesByApp, serviceTokens, now = Date.now(), expected }) {
  const worker = apps.find((app) => app.id === expected.workerAppId);
  const hostname = apps.find((app) => app.id === expected.hostnameAppId);
  const matchingWorkers = apps.filter((app) => app.destinations?.some((destination) => destination.type === "preview_worker" && destination.worker_id === expected.workerId));
  if (
    !exactApp(worker, expected.workerAppId, {
      type: "preview_worker",
      worker_id: expected.workerId,
    }) ||
    matchingWorkers.length !== 1 ||
    matchingWorkers[0].id !== expected.workerAppId
  )
    throw new Error("Worker Access app is not the exact fail-closed app");
  if (
    !exactApp(hostname, expected.hostnameAppId, {
      type: "public",
      uri: expected.hostnameDestination,
    })
  )
    throw new Error("Hostname Access app is not the exact fail-closed app");
  const matchingHosts = apps.filter((app) => app.destinations?.some((destination) => destination.type === "public" && hostMatches(destination.uri, expected.previewHostname)));
  if (matchingHosts.length !== 1 || matchingHosts[0].id !== expected.hostnameAppId) throw new Error("A public hostname Access app can override Preview Access");
  const tokens = serviceTokens.filter((token) => token.id === expected.serviceTokenId || token.client_id === expected.clientId);
  const token = tokens[0];
  if (tokens.length !== 1 || token.id !== expected.serviceTokenId || token.client_id !== expected.clientId || token.enabled === false || !Number.isFinite(Date.parse(token.expires_at)) || Date.parse(token.expires_at) <= now) throw new Error("CI service token is not one exact active identity");
  for (const appExpected of [expected.workerPolicies, expected.hostnamePolicies]) {
    if (!exactPolicies(policiesByApp[appExpected.appId] ?? [], appExpected, expected.serviceTokenId, expected.humanSelectors)) throw new Error("Access policies are not exact");
  }
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
  if (!ID.test(namespaceId) || source.split(PLACEHOLDER).length !== 2) throw new Error("Expected one safe Preview KV placeholder");
  let config;
  try {
    config = JSON.parse(source.replace(PLACEHOLDER, namespaceId));
  } catch {
    throw new Error("Preview runtime template must be strict JSON");
  }
  if (!config || Array.isArray(config) || Object.keys(config).some((key) => !CONFIG_KEYS.has(key)) || canonical(config.vars) !== canonical({ ENVIRONMENT: "preview", WORKER_PREVIEW: "true" })) throw new Error("Preview runtime contains an unapproved setting");
  const bindings = scanBindings(config);
  const binding = bindings[0]?.[0];
  if (bindings.length !== 1 || bindings[0] !== config.kv_namespaces || bindings[0].length !== 1 || canonical(binding) !== canonical({ binding: "NEXT_INC_CACHE_KV", id: namespaceId })) throw new Error("Preview runtime must contain only the isolated cache binding");
  return `${JSON.stringify(config, null, 2)}\n`;
}

function expectedAccess() {
  const selectors = JSON.parse(required("CF_ACCESS_HUMAN_SELECTORS_JSON"));
  if (!Array.isArray(selectors) || !selectors.length) throw new Error("Human selectors must be a non-empty array");
  const workerAppId = required("CF_ACCESS_WORKER_APP_ID");
  const hostnameAppId = required("CF_ACCESS_HOSTNAME_APP_ID");
  // prettier-ignore
  return {
    workerId: required("CF_PREVIEW_WORKER_ID"), workerAppId, hostnameAppId,
    previewHostname: required("CF_PREVIEW_HOSTNAME"),
    hostnameDestination: required("CF_ACCESS_HOSTNAME_DESTINATION"),
    serviceTokenId: required("CF_ACCESS_SERVICE_TOKEN_ID"),
    clientId: required("CF_ACCESS_CLIENT_ID"), humanSelectors: selectors,
    workerPolicies: { appId: workerAppId, ciPolicyId: required("CF_ACCESS_WORKER_CI_POLICY_ID"), humanPolicyId: required("CF_ACCESS_WORKER_HUMAN_POLICY_ID") },
    hostnamePolicies: { appId: hostnameAppId, ciPolicyId: required("CF_ACCESS_HOSTNAME_CI_POLICY_ID"), humanPolicyId: required("CF_ACCESS_HOSTNAME_HUMAN_POLICY_ID") },
  };
}

export async function verifyAccess() {
  const account = required("CLOUDFLARE_ACCOUNT_ID");
  const token = required("CF_ACCESS_API_TOKEN");
  const expected = expectedAccess();
  const [apps, serviceTokens] = await Promise.all([listAll(`/accounts/${account}/access/apps`, token), listAll(`/accounts/${account}/access/service_tokens`, token)]);
  const policyEntries = await Promise.all([expected.workerAppId, expected.hostnameAppId].map(async (id) => [id, await listAll(`/accounts/${account}/access/apps/${id}/policies`, token)]));
  validateAccess({
    apps,
    serviceTokens,
    policiesByApp: Object.fromEntries(policyEntries),
    expected,
  });
}

async function namespaces(account, token) {
  return listAll(`/accounts/${account}/storage/kv/namespaces`, token);
}

function exactLive(items, record) {
  const byId = items.filter((item) => item.id === record.id);
  const byTitle = items.filter((item) => item.title === record.title);
  if (!byId.length && !byTitle.length) return undefined;
  if (byId.length !== 1 || byTitle.length !== 1 || byId[0] !== byTitle[0]) throw new Error("Recorded Preview KV identity does not match Cloudflare");
  return byId[0];
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
    if (!ID.test(resource?.id) || resource.title !== title) throw new Error("Cloudflare returned an unsafe Preview KV namespace");
    const confirmed = (await namespaces(account, token)).filter((item) => item.title === title);
    if (confirmed.length !== 1 || confirmed[0].id !== resource.id) throw new Error("Concurrent Preview KV preparation detected");
    const state = { previewName: name, cache: { id: resource.id, title } };
    await writeFile(outputPath, renderRuntimeConfig(source, resource.id), { flag: "wx" });
    written.push(outputPath);
    await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, { flag: "wx" });
    written.push(statePath);
    return state;
  } catch (error) {
    if (!created) throw error;
    const failures = [error];
    try {
      const live = exactLive(await namespaces(account, token), resource);
      if (live) await request(`/accounts/${account}/storage/kv/namespaces/${live.id}`, token, { method: "DELETE" });
    } catch (cleanupError) {
      failures.push(cleanupError);
    }
    await Promise.allSettled(written.map((path) => unlink(path)));
    throw new AggregateError(failures, "Preview cache preparation failed", { cause: error });
  }
}

export async function cleanupCache(name, state) {
  validatePreviewName(name);
  const record = state?.cache;
  if (state?.previewName !== name || !ID.test(record?.id) || record.title !== cacheTitle(name)) throw new AggregateError([new Error("Unsafe Preview KV state")], "Preview cleanup failed");
  const account = required("CLOUDFLARE_ACCOUNT_ID");
  const token = required("CLOUDFLARE_API_TOKEN");
  const failures = [];
  try {
    const live = exactLive(await namespaces(account, token), record);
    if (live) await request(`/accounts/${account}/storage/kv/namespaces/${live.id}`, token, { method: "DELETE" });
  } catch (error) {
    failures.push(error);
  }
  if (failures.length) throw new AggregateError(failures, "Preview cleanup failed");
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === "verify-access" && !args.length) return verifyAccess();
  if (command === "prepare" && args.length === 4) return prepareCache(...args);
  if (command === "cleanup" && args.length === 2) return cleanupCache(args[0], JSON.parse(await readFile(args[1], "utf8")));
  throw new Error("Invalid Worker Preview cache command");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
