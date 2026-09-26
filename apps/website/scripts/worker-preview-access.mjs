import { listAll, required } from "./worker-preview-shared.mjs";
import { canonical } from "./worker-preview-shared.mjs";

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
  return (
    app?.id === id &&
    app.type === "self_hosted" &&
    app.service_auth_401_redirect === true &&
    app.destinations?.length === 1 &&
    Object.keys(app.destinations[0]).length === Object.keys(destination).length &&
    Object.entries(destination).every(([key, value]) => app.destinations[0]?.[key] === value)
  );
}

function exactPolicies(policies, expected, tokenId, selectors) {
  const ids = new Set([expected.ciPolicyId, expected.humanPolicyId]);
  if (policies.length !== 2 || policies.some((policy) => !ids.has(policy.id))) return false;
  const ci = policies.find((policy) => policy.id === expected.ciPolicyId);
  const human = policies.find((policy) => policy.id === expected.humanPolicyId);
  const ciSelector = ci?.include?.[0]?.service_token;
  const safeSelectorKeys = new Set([
    "email",
    "email_domain",
    "email_list",
    "login_method",
    "github-organization",
    "gsuite",
    "azureAD",
    "okta",
    "saml",
  ]);
  const humanKeysSafe = human?.include?.every((rule) => {
    const keys = Object.keys(rule);
    return keys.length === 1 && safeSelectorKeys.has(keys[0]);
  });
  return (
    ci?.decision === "non_identity" &&
    ci.include?.length === 1 &&
    Object.keys(ci.include[0]).length === 1 &&
    ciSelector?.token_id === tokenId &&
    (ci.exclude ?? []).length === 0 &&
    (ci.require ?? []).length === 0 &&
    human?.decision === "allow" &&
    humanKeysSafe &&
    canonical(human.include) === canonical(selectors) &&
    (human.exclude ?? []).length === 0 &&
    (human.require ?? []).length === 0
  );
}

export function validateAccess({ apps, policiesByApp, serviceTokens, now = Date.now(), expected }) {
  const worker = apps.find((app) => app.id === expected.workerAppId);
  const hostname = apps.find((app) => app.id === expected.hostnameAppId);
  const matchingWorkers = apps.filter((app) =>
    app.destinations?.some(
      (destination) =>
        destination.type === "preview_worker" && destination.worker_id === expected.workerId,
    ),
  );
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
  const matchingHosts = apps.filter((app) =>
    app.destinations?.some(
      (destination) =>
        destination.type === "public" && hostMatches(destination.uri, expected.previewHostname),
    ),
  );
  if (matchingHosts.length !== 1 || matchingHosts[0].id !== expected.hostnameAppId)
    throw new Error("A public hostname Access app can override Preview Access");
  const tokens = serviceTokens.filter(
    (token) => token.id === expected.serviceTokenId || token.client_id === expected.clientId,
  );
  const token = tokens[0];
  if (
    tokens.length !== 1 ||
    token.id !== expected.serviceTokenId ||
    token.client_id !== expected.clientId ||
    token.enabled === false ||
    !Number.isFinite(Date.parse(token.expires_at)) ||
    Date.parse(token.expires_at) <= now
  )
    throw new Error("CI service token is not one exact active identity");
  for (const appExpected of [expected.workerPolicies, expected.hostnamePolicies]) {
    if (
      !exactPolicies(
        policiesByApp[appExpected.appId] ?? [],
        appExpected,
        expected.serviceTokenId,
        expected.humanSelectors,
      )
    )
      throw new Error("Access policies are not exact");
  }
}

function expectedAccess() {
  const selectors = JSON.parse(required("CF_ACCESS_HUMAN_SELECTORS_JSON"));
  if (!Array.isArray(selectors) || !selectors.length)
    throw new Error("Human selectors must be a non-empty array");
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
  const [apps, serviceTokens] = await Promise.all([
    listAll(`/accounts/${account}/access/apps`, token),
    listAll(`/accounts/${account}/access/service_tokens`, token),
  ]);
  const policyEntries = await Promise.all(
    [expected.workerAppId, expected.hostnameAppId].map(async (id) => [
      id,
      await listAll(`/accounts/${account}/access/apps/${id}/policies`, token),
    ]),
  );
  validateAccess({
    apps,
    serviceTokens,
    policiesByApp: Object.fromEntries(policyEntries),
    expected,
  });
}
