import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CONFIG_FILENAME, PKG_NAME } from '../constants.js';
import { defineConfig, type SiteConfig } from '../config.js';
import { generateLlms, generateLlmsFull, generateRobots, generateSitemap, generateWebmcp } from '../generators/index.js';
import { nextTemplates } from './init-templates/next.js';
import { astroTemplates } from './init-templates/astro.js';
import { svelteKitTemplates } from './init-templates/sveltekit.js';
import { nuxtTemplates } from './init-templates/nuxt.js';
import { remixTemplates } from './init-templates/remix.js';

export interface InitOptions {
  directory: string;
  force?: boolean;
}

export interface InitResult {
  mode: 'next' | 'astro' | 'sveltekit' | 'nuxt' | 'remix' | 'static';
  created: string[];
  skipped: string[];
}

function configTemplate(): string {
  return `import { defineConfig } from '${PKG_NAME}';

export const siteConfig = defineConfig({
  siteName: 'Your site',
  siteUrl: 'https://example.com',
  description: 'A short description of what your site does.',
  platforms: [],
  tools: [],
  plans: [],
  faq: [],
  pages: [],
});

export default siteConfig;
`;
}

async function hasConfigFile(directory: string, pattern: RegExp): Promise<boolean> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries.some(entry => pattern.test(entry.name));
  } catch {
    return false;
  }
}

async function isNextProject(directory: string): Promise<boolean> {
  const entries = await readdir(directory, { withFileTypes: true });
  const hasNextConfig = entries.some(entry => /^next\.config\./.test(entry.name));
  try {
    const appDirectory = path.join(directory, 'src/app');
    await access(appDirectory);
    return hasNextConfig;
  } catch {
    return false;
  }
}

async function isAstroProject(directory: string): Promise<boolean> {
  return hasConfigFile(directory, /^astro\.config\./);
}

async function isSvelteKitProject(directory: string): Promise<boolean> {
  return hasConfigFile(directory, /^svelte\.config\./);
}

async function isNuxtProject(directory: string): Promise<boolean> {
  return hasConfigFile(directory, /^nuxt\.config\./);
}

async function isRemixProject(directory: string): Promise<boolean> {
  if (await hasConfigFile(directory, /^remix\.config\./)) return true;
  if (!(await hasConfigFile(directory, /^vite\.config\./))) return false;
  try {
    const pkgRaw = await readFile(path.join(directory, 'package.json'), 'utf8');
    return pkgRaw.includes('@remix-run');
  } catch {
    return false;
  }
}

interface WriteIfNeededOptions {
  root: string;
  relativePath: string;
  content: string;
  force: boolean;
  result: InitResult;
}

async function writeIfNeeded(options: WriteIfNeededOptions): Promise<void> {
  const { root, relativePath, content, force, result } = options;
  const file = path.join(root, relativePath);
  try {
    await access(file);
    if (!force) {
      result.skipped.push(relativePath);
      return;
    }
  } catch {
    // The file does not exist yet.
  }
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content, 'utf8');
  result.created.push(relativePath);
}

function createDefaultConfig(): SiteConfig {
  return defineConfig({
    siteName: 'Your site',
    siteUrl: 'https://example.com',
    description: 'A short description of what your site does.',
    tools: [],
  });
}

async function prepareRoot(directory: string): Promise<string> {
  const root = path.resolve(directory);
  await mkdir(root, { recursive: true });
  return root;
}

interface DetectedFramework {
  mode: InitResult['mode'];
  templates: Map<string, string> | null;
}

async function detectFramework(root: string): Promise<DetectedFramework> {
  if (await isNextProject(root)) return { mode: 'next', templates: nextTemplates(root) };
  if (await isAstroProject(root)) return { mode: 'astro', templates: astroTemplates(root) };
  if (await isSvelteKitProject(root)) return { mode: 'sveltekit', templates: svelteKitTemplates(root) };
  if (await isNuxtProject(root)) return { mode: 'nuxt', templates: nuxtTemplates(root) };
  if (await isRemixProject(root)) return { mode: 'remix', templates: remixTemplates(root) };
  return { mode: 'static', templates: null };
}

function createInitResult(mode: InitResult['mode']): InitResult {
  return { mode, created: [], skipped: [] };
}

async function writeConfigFile(root: string, force: boolean, result: InitResult): Promise<void> {
  await writeIfNeeded({ root, relativePath: CONFIG_FILENAME, content: configTemplate(), force, result });
}

async function writeTemplateFiles(root: string, templates: Map<string, string>, force: boolean, result: InitResult): Promise<void> {
  for (const [file, content] of templates) {
    await writeIfNeeded({ root, relativePath: file, content, force, result });
  }
}

function buildStaticFiles(config: SiteConfig): Map<string, string> {
  return new Map([
    ['llms.txt', generateLlms(config)],
    ['llms-full.txt', generateLlmsFull(config)],
    ['sitemap.xml', generateSitemap(config)],
    ['robots.txt', generateRobots(config)],
    ['webmcp.json', JSON.stringify(generateWebmcp(config), null, 2) + '\n'],
  ]);
}

async function writeStaticFiles(root: string, config: SiteConfig, force: boolean, result: InitResult): Promise<void> {
  const staticFiles = buildStaticFiles(config);
  for (const [file, content] of staticFiles) {
    await writeIfNeeded({ root, relativePath: file, content, force, result });
  }
}

export async function initProject(options: InitOptions): Promise<InitResult> {
  const root = await prepareRoot(options.directory);
  const config = createDefaultConfig();
  const detected = await detectFramework(root);
  const result = createInitResult(detected.mode);
  await writeConfigFile(root, options.force ?? false, result);
  if (detected.templates) {
    await writeTemplateFiles(root, detected.templates, options.force ?? false, result);
  } else {
    await writeStaticFiles(root, config, options.force ?? false, result);
  }
  return result;
}
