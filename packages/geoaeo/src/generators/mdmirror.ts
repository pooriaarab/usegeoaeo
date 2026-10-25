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

export function generateMdmirror(config: SiteConfig, page: MdmirrorPage = {}): string {
  return generateMarkdownPage({
    title: page.title ?? config.siteName,
    // Without a body the description is the body, so repeating it as a summary
    // would print the same sentence twice.
    summary: page.body ? config.description : undefined,
    canonical: absoluteUrl(config.siteUrl, page.path ?? "/"),
    lastUpdated: page.lastUpdated ?? config.lastUpdated,
    body: page.body ?? config.description,
    related: page.related,
  });
}
