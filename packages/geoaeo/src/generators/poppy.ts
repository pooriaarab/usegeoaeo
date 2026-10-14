import type { SiteConfig } from "../config.js";

export const POPPY_PROTOCOL_VERSION = "0.1";

export interface PoppyOrganization {
  name: string;
  domain: string;
}

export interface PoppyDocument {
  protocol_version: string;
  organization: PoppyOrganization;
  web: Record<string, never>;
}

/** Host agents request, with a leading www. stripped the way the spec says. */
export function organizationDomain(siteUrl: string): string {
  try {
    return new URL(siteUrl).hostname.replace(/^www\./i, "");
  } catch {
    return siteUrl.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").replace(/^www\./i, "");
  }
}

/**
 * Discovery-only poppy.json: agents can find the site and browse signed out.
 * That is step 1 of Personal Agent Protocol. Auth, APIs, and a company agent
 * need an OAuth issuer, so they stay out of this generator.
 */
export function generatePoppy(config: SiteConfig): PoppyDocument {
  return {
    protocol_version: POPPY_PROTOCOL_VERSION,
    organization: {
      name: config.siteName,
      domain: organizationDomain(config.siteUrl),
    },
    web: {},
  };
}
