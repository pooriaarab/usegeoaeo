import { access, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CONFIG_FILENAME, PKG_NAME } from '../constants.js';
import { defineConfig, type SiteConfig } from '../config.js';
import { generateLlms, generateLlmsFull, generateRobots, generateSitemap, generateWebmcp } from '../generators/index.js';

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

function astroTemplates(root: string): Map<string, string> {
  const llmsImport = configImport(root, path.join(root, 'src/pages/llms.txt.ts'));
  const llmsFullImport = configImport(root, path.join(root, 'src/pages/llms-full.txt.ts'));
  const webmcpImport = configImport(root, path.join(root, 'src/pages/webmcp.json.ts'));
  const sitemapImport = configImport(root, path.join(root, 'src/pages/sitemap.xml.ts'));
  const robotsImport = configImport(root, path.join(root, 'src/pages/robots.txt.ts'));
  const jsonLdImport = configImport(root, path.join(root, 'src/components/seo/JsonLd.astro'));
  const mirrorImport = configImport(root, path.join(root, 'src/pages/[page].md.ts'));
  return new Map([
    ['src/pages/llms.txt.ts', `import { generateLlms } from '${PKG_NAME}';
import { siteConfig } from '${llmsImport}';

export async function GET() {
  return new Response(generateLlms(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`],
    ['src/pages/llms-full.txt.ts', `import { generateLlmsFull } from '${PKG_NAME}';
import { siteConfig } from '${llmsFullImport}';

export async function GET() {
  return new Response(generateLlmsFull(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`],
    ['src/pages/webmcp.json.ts', `import { generateWebmcp } from '${PKG_NAME}';
import { siteConfig } from '${webmcpImport}';

export async function GET() {
  return new Response(JSON.stringify(generateWebmcp(siteConfig), null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
`],
    ['src/pages/sitemap.xml.ts', `import { generateSitemap } from '${PKG_NAME}';
import { siteConfig } from '${sitemapImport}';

export async function GET() {
  return new Response(generateSitemap(siteConfig), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
}
`],
    ['src/pages/robots.txt.ts', `import { generateRobots } from '${PKG_NAME}';
import { siteConfig } from '${robotsImport}';

export async function GET() {
  return new Response(generateRobots(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`],
    ['src/components/seo/JsonLd.astro', `---
import { generateJsonLd, type JsonLdKind } from '${PKG_NAME}';
import { siteConfig } from '${jsonLdImport}';

interface Props {
  kind?: JsonLdKind;
}

const { kind = 'software' } = Astro.props as Props;
const data = generateJsonLd(siteConfig, kind);
---
<script type="application/ld+json" set:html={JSON.stringify(data)}></script>
`],
    ['src/pages/[page].md.ts', `import { generateLlmsFull } from '${PKG_NAME}';
import { siteConfig } from '${mirrorImport}';

export async function getStaticPaths() {
  const pages = siteConfig.pages ?? [];
  return pages.map((page) => ({ params: { page } }));
}

export async function GET({ params }: { params: { page: string } }) {
  const body = \`# \${params.page}

\${siteConfig.description}

Read more: \${siteConfig.siteUrl}/\${params.page}

\${generateLlmsFull(siteConfig)}\n\`;
  return new Response(body, { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
}
`],
  ]);
}

