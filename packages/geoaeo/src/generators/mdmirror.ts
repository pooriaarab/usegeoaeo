import type { SiteConfig } from "../config.js";
import { absoluteUrl } from "../config.js";
import { generateMarkdownPage } from "../markdown.js";

export interface MdmirrorPage {
  title?: string;
  body?: string;
  /** Path or URL this mirror stands for. Defaults to the site root. */
  path?: string;
  /** ISO date (YYYY-MM-DD). */
  lastUpdated?: string;
  related?: Array<{ title: string; url: string }>;
}

/** The configured pages, minus the one this mirror stands for. */
function relatedFromConfig(
  config: SiteConfig,
  path: string,
): Array<{ title: string; url: string }> {
  const own = absoluteUrl(config.siteUrl, path);
  return [...new Set(config.pages ?? [])]
    .map((page) => absoluteUrl(config.siteUrl, page))
    .filter((url) => url !== own)
    .map((url) => ({ title: url.split("/").filter(Boolean).at(-1) ?? "Home", url }));
}

export function generateMdmirror(config: SiteConfig, page: MdmirrorPage = {}): string {
  const path = page.path ?? "/";
  return generateMarkdownPage({
    title: page.title ?? config.siteName,
    // Without a body the description is the body, so repeating it as a summary
    // would print the same sentence twice.
    summary: page.body ? config.description : undefined,
    canonical: absoluteUrl(config.siteUrl, path),
    lastUpdated: page.lastUpdated ?? config.lastUpdated,
    body: page.body ?? config.description,
    related: page.related ?? relatedFromConfig(config, path),
  });
}
