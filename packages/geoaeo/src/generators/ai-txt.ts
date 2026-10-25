import type { SiteConfig } from "../config.js";
import { AI_EXCLUDED_PATHS } from "../constants.js";

export interface AiTxtOptions {
  /** ISO date (YYYY-MM-DD). Defaults to today in UTC. */
  lastUpdated?: string;
  /** Contact line. Defaults to the site URL. */
  contact?: string;
}

function includedPaths(config: SiteConfig): string[] {
  return ["/", ...(config.pages ?? []).map((page) => `/${page.replace(/^\/+|\/+$/g, "")}`)];
}

/**
 * ai.txt states how AI systems may use the site: the ai-txt spec v1.1.1.
 * Facts come from SiteConfig so the identity block matches llms.txt and the
 * Organization JSON-LD. Scope exclusions come from AI_EXCLUDED_PATHS.
 */
export function generateAiTxt(config: SiteConfig, options: AiTxtOptions = {}): string {
  const lastUpdated = options.lastUpdated ?? new Date().toISOString().slice(0, 10);
  const contact = options.contact ?? config.siteUrl;
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