function svelteKitTemplates(root: string): Map<string, string> {
  const llmsImport = configImport(root, path.join(root, 'src/routes/llms.txt/+server.ts'));
  const llmsFullImport = configImport(root, path.join(root, 'src/routes/llms-full.txt/+server.ts'));
  const webmcpImport = configImport(root, path.join(root, 'src/routes/webmcp.json/+server.ts'));
  const sitemapImport = configImport(root, path.join(root, 'src/routes/sitemap.xml/+server.ts'));
  const robotsImport = configImport(root, path.join(root, 'src/routes/robots.txt/+server.ts'));
  const jsonLdImport = configImport(root, path.join(root, 'src/lib/components/JsonLd.svelte'));
  const mirrorImport = configImport(root, path.join(root, 'src/routes/[page].md/+server.ts'));
  return new Map([
    ['src/routes/llms.txt/+server.ts', `import { generateLlms } from '${PKG_NAME}';
import { siteConfig } from '${llmsImport}';

export function GET() {
  return new Response(generateLlms(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`],
    ['src/routes/llms-full.txt/+server.ts', `import { generateLlmsFull } from '${PKG_NAME}';
import { siteConfig } from '${llmsFullImport}';

export function GET() {
  return new Response(generateLlmsFull(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`],
    ['src/routes/webmcp.json/+server.ts', `import { generateWebmcp } from '${PKG_NAME}';
import { siteConfig } from '${webmcpImport}';

export function GET() {
  return new Response(JSON.stringify(generateWebmcp(siteConfig), null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
`],
    ['src/routes/sitemap.xml/+server.ts', `import { generateSitemap } from '${PKG_NAME}';
import { siteConfig } from '${sitemapImport}';

export function GET() {
  return new Response(generateSitemap(siteConfig), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
}
`],
    ['src/routes/robots.txt/+server.ts', `import { generateRobots } from '${PKG_NAME}';
import { siteConfig } from '${robotsImport}';

export function GET() {
  return new Response(generateRobots(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`],
    ['src/lib/components/JsonLd.svelte', `<script lang="ts">
  import { generateJsonLd, type JsonLdKind } from '${PKG_NAME}';
  import { siteConfig } from '${jsonLdImport}';

  export let kind: JsonLdKind = 'software';
  const data = generateJsonLd(siteConfig, kind);
</script>

<svelte:head>
  {@html \`<script type="application/ld+json">\${JSON.stringify(data)}</script>\`}
</svelte:head>
`],
    ['src/routes/[page].md/+server.ts', `import { generateLlmsFull } from '${PKG_NAME}';
import { siteConfig } from '${mirrorImport}';

export function GET({ params }: { params: { page: string } }) {
  const body = \`# \${params.page}

\${siteConfig.description}

Read more: \${siteConfig.siteUrl}/\${params.page}

\${generateLlmsFull(siteConfig)}\n\`;
  return new Response(body, { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
}
`],
  ]);
}

function nuxtTemplates(root: string): Map<string, string> {
  const llmsImport = configImport(root, path.join(root, 'server/routes/llms.txt.get.ts'));
  const llmsFullImport = configImport(root, path.join(root, 'server/routes/llms-full.txt.get.ts'));
  const webmcpImport = configImport(root, path.join(root, 'server/routes/webmcp.json.get.ts'));
  const sitemapImport = configImport(root, path.join(root, 'server/routes/sitemap.xml.get.ts'));
  const robotsImport = configImport(root, path.join(root, 'server/routes/robots.txt.get.ts'));
  const jsonLdImport = configImport(root, path.join(root, 'components/SeoJsonLd.vue'));
  const mirrorImport = configImport(root, path.join(root, 'server/routes/[page].md.get.ts'));
  return new Map([
    ['server/routes/llms.txt.get.ts', `import { generateLlms } from '${PKG_NAME}';
import { siteConfig } from '${llmsImport}';

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8');
  return generateLlms(siteConfig);
});
`],
    ['server/routes/llms-full.txt.get.ts', `import { generateLlmsFull } from '${PKG_NAME}';
import { siteConfig } from '${llmsFullImport}';

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8');
  return generateLlmsFull(siteConfig);
});
`],
    ['server/routes/webmcp.json.get.ts', `import { generateWebmcp } from '${PKG_NAME}';
import { siteConfig } from '${webmcpImport}';

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'application/json; charset=utf-8');
  return JSON.stringify(generateWebmcp(siteConfig), null, 2);
});
`],
    ['server/routes/sitemap.xml.get.ts', `import { generateSitemap } from '${PKG_NAME}';
import { siteConfig } from '${sitemapImport}';

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'application/xml; charset=utf-8');
  return generateSitemap(siteConfig);
});
`],
    ['server/routes/robots.txt.get.ts', `import { generateRobots } from '${PKG_NAME}';
import { siteConfig } from '${robotsImport}';

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8');
  return generateRobots(siteConfig);
});
`],
    ['components/SeoJsonLd.vue', `<script setup lang="ts">
import { generateJsonLd, type JsonLdKind } from '${PKG_NAME}';
import { siteConfig } from '${jsonLdImport}';

const props = defineProps<{ kind: JsonLdKind }>();
const data = generateJsonLd(siteConfig, props.kind);

useHead({
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(data) }],
});
</script>

<template>
  <span v-if="false" />
</template>
`],
    ['server/routes/[page].md.get.ts', `import { generateLlmsFull } from '${PKG_NAME}';
import { siteConfig } from '${mirrorImport}';

export default defineEventHandler((event) => {
  const page = getRouterParam(event, 'page') ?? 'index';
  const body = \`# \${page}

\${siteConfig.description}

Read more: \${siteConfig.siteUrl}/\${page}

\${generateLlmsFull(siteConfig)}\n\`;
  setHeader(event, 'content-type', 'text/markdown; charset=utf-8');
  return body;
});
`],
  ]);
}

