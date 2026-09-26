import type { SiteConfig } from "../config.js";
import { absoluteUrl } from "../config.js";

function escapeXml(value: string): string {
  return value.replace(
    /[<>&'\"]/g,
    (character) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character] ??
      character,
  );
}

function feedItems(
  config: SiteConfig,
): Array<{ title: string; link: string; description: string }> {
  const items = [
    { title: config.siteName, link: config.siteUrl, description: config.description },
    ...(config.pages ?? []).map((page) => {
      const path = page.replace(/^\/+/, "");
      return { title: path, link: absoluteUrl(config.siteUrl, path), description: path };
    }),
    ...(config.tools ?? []).map((tool) => ({
      title: tool.name,
      link: absoluteUrl(config.siteUrl, tool.url),
      description: tool.description,
    })),
  ];
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  });
}

export function generateRss(config: SiteConfig): string {
  const items = feedItems(config)
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid>${escapeXml(item.link)}</guid>
      <description>${escapeXml(item.description)}</description>
    </item>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(config.siteName)}</title>
    <link>${escapeXml(config.siteUrl)}</link>
    <description>${escapeXml(config.description)}</description>
${items}
  </channel>
</rss>
`;
}
