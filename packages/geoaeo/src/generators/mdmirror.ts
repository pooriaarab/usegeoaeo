import type { SiteConfig } from "../config.js";

export function generateMdmirror(
  config: SiteConfig,
  page?: { title?: string; body?: string },
): string {
  const title = page?.title ?? config.siteName;
  const body = page?.body ?? config.description;
  return `# ${title}\n\n${body}\n`;
}
