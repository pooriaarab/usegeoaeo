import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { afterEach, test } from "node:test";

import { cacheTitle, cleanupCache, listAll, renderRuntimeConfig, validateAccess, validatePreviewName } from "./worker-preview-cache.mjs";

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
const app = (id, destination) => ({
  id,
  type: "self_hosted",
  service_auth_401_redirect: true,
  destinations: [destination],
});
const ci = (id) => ({
  id,
  decision: "non_identity",
  include: [{ service_token: { token_id: expected.serviceTokenId } }],
});
const human = (id) => ({ id, decision: "allow", include: selectors });
const access = (overrides = {}) => ({
  apps: [
    app(expected.workerAppId, {
      type: "preview_worker",
      worker_id: expected.workerId,
    }),
    app(expected.hostnameAppId, {
      type: "public",
      uri: expected.hostnameDestination,
    }),
  ],
  policiesByApp: {
    [expected.workerAppId]: [ci(expected.workerPolicies.ciPolicyId), human(expected.workerPolicies.humanPolicyId)],
    [expected.hostnameAppId]: [ci(expected.hostnamePolicies.ciPolicyId), human(expected.hostnamePolicies.humanPolicyId)],
  },
  // prettier-ignore
  serviceTokens: [{ id: expected.serviceTokenId, client_id: expected.clientId,
    expires_at: "2099-01-01T00:00:00Z" }],
  now: Date.parse("2026-01-01T00:00:00Z"),
  expected,
  ...overrides,
});

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

test("imports safely without an argv script path", () => {
  const moduleUrl = new URL("./worker-preview-cache.mjs", import.meta.url).href;
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", `process.argv.splice(1); await import(${JSON.stringify(moduleUrl)})`]);
  assert.equal(result.status, 0, result.stderr.toString());
});
