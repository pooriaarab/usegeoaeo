import { access, mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CONFIG_FILENAME, PKG_NAME } from '../constants.js';
import { defineConfig, type SiteConfig } from '../config.js';
import { generateLlms, generateLlmsFull, generateRobots, generateSitemap, generateWebmcp } from '../generators/index.js';

export interface InitOptions {
  directory: string;
  force?: boolean;
}

export interface InitResult {
  mode: 'next' | 'static';
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

function configImport(root: string, fromFile: string): string {
  const configPath = CONFIG_FILENAME.replace(/\.ts$/, '');
  const relative = path.relative(path.dirname(fromFile), path.join(root, configPath)).replaceAll('\\', '/');
  return relative.startsWith('.') ? relative : `./${relative}`;
}

function nextTemplates(root: string): Map<string, string> {
  const llmsImport = configImport(root, path.join(root, 'src/app/llms.txt/route.ts'));
  const llmsFullImport = configImport(root, path.join(root, 'src/app/llms-full.txt/route.ts'));
  const webmcpImport = configImport(root, path.join(root, 'src/app/webmcp/route.ts'));
  const sitemapImport = configImport(root, path.join(root, 'src/app/sitemap.ts'));
  const robotsImport = configImport(root, path.join(root, 'src/app/robots.ts'));
  const jsonLdImport = configImport(root, path.join(root, 'src/components/seo/json-ld.tsx'));
  const mirrorImport = configImport(root, path.join(root, 'src/app/[page].md/route.ts'));
  return new Map([
    ['src/app/llms.txt/route.ts', `import { generateLlms } from '${PKG_NAME}';
import { siteConfig } from '${llmsImport}';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateLlms(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`],
    ['src/app/llms-full.txt/route.ts', `import { generateLlmsFull } from '${PKG_NAME}';
import { siteConfig } from '${llmsFullImport}';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateLlmsFull(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`],
    ['src/app/webmcp/route.ts', `import { generateWebmcp } from '${PKG_NAME}';
import { siteConfig } from '${webmcpImport}';

export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(generateWebmcp(siteConfig), null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
`],
    ['src/app/sitemap.ts', `import type { MetadataRoute } from 'next';
import { sitemapUrls } from '${PKG_NAME}';
import { siteConfig } from '${sitemapImport}';

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapUrls(siteConfig).map((url, index) => ({
    url,
    changeFrequency: 'monthly',
    priority: index === 0 ? 1 : 0.8,
  }));
}
`],
    ['src/app/robots.ts', `import type { MetadataRoute } from 'next';
import { siteConfig } from '${robotsImport}';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', siteConfig.siteUrl).toString(),
  };
}
`],
    ['src/components/seo/json-ld.tsx', `import { generateJsonLd, type JsonLdKind } from '${PKG_NAME}';
import { siteConfig } from '${jsonLdImport}';

function JsonLd({ kind }: { kind: JsonLdKind }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateJsonLd(siteConfig, kind)) }} />;
}

export function SoftwareApplicationJsonLd() {
  return <JsonLd kind="software" />;
}

export function ProductJsonLd() {
  return <JsonLd kind="product" />;
}

export function FaqJsonLd() {
  return <JsonLd kind="faq" />;
}
`],
    ['src/app/[page].md/route.ts', `import { generateLlmsFull } from '${PKG_NAME}';
import { siteConfig } from '${mirrorImport}';

export const dynamic = 'force-static';

export async function GET(_request: Request, context: { params: Promise<{ page: string }> }) {
  const { page } = await context.params;
  const body = \`# \${page}

\${siteConfig.description}

Read more: \${siteConfig.siteUrl}/\${page}

\${generateLlmsFull(siteConfig)}\n\`;
  return new Response(body, { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
}
`],
  ]);
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

async function writeIfNeeded(root: string, relativePath: string, content: string, force: boolean, result: InitResult): Promise<void> {
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

export async function initProject(options: InitOptions): Promise<InitResult> {
  const root = path.resolve(options.directory);
  await mkdir(root, { recursive: true });
  const config: SiteConfig = defineConfig({
    siteName: 'Your site',
    siteUrl: 'https://example.com',
    description: 'A short description of what your site does.',
    tools: [],
  });
  const next = await isNextProject(root);
  const result: InitResult = { mode: next ? 'next' : 'static', created: [], skipped: [] };
  await writeIfNeeded(root, CONFIG_FILENAME, configTemplate(), options.force ?? false, result);
  if (next) {
    for (const [file, content] of nextTemplates(root)) await writeIfNeeded(root, file, content, options.force ?? false, result);
  } else {
    const staticFiles = new Map([
      ['llms.txt', generateLlms(config)],
      ['llms-full.txt', generateLlmsFull(config)],
      ['sitemap.xml', generateSitemap(config)],
      ['robots.txt', generateRobots(config)],
      ['webmcp.json', JSON.stringify(generateWebmcp(config), null, 2) + '\n'],
    ]);
    for (const [file, content] of staticFiles) await writeIfNeeded(root, file, content, options.force ?? false, result);
  }
  return result;
}
