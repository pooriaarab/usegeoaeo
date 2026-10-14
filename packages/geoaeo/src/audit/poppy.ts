function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function isHttpsUrl(value: unknown): boolean {
  return typeof value === "string" && /^https:\/\//i.test(value);
}

function parseObject(text: string): Record<string, unknown> | undefined {
  try {
    return asRecord(JSON.parse(text));
  } catch {
    return undefined;
  }
}

function hasVersion(doc: Record<string, unknown>): boolean {
  return (
    typeof doc.protocol_version === "string" &&
    /^\d+\.\d+$/.test(doc.protocol_version) &&
    doc.protocol_version.split(".")[0] === "0"
  );
}

function hasOrganization(doc: Record<string, unknown>): boolean {
  const organization = asRecord(doc.organization);
  return Boolean(
    organization &&
      typeof organization.name === "string" &&
      organization.name.trim() &&
      typeof organization.domain === "string" &&
      organization.domain.trim(),
  );
}

function listedSurfaces(doc: Record<string, unknown>): {
  agent: Record<string, unknown> | undefined;
  web: Record<string, unknown> | undefined;
  apis: unknown[] | undefined;
} {
  return {
    agent: asRecord(doc.agent),
    web: asRecord(doc.web),
    apis: Array.isArray(doc.apis) ? doc.apis : undefined,
  };
}

function apisLookValid(apis: unknown[]): boolean {
  return (
    apis.length > 0 &&
    apis.every((entry) => {
      const api = asRecord(entry);
      return (
        Boolean(api) &&
        typeof api?.type === "string" &&
        isHttpsUrl(api.url) &&
        typeof api.description === "string"
      );
    })
  );
}

function authLooksValid(
  doc: Record<string, unknown>,
  agent: Record<string, unknown> | undefined,
  apis: unknown[] | undefined,
  web: Record<string, unknown> | undefined,
): boolean {
  const needsAuth = Boolean(agent || apis || web?.browser_session_endpoint);
  if (!needsAuth) return true;
  const auth = asRecord(doc.auth);
  return Boolean(auth && isHttpsUrl(auth.issuer));
}

export function isValidPoppyJson(text: string): boolean {
  const doc = parseObject(text);
  if (!doc || !hasVersion(doc) || !hasOrganization(doc)) return false;
  const { agent, web, apis } = listedSurfaces(doc);
  if (!agent && !web && !apis) return false;
  if (apis && !apisLookValid(apis)) return false;
  return authLooksValid(doc, agent, apis, web);
}

/**
 * Personal Agent Protocol draft 0.1 document rules that can be read from
 * the file itself. Route source that calls generatePoppy also counts, the
 * same way generateLlms counts for llms.txt.
 */
export function isPoppyDocument(body: string | undefined): boolean {
  const text = body ?? "";
  return /generatePoppy/i.test(text) || isValidPoppyJson(text);
}