function remixTemplates(root: string): Map<string, string> {
  const llmsImport = configImport(root, path.join(root, 'app/routes/llms.txt.tsx'));
  const llmsFullImport = configImport(root, path.join(root, 'app/routes/llms-full.txt.tsx'));
  const webmcpImport = configImport(root, path.join(root, 'app/routes/webmcp[.]json.tsx'));
  const sitemapImport = configImport(root, path.join(root, 'app/routes/sitemap[.]xml.tsx'));
  const robotsImport = configImport(root, path.join(root, 'app/routes/robots[.]txt.tsx'));
  const jsonLdImport = configImport(root, path.join(root, 'app/components/seo/json-ld.tsx'));
  const mirrorImport = configImport(root, path.join(root, 'app/routes/$page[.]md.tsx'));
  return new Map([
    ['app/routes/llms.txt.tsx', `import { generateLlms } from '${PKG_NAME}';
import { siteConfig } from '${llmsImport}';

export function loader() {
  return new Response(generateLlms(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`],
    ['app/routes/llms-full.txt.tsx', `import { generateLlmsFull } from '${PKG_NAME}';
import { siteConfig } from '${llmsFullImport}';

export function loader() {
  return new Response(generateLlmsFull(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`],
    ['app/routes/webmcp[.]json.tsx', `import { generateWebmcp } from '${PKG_NAME}';
import { siteConfig } from '${webmcpImport}';

export function loader() {
  return new Response(JSON.stringify(generateWebmcp(siteConfig), null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
`],
    ['app/routes/sitemap[.]xml.tsx', `import { generateSitemap } from '${PKG_NAME}';
import { siteConfig } from '${sitemapImport}';

export function loader() {
  return new Response(generateSitemap(siteConfig), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
}
`],
    ['app/routes/robots[.]txt.tsx', `import { generateRobots } from '${PKG_NAME}';
import { siteConfig } from '${robotsImport}';

export function loader() {
  return new Response(generateRobots(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`],
    ['app/components/seo/json-ld.tsx', `import { generateJsonLd, type JsonLdKind } from '${PKG_NAME}';
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
    ['app/routes/$page[.]md.tsx', `import type { LoaderFunctionArgs } from '@remix-run/node';
import { generateLlmsFull } from '${PKG_NAME}';
import { siteConfig } from '${mirrorImport}';

export function loader({ params }: LoaderFunctionArgs) {
  const page = params.page ?? 'index';
  const body = \`# \${page}

\${siteConfig.description}

Read more: \${siteConfig.siteUrl}/\${page}

\${generateLlmsFull(siteConfig)}\n\`;
  return new Response(body, { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
}
`],
  ]);
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
  let mode: InitResult['mode'] = 'static';
  let templates: Map<string, string> | null = null;
  if (next) {
    mode = 'next';
    templates = nextTemplates(root);
  } else if (await isAstroProject(root)) {
    mode = 'astro';
    templates = astroTemplates(root);
  } else if (await isSvelteKitProject(root)) {
    mode = 'sveltekit';
    templates = svelteKitTemplates(root);
  } else if (await isNuxtProject(root)) {
    mode = 'nuxt';
    templates = nuxtTemplates(root);
  } else if (await isRemixProject(root)) {
    mode = 'remix';
    templates = remixTemplates(root);
  }
  const result: InitResult = { mode, created: [], skipped: [] };
  await writeIfNeeded(root, CONFIG_FILENAME, configTemplate(), options.force ?? false, result);
  if (templates) {
    for (const [file, content] of templates) await writeIfNeeded(root, file, content, options.force ?? false, result);
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
