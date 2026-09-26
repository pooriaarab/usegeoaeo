import { writeFile } from "node:fs/promises";
import { loadSiteConfig } from "./load-config.js";
import {
  generateHreflang,
  generateJsonLd,
  generateLlms,
  generateLlmsFull,
  generateMdmirror,
  generateOgimage,
  generateRobots,
  generateRss,
  generateSitemap,
  generateWebmcp,
  type JsonLdKind,
} from "../generators/index.js";
import type { SiteConfig } from "../config.js";

// Single source for the library type, the CLI allow-list, and the MCP Zod enum.
export const GENERATED_ARTIFACTS = [
  "llms",
  "llms-full",
  "jsonld",
  "webmcp",
  "sitemap",
  "robots",
  "ogimage",
  "rss",
  "hreflang",
  "mdmirror",
] as const;

export type GeneratedArtifact = (typeof GENERATED_ARTIFACTS)[number];

function renderArtifact(
  artifact: GeneratedArtifact,
  config: SiteConfig,
  jsonLdKind: JsonLdKind,
): string {
  const map: Record<GeneratedArtifact, (c: SiteConfig, k: JsonLdKind) => string> = {
    llms: (c) => generateLlms(c),
    "llms-full": (c) => generateLlmsFull(c),
    jsonld: (c, k) => `${JSON.stringify(generateJsonLd(c, k), null, 2)}\n`,
    webmcp: (c) => `${JSON.stringify(generateWebmcp(c), null, 2)}\n`,
    sitemap: (c) => generateSitemap(c),
    robots: (c) => generateRobots(c),
    ogimage: (c) => generateOgimage(c),
    rss: (c) => generateRss(c),
    hreflang: (c) => generateHreflang(c),
    mdmirror: (c) => generateMdmirror(c),
  };
  const renderer = map[artifact];
  return renderer ? renderer(config, jsonLdKind) : generateMdmirror(config);
}

export async function generateArtifact(
  artifact: GeneratedArtifact,
  directory = process.cwd(),
  jsonLdKind: JsonLdKind = "software",
): Promise<string> {
  const config = await loadSiteConfig(directory);
  return renderArtifact(artifact, config, jsonLdKind);
}

export async function writeGeneratedArtifact(
  artifact: GeneratedArtifact,
  options: { directory?: string; output?: string; jsonLdKind?: JsonLdKind } = {},
): Promise<string> {
  const content = await generateArtifact(artifact, options.directory, options.jsonLdKind);
  if (options.output) await writeFile(options.output, content, "utf8");
  return content;
}
