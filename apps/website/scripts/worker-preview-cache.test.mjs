import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile as readTextFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, test } from "node:test";

import { cacheTitle, cleanupCache, listAll, prepareCache, renderRuntimeConfig, validateAccess, validatePreviewName } from "./worker-preview-cache.mjs";
import { previewSource } from "./worker-preview-source.mjs";

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env = { ...originalEnv };
});

const previewName = "use-47-preview-cache-lifecycle";
const previewHostname = `${previewName}.preview.staging.usegeoaeo.com`;
const selectors = [{ email: { email: "reviewer@example.com" } }];
// prettier-ignore
const expected = {
  workerId: "opaque_worker_id", workerAppId: "worker_app",
  hostnameAppId: "hostname_app", previewHostname,
  hostnameDestination: "*.preview.staging.usegeoaeo.com/*",
  serviceTokenId: "service_token", clientId: "client_id", humanSelectors: selectors,
  workerPolicies: { appId: "worker_app", ciPolicyId: "worker_ci", humanPolicyId: "worker_human" },
  hostnamePolicies: { appId: "hostname_app", ciPolicyId: "hostname_ci", humanPolicyId: "hostname_human" },
};
// prettier-ignore
const app = (id, destination) => ({ id, type: "self_hosted", service_auth_401_redirect: true, destinations: [destination] });
const ci = (id) => ({
  id,
  decision: "non_identity",
  include: [{ service_token: { token_id: expected.serviceTokenId } }],
});
const human = (id) => ({ id, decision: "allow", include: selectors });
// prettier-ignore
const access = (overrides = {}) => ({ apps: [app(expected.workerAppId, { type: "preview_worker", worker_id: expected.workerId }), app(expected.hostnameAppId, { type: "public", uri: expected.hostnameDestination })], policiesByApp: { [expected.workerAppId]: [ci(expected.workerPolicies.ciPolicyId), human(expected.workerPolicies.humanPolicyId)], [expected.hostnameAppId]: [ci(expected.hostnamePolicies.ciPolicyId), human(expected.hostnamePolicies.humanPolicyId)] }, serviceTokens: [{ id: expected.serviceTokenId, client_id: expected.clientId, expires_at: "2099-01-01T00:00:00Z" }], now: Date.parse("2026-01-01T00:00:00Z"), expected, ...overrides });

test("keeps Preview names exact and hashes only long KV titles", () => {
  assert.equal(cacheTitle(previewName), `usegeoaeo-preview-${previewName}`);
  const exact = `use-47-${"a".repeat(56)}`;
  assert.equal(exact.length, 63);
  assert.doesNotThrow(() => validatePreviewName(exact));
  assert.equal(cacheTitle(exact).length, 64);
  assert.match(cacheTitle(exact), /^usegeoaeo-preview-use-47-a+-[a-f0-9]{8}$/);
  assert.throws(() => validatePreviewName(`${exact}a`));
  assert.throws(() => validatePreviewName("feature/use-47-cache"));
});

test("accepts only pinned fail-closed Access identities", () => {
  assert.doesNotThrow(() => validateAccess(access()));
  for (const key of ["workerId", "workerAppId", "hostnameAppId", "clientId", "serviceTokenId"]) assert.throws(() => validateAccess(access({ expected: { ...expected, [key]: "wrong" } })));
  const unsafe = access();
  unsafe.apps[0].service_auth_401_redirect = false;
  assert.throws(() => validateAccess(unsafe), /fail-closed/);
  assert.throws(
    () =>
      validateAccess(
        access({
          apps: [
            ...access().apps,
            app("duplicate", {
              type: "preview_worker",
              worker_id: expected.workerId,
            }),
          ],
        }),
      ),
    /fail-closed/,
  );
});

test("rejects hostname overrides and imprecise policies", () => {
  const override = app("public_override", {
    type: "public",
    uri: `${previewHostname}/admin/*`,
  });
  assert.throws(() => validateAccess(access({ apps: [...access().apps, override] })), /override/);
  const extra = access();
  extra.policiesByApp.worker_app.push({
    id: "public",
    decision: "bypass",
    include: [{ everyone: {} }],
  });
  assert.throws(() => validateAccess(extra), /policies/);
  const broad = access();
  broad.policiesByApp.hostname_app[1] = {
    ...human(expected.hostnamePolicies.humanPolicyId),
    include: [{ ip: { ip: "0.0.0.0/0" } }],
  };
  assert.throws(() => validateAccess(broad), /policies/);
  const grouped = access();
  grouped.expected = { ...expected, humanSelectors: [{ group: { id: "human_group" } }] };
  grouped.policiesByApp.worker_app[1].include = grouped.expected.humanSelectors;
  grouped.policiesByApp.hostname_app[1].include = grouped.expected.humanSelectors;
  assert.throws(() => validateAccess(grouped), /policies/);
});

