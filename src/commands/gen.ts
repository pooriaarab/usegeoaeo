import { writeFile } from 'node:fs/promises';
import { loadSiteConfig } from './load-config.js';
import { generateJsonLd, generateLlms, generateLlmsFull, generateRobots, generateSitemap, generateWebmcp, type JsonLdKind } from '../generators/index.js';

export type GeneratedArtifact = 'llms' | 'llms-full' | 'jsonld' | 'webmcp' | 'sitemap' | 'robots';

export async function generateArtifact(artifact: GeneratedArtifact, directory = process.cwd(), jsonLdKind: JsonLdKind = 'software'): Promise<string> {
  const config = await loadSiteConfig(directory);
  if (artifact === 'llms') return generateLlms(config);
  if (artifact === 'llms-full') return generateLlmsFull(config);
  if (artifact === 'jsonld') return `${JSON.stringify(generateJsonLd(config, jsonLdKind), null, 2)}\n`;
  if (artifact === 'webmcp') return `${JSON.stringify(generateWebmcp(config), null, 2)}\n`;
  if (artifact === 'sitemap') return generateSitemap(config);
  return generateRobots(config);
}

export async function writeGeneratedArtifact(
  artifact: GeneratedArtifact,
  options: { directory?: string; output?: string; jsonLdKind?: JsonLdKind } = {}
): Promise<string> {
  const content = await generateArtifact(artifact, options.directory, options.jsonLdKind);
  if (options.output) await writeFile(options.output, content, 'utf8');
  return content;
}

