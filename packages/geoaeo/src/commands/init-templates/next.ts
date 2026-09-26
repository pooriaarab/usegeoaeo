import path from "node:path";
import { PKG_NAME } from "../../constants.js";
import { configImport } from "./helpers.js";

function nextLlmsRoute(llmsImport: string): string {
  return `import { generateLlms } from '${PKG_NAME}';
import { siteConfig } from '${llmsImport}';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateLlms(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`;
}

function nextLlmsFullRoute(llmsFullImport: string): string {
  return `import { generateLlmsFull } from '${PKG_NAME}';
import { siteConfig } from '${llmsFullImport}';

export const dynamic = 'force-static';

export function GET() {
  return new Response(generateLlmsFull(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`;
}

function nextWebmcpRoute(webmcpImport: string): string {
  return `import { generateWebmcp } from '${PKG_NAME}';
import { siteConfig } from '${webmcpImport}';

export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(generateWebmcp(siteConfig), null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
`;
}

function nextSitemapRoute(sitemapImport: string): string {
  return `import type { MetadataRoute } from 'next';
import { sitemapUrls } from '${PKG_NAME}';
import { siteConfig } from '${sitemapImport}';

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapUrls(siteConfig).map((url, index) => ({
    url,
    changeFrequency: 'monthly',
    priority: index === 0 ? 1 : 0.8,
  }));
}
`;
}

function nextRobotsRoute(robotsImport: string): string {
  return `import type { MetadataRoute } from 'next';
import { siteConfig } from '${robotsImport}';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', siteConfig.siteUrl).toString(),
  };
}
`;
}

function nextJsonLdComponent(jsonLdImport: string): string {
  return `import { generateJsonLd, type JsonLdKind } from '${PKG_NAME}';
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
`;
}

function nextMirrorRoute(mirrorImport: string): string {
  return `import { generateLlmsFull } from '${PKG_NAME}';
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
`;
}

export function nextTemplates(root: string): Map<string, string> {
  const llmsImport = configImport(root, path.join(root, "src/app/llms.txt/route.ts"));
  const llmsFullImport = configImport(root, path.join(root, "src/app/llms-full.txt/route.ts"));
  const webmcpImport = configImport(root, path.join(root, "src/app/webmcp/route.ts"));
  const sitemapImport = configImport(root, path.join(root, "src/app/sitemap.ts"));
  const robotsImport = configImport(root, path.join(root, "src/app/robots.ts"));
  const jsonLdImport = configImport(root, path.join(root, "src/components/seo/json-ld.tsx"));
  const mirrorImport = configImport(root, path.join(root, "src/app/[page].md/route.ts"));
  return new Map([
    ["src/app/llms.txt/route.ts", nextLlmsRoute(llmsImport)],
    ["src/app/llms-full.txt/route.ts", nextLlmsFullRoute(llmsFullImport)],
    ["src/app/webmcp/route.ts", nextWebmcpRoute(webmcpImport)],
    ["src/app/sitemap.ts", nextSitemapRoute(sitemapImport)],
    ["src/app/robots.ts", nextRobotsRoute(robotsImport)],
    ["src/components/seo/json-ld.tsx", nextJsonLdComponent(jsonLdImport)],
    ["src/app/[page].md/route.ts", nextMirrorRoute(mirrorImport)],
  ]);
}
