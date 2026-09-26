import path from "node:path";
import { PKG_NAME } from "../../constants.js";
import { configImport } from "./helpers.js";

function astroLlmsRoute(llmsImport: string): string {
  return `import { generateLlms } from '${PKG_NAME}';
import { siteConfig } from '${llmsImport}';

export async function GET() {
  return new Response(generateLlms(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`;
}

function astroLlmsFullRoute(llmsFullImport: string): string {
  return `import { generateLlmsFull } from '${PKG_NAME}';
import { siteConfig } from '${llmsFullImport}';

export async function GET() {
  return new Response(generateLlmsFull(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`;
}

function astroWebmcpRoute(webmcpImport: string): string {
  return `import { generateWebmcp } from '${PKG_NAME}';
import { siteConfig } from '${webmcpImport}';

export async function GET() {
  return new Response(JSON.stringify(generateWebmcp(siteConfig), null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
`;
}

function astroSitemapRoute(sitemapImport: string): string {
  return `import { generateSitemap } from '${PKG_NAME}';
import { siteConfig } from '${sitemapImport}';

export async function GET() {
  return new Response(generateSitemap(siteConfig), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
}
`;
}

function astroRobotsRoute(robotsImport: string): string {
  return `import { generateRobots } from '${PKG_NAME}';
import { siteConfig } from '${robotsImport}';

export async function GET() {
  return new Response(generateRobots(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`;
}

function astroJsonLdComponent(jsonLdImport: string): string {
  return `---
import { generateJsonLd, type JsonLdKind } from '${PKG_NAME}';
import { siteConfig } from '${jsonLdImport}';

interface Props {
  kind?: JsonLdKind;
}

const { kind = 'software' } = Astro.props as Props;
const data = generateJsonLd(siteConfig, kind);
---
<script type="application/ld+json" set:html={JSON.stringify(data)}></script>
`;
}

function astroMirrorRoute(mirrorImport: string): string {
  return `import { generateLlmsFull } from '${PKG_NAME}';
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
`;
}

export function astroTemplates(root: string): Map<string, string> {
  const llmsImport = configImport(root, path.join(root, "src/pages/llms.txt.ts"));
  const llmsFullImport = configImport(root, path.join(root, "src/pages/llms-full.txt.ts"));
  const webmcpImport = configImport(root, path.join(root, "src/pages/webmcp.json.ts"));
  const sitemapImport = configImport(root, path.join(root, "src/pages/sitemap.xml.ts"));
  const robotsImport = configImport(root, path.join(root, "src/pages/robots.txt.ts"));
  const jsonLdImport = configImport(root, path.join(root, "src/components/seo/JsonLd.astro"));
  const mirrorImport = configImport(root, path.join(root, "src/pages/[page].md.ts"));
  return new Map([
    ["src/pages/llms.txt.ts", astroLlmsRoute(llmsImport)],
    ["src/pages/llms-full.txt.ts", astroLlmsFullRoute(llmsFullImport)],
    ["src/pages/webmcp.json.ts", astroWebmcpRoute(webmcpImport)],
    ["src/pages/sitemap.xml.ts", astroSitemapRoute(sitemapImport)],
    ["src/pages/robots.txt.ts", astroRobotsRoute(robotsImport)],
    ["src/components/seo/JsonLd.astro", astroJsonLdComponent(jsonLdImport)],
    ["src/pages/[page].md.ts", astroMirrorRoute(mirrorImport)],
  ]);
}
