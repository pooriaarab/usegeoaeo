import path from 'node:path';
import { access } from 'node:fs/promises';
import { createJiti } from 'jiti';
import { CONFIG_FILENAME } from '../constants.js';
import type { SiteConfig } from '../config.js';

// The two states a first gen call is expected to hit. Anything else stays a plain throw.
export type ConfigLoadCode = 'CONFIG_MISSING' | 'CONFIG_INVALID';

export class ConfigLoadError extends Error {
  readonly code: ConfigLoadCode;
  readonly directory: string;
  readonly filename: string;

  constructor(input: { code: ConfigLoadCode; message: string; directory: string; filename: string }) {
    super(input.message);
    this.name = 'ConfigLoadError';
    this.code = input.code;
    this.directory = input.directory;
    this.filename = input.filename;
  }
}

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
  throw new ConfigLoadError({
    code: 'CONFIG_MISSING',
    message: `No ${CONFIG_FILENAME} file found in ${directory}`,
    directory,
    filename: CONFIG_FILENAME,
  });
}

type ConfigModule = { default?: SiteConfig; siteConfig?: SiteConfig };

// jiti still returns a truthy .default when the file has no default export.
// The `in` check ignores that synthetic object.
function readConfigExport(module: ConfigModule): SiteConfig | undefined {
  if ('siteConfig' in module && module.siteConfig) return module.siteConfig;
  if ('default' in module && module.default) return module.default;
  return undefined;
}

export async function loadSiteConfig(directory = process.cwd()): Promise<SiteConfig> {
  const file = await findConfigFile(directory);
  const jiti = createJiti(import.meta.url);
  const module = (await jiti.import(file)) as ConfigModule;
  const config = readConfigExport(module);
  if (!config) {
    const filename = path.basename(file);
    throw new ConfigLoadError({
      code: 'CONFIG_INVALID',
      message: `${filename} must export a default config or siteConfig.`,
      directory,
      filename,
    });
  }
  return config;
}