test("rejects disabled, expired, or colliding service tokens", () => {
  for (const token of [
    { ...access().serviceTokens[0], enabled: false },
    { ...access().serviceTokens[0], expires_at: "2025-01-01T00:00:00Z" },
  ])
    assert.throws(() => validateAccess(access({ serviceTokens: [token] })), /active/);
  assert.throws(
    () =>
      validateAccess(
        access({
          serviceTokens: [
            ...access().serviceTokens,
            {
              id: "other",
              client_id: expected.clientId,
              expires_at: "2099-01-01T00:00:00Z",
            },
          ],
        }),
      ),
    /active/,
  );
});

test("renders one structurally exact isolated KV binding", () => {
  const id = "a".repeat(32);
  const source = JSON.stringify({
    name: "preview",
    vars: { ENVIRONMENT: "preview", WORKER_PREVIEW: "true" },
    kv_namespaces: [{ binding: "NEXT_INC_CACHE_KV", id: "__PREVIEW_KV_ID__" }],
  });
  assert.deepEqual(JSON.parse(renderRuntimeConfig(source, id)).kv_namespaces, [{ binding: "NEXT_INC_CACHE_KV", id }]);
  for (const unsafe of [
    "{}",
    JSON.stringify({ vars: { ENVIRONMENT: "production", WORKER_PREVIEW: "true" }, kv_namespaces: [{ binding: "NEXT_INC_CACHE_KV", id: "__PREVIEW_KV_ID__" }] }),
    JSON.stringify({
      kv_namespaces: [{ binding: "OTHER", id: "__PREVIEW_KV_ID__" }],
    }),
    JSON.stringify({
      kv_namespaces: [{ binding: "NEXT_INC_CACHE_KV", id: "__PREVIEW_KV_ID__" }],
      r2_buckets: [],
    }),
    JSON.stringify({ kv_namespaces: [{ binding: "NEXT_INC_CACHE_KV", id: "__PREVIEW_KV_ID__" }], send_email: [] }),
    JSON.stringify({
      kv_namespaces: [{ binding: "NEXT_INC_CACHE_KV", id: "__PREVIEW_KV_ID__" }],
      env: { production: { kv_namespaces: [] } },
    }),
  ])
    assert.throws(() => renderRuntimeConfig(unsafe, id));
});

test("worker-preview-source renders a template renderRuntimeConfig accepts", () => {
  const config = {
    name: "usegeoaeo-website",
    main: "w.js",
    compatibility_flags: ["nodejs_compat"],
    kv_namespaces: [{ binding: "NEXT_INC_CACHE_KV", id: "prod-id" }],
    vars: { ENVIRONMENT: "development" },
    env: { staging: { name: "w-staging" }, production: { name: "w" } },
    routes: [{ pattern: "usegeoaeo.com", custom_domain: true }],
    d1_databases: [{ binding: "DB", database_id: "x" }],
  };
  const source = previewSource(config);
  assert.equal(source.name, "w-staging");
  assert.equal(source.workers_dev, false);
  assert.equal(source.preview_urls, false);
  assert.deepEqual(source.vars, { ENVIRONMENT: "preview", WORKER_PREVIEW: "true" });
  for (const key of ["env", "routes", "d1_databases"]) assert.equal(source[key], undefined);
  const id = "a".repeat(32);
  const rendered = renderRuntimeConfig(`${JSON.stringify(source, null, 2)}\n`, id);
  assert.deepEqual(JSON.parse(rendered).kv_namespaces, [{ binding: "NEXT_INC_CACHE_KV", id }]);
  assert.equal(previewSource({ ...config, env: { staging: { name: "other" } } }).name, "other");
  assert.throws(() => previewSource({ ...config, env: {} }), /env\.staging\.name/);
});

