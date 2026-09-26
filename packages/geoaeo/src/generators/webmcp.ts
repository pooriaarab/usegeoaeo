import type { SiteConfig } from "../config.js";
import { absoluteUrl } from "../config.js";

export interface WebMcpManifest {
  name: string;
  description: string;
  url: string;
  platforms: string[];
  tools: Array<{ name: string; description: string; url: string }>;
  resources: Array<{ name: string; url: string }>;
}

export function generateWebmcp(config: SiteConfig): WebMcpManifest {
  return {
    name: config.siteName,
    description: config.description,
    url: config.siteUrl,
    platforms: config.platforms ?? [],
    tools: config.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      url: absoluteUrl(config.siteUrl, tool.url),
    })),
    resources: [
      { name: "llms", url: absoluteUrl(config.siteUrl, "/llms.txt") },
      { name: "llms-full", url: absoluteUrl(config.siteUrl, "/llms-full.txt") },
    ],
  };
}
