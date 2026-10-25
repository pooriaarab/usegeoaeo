import type { SiteConfig } from "../config.js";
import { AI_EXCLUDED_PATHS } from "../constants.js";

export interface AiTxtOptions {
  /** ISO date (YYYY-MM-DD). Defaults to config.lastUpdated, then today in UTC. */
  lastUpdated?: string;
  /** Contact line. Defaults to config.contact, then the site URL. */
  contact?: string;
}

/** A configured page may be a path or an absolute URL; a scope entry is a path. */
function pagePath(page: string): string {
  if (/^https?:\/\//i.test(page)) {
    try {
      return new URL(page).pathname;
    } catch {
      return `/${page}`;
    }
  }
  return `/${page.replace(/^\/+|\/+$/g, "")}`;
}

function includedPaths(config: SiteConfig): string[] {
  return [...new Set(["/", ...(config.pages ?? []).map(pagePath)])];
}

/**
 * ai.txt states how AI systems may use the site: the ai-txt spec v1.1.1.
 * Facts come from SiteConfig so the identity block matches llms.txt and the
 * Organization JSON-LD. Scope exclusions come from AI_EXCLUDED_PATHS.
 */
export function generateAiTxt(config: SiteConfig, options: AiTxtOptions = {}): string {
  const lastUpdated =
    options.lastUpdated ?? config.lastUpdated ?? new Date().toISOString().slice(0, 10);
  const contact = options.contact ?? config.contact ?? config.siteUrl;
  const contactLine = /^https?:\/\//.test(contact) ? `url: ${contact}` : `email: ${contact}`;
  const included = includedPaths(config)
    .map((path) => `include: ${path}`)
    .join("\n");
  const excluded = AI_EXCLUDED_PATHS.map((path) => `exclude: ${path}`).join("\n");
  return `# ai.txt for ${config.siteName}
# Spec: https://ai-visibility.org.uk/ai-txt
# Keep in sync with /llms.txt and /robots.txt.

[identity]
name: ${config.siteName}
url: ${config.siteUrl}
description: ${config.description}
contact: ${contact}

[permissions]
allow: summarise
allow: quote with attribution
allow: cite
allow: index for search and answers

[restrictions]
disallow: fabricated quotes, reviews, or ratings
disallow: presenting this content as the model's own
disallow: private or user-generated data

[attribution]
cite: ${config.siteName} - ${config.siteUrl}

[scope]
${included}
${excluded}

[contact]
${contactLine}

Last updated: ${lastUpdated}
`;
}