test("worker-preview-source CLI strips comments and trailing commas", async () => {
  const dir = await mkdtemp(join(tmpdir(), "preview-source-"));
  try {
    const input = join(dir, "wrangler.jsonc");
    const output = join(dir, "source.json");
    await writeFile(input, `{ // comment
      "main": "w.js", "vars": { "URL": "https://a.test//b" },
      "env": { "staging": { "name": "w-staging", }, },
      /* block */ "compatibility_flags": ["nodejs_compat",], }`);
    const script = new URL("./worker-preview-source.mjs", import.meta.url).pathname;
    const result = spawnSync(process.execPath, [script, input, output]);
    assert.equal(result.status, 0, result.stderr.toString());
    const source = JSON.parse(await readTextFile(output, "utf8"));
    assert.equal(source.name, "w-staging");
    assert.deepEqual(source.vars, { ENVIRONMENT: "preview", WORKER_PREVIEW: "true" });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// prettier-ignore
const response = (result, resultInfo) => new Response(JSON.stringify({ success: true, result, result_info: resultInfo }));

test("validates every Cloudflare list page", async () => {
  const pages = [response([{ id: "one" }], { page: 1, total_count: 2 }), response([{ id: "two" }], { page: 2, total_count: 2 })];
  globalThis.fetch = async () => pages.shift();
  assert.deepEqual(await listAll("/items", "token"), [{ id: "one" }, { id: "two" }]);
  globalThis.fetch = async () => response({}, { page: 1, total_count: 0 });
  await assert.rejects(listAll("/items", "token"), /pagination/);
  globalThis.fetch = async () => response([], undefined);
  await assert.rejects(listAll("/items", "token"), /pagination/);
  globalThis.fetch = async () => response([], { page: 2, total_count: 0 });
  await assert.rejects(listAll("/items", "token"), /pagination/);
});

test("cleanup uses recorded ID and title, tolerates only true absence", async () => {
  process.env.CLOUDFLARE_ACCOUNT_ID = "account";
  process.env.CLOUDFLARE_API_TOKEN = "token";
  const record = { id: "a".repeat(32), title: cacheTitle(previewName) };
  const state = { previewName, cache: record };
  const deleted = [];
  globalThis.fetch = async (url, options = {}) => {
    if (options.method === "DELETE") deleted.push(new URL(url).pathname);
    return options.method === "DELETE" ? response({}) : response([record], { page: 1, total_count: 1 });
  };
  await cleanupCache(previewName, state);
  assert.equal(deleted[0].endsWith(record.id), true);
  globalThis.fetch = async () => response([], { page: 1, total_count: 0 });
  await cleanupCache(previewName, state);
  globalThis.fetch = async () => response([{ ...record, title: "different" }], { page: 1, total_count: 1 });
  await assert.rejects(cleanupCache(previewName, state), AggregateError);
  globalThis.fetch = async () => response([{ ...record, id: "b".repeat(32) }], { page: 1, total_count: 1 });
  await assert.rejects(cleanupCache(previewName, state), AggregateError);
});

// prettier-ignore
function setAccessEnv() { Object.assign(process.env, { CF_ACCESS_HUMAN_SELECTORS_JSON: JSON.stringify(selectors), CF_ACCESS_WORKER_APP_ID: expected.workerAppId, CF_ACCESS_HOSTNAME_APP_ID: expected.hostnameAppId, CF_PREVIEW_WORKER_ID: expected.workerId, CF_PREVIEW_HOSTNAME: expected.previewHostname, CF_ACCESS_HOSTNAME_DESTINATION: expected.hostnameDestination, CF_ACCESS_SERVICE_TOKEN_ID: expected.serviceTokenId, CF_ACCESS_CLIENT_ID: expected.clientId, CF_ACCESS_WORKER_CI_POLICY_ID: expected.workerPolicies.ciPolicyId, CF_ACCESS_WORKER_HUMAN_POLICY_ID: expected.workerPolicies.humanPolicyId, CF_ACCESS_HOSTNAME_CI_POLICY_ID: expected.hostnamePolicies.ciPolicyId, CF_ACCESS_HOSTNAME_HUMAN_POLICY_ID: expected.hostnamePolicies.humanPolicyId, CF_ACCESS_API_TOKEN: "access-token", CLOUDFLARE_ACCOUNT_ID: "account", CLOUDFLARE_API_TOKEN: "cf-token" }); }
// prettier-ignore
async function accessFetch(url) { const { pathname } = new URL(url); const state = access(); if (pathname.endsWith("/access/apps")) return response(state.apps, { page: 1, total_count: state.apps.length }); if (pathname.endsWith("/access/service_tokens")) return response(state.serviceTokens, { page: 1, total_count: state.serviceTokens.length }); const match = pathname.match(/\/access\/apps\/([^/]+)\/policies$/); if (match) { const list = state.policiesByApp[match[1]] ?? []; return response(list, { page: 1, total_count: list.length }); } throw new Error(`Unhandled access fetch: ${pathname}`); }
// prettier-ignore
async function writeSourceConfig(path) { await writeFile(path, JSON.stringify({ vars: { ENVIRONMENT: "preview", WORKER_PREVIEW: "true" }, kv_namespaces: [{ binding: "NEXT_INC_CACHE_KV", id: "__PREVIEW_KV_ID__" }] })); }

// prettier-ignore
test("prepareCache creates a namespace and writes config and state once", async () => { setAccessEnv(); const dir = await mkdtemp(join(tmpdir(), "preview-cache-")); const sourcePath = join(dir, "wrangler.jsonc"); const outputPath = join(dir, "wrangler.preview.json"); const statePath = join(dir, "state.json"); await writeSourceConfig(sourcePath); const created = []; globalThis.fetch = async (url, options = {}) => { const { pathname } = new URL(url); if (pathname.includes("/access/")) return accessFetch(url); if (pathname.endsWith("/storage/kv/namespaces") && options.method === "POST") { const item = { id: "a".repeat(32), title: JSON.parse(options.body).title }; created.push(item); return response(item); } if (pathname.endsWith("/storage/kv/namespaces")) return response(created, { page: 1, total_count: created.length }); throw new Error(`Unhandled fetch ${options.method ?? "GET"} ${pathname}`); }; try { const state = await prepareCache(previewName, sourcePath, outputPath, statePath); assert.equal(created.length, 1); assert.deepEqual(state, { previewName, cache: created[0] }); assert.deepEqual(JSON.parse(await readTextFile(outputPath, "utf8")).kv_namespaces, [{ binding: "NEXT_INC_CACHE_KV", id: created[0].id }]); assert.deepEqual(JSON.parse(await readTextFile(statePath, "utf8")), state); } finally { await rm(dir, { recursive: true, force: true }); } });
// prettier-ignore
test("prepareCache rolls back its namespace and files but preserves existing files", async () => { setAccessEnv(); const dir = await mkdtemp(join(tmpdir(), "preview-cache-")); const sourcePath = join(dir, "wrangler.jsonc"); const outputPath = join(dir, "wrangler.preview.json"); const statePath = join(dir, "state.json"); await writeSourceConfig(sourcePath); await writeFile(statePath, "pre-existing"); const created = []; const deleted = []; globalThis.fetch = async (url, options = {}) => { const { pathname } = new URL(url); if (pathname.includes("/access/")) return accessFetch(url); if (pathname.endsWith("/storage/kv/namespaces") && options.method === "POST") { const item = { id: "a".repeat(32), title: JSON.parse(options.body).title }; created.push(item); return response(item); } if (pathname.endsWith("/storage/kv/namespaces")) return response(created, { page: 1, total_count: created.length }); if (options.method === "DELETE") { deleted.push(pathname.split("/").pop()); return response({}); } throw new Error(`Unhandled fetch ${options.method ?? "GET"} ${pathname}`); }; await assert.rejects(prepareCache(previewName, sourcePath, outputPath, statePath), AggregateError); assert.deepEqual(deleted, [created[0].id]); await assert.rejects(readTextFile(outputPath, "utf8"), { code: "ENOENT" }); assert.equal(await readTextFile(statePath, "utf8"), "pre-existing"); await rm(dir, { recursive: true, force: true }); });
// prettier-ignore
test("prepareCache rollback deletes only its namespace when a duplicate exists", async () => { setAccessEnv(); const dir = await mkdtemp(join(tmpdir(), "preview-cache-")); const sourcePath = join(dir, "wrangler.jsonc"); const outputPath = join(dir, "wrangler.preview.json"); const statePath = join(dir, "state.json"); await writeSourceConfig(sourcePath); const title = cacheTitle(previewName); const duplicate = { id: "b".repeat(32), title }; let created; let listCalls = 0; const deleted = []; globalThis.fetch = async (url, options = {}) => { const { pathname } = new URL(url); if (pathname.includes("/access/")) return accessFetch(url); if (pathname.endsWith("/storage/kv/namespaces") && options.method === "POST") { created = { id: "a".repeat(32), title }; return response(created); } if (pathname.endsWith("/storage/kv/namespaces")) { listCalls += 1; const items = listCalls === 1 ? [] : [created, duplicate]; return response(items, { page: 1, total_count: items.length }); } if (options.method === "DELETE") { deleted.push(pathname.split("/").pop()); return response({}); } throw new Error(`Unhandled fetch ${options.method ?? "GET"} ${pathname}`); }; await assert.rejects(prepareCache(previewName, sourcePath, outputPath, statePath), (error) => { assert.ok(error instanceof AggregateError); assert.match(error.cause.message, /Concurrent Preview KV preparation detected/); return true; }); assert.deepEqual(deleted, [created.id]); await rm(dir, { recursive: true, force: true }); });

test("imports safely without an argv script path", () => {
  const moduleUrl = new URL("./worker-preview-cache.mjs", import.meta.url).href;
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", `process.argv.splice(1); await import(${JSON.stringify(moduleUrl)})`]);
  assert.equal(result.status, 0, result.stderr.toString());
});
