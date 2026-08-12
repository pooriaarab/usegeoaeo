import path from 'node:path';
import { access } from 'node:fs/promises';
import { createJiti } from 'jiti';
import { CONFIG_FILENAME } from '../constants.js';
import type { SiteConfig } from '../config.js';

export async function findConfigFile(directory = process.cwd()): Promise<string> {
  const candidates = [CONFIG_FILENAME, CONFIG_FILENAME.replace(/\.ts$/, '.js'), CONFIG_FILENAME.replace(/\.ts$/, '.mjs')];
  for (const candidate of candidates) {
    const file = path.join(directory, candidate);
    try {
      await access(file);
      return file;
    } catch {
      // Try the next supported extension.
    }
  }
  throw new Error(`No ${CONFIG_FILENAME} file found in ${directory}`);
}

export async function loadSiteConfig(directory = process.cwd()): Promise<SiteConfig> {
  const file = await findConfigFile(directory);
  const jiti = createJiti(import.meta.url);
  const module = (await jiti.import(file)) as { default?: SiteConfig; siteConfig?: SiteConfig };
  const config = module.siteConfig ?? module.default;
  if (!config) throw new Error(`${path.basename(file)} must export a default config or siteConfig.`);
  return config;
}

