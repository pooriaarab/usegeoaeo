import path from "node:path";
import { PKG_NAME } from "../../constants.js";
import { configImport } from "./helpers.js";

function svelteKitLlmsRoute(llmsImport: string): string {
  return `import { generateLlms } from '${PKG_NAME}';
import { siteConfig } from '${llmsImport}';

export function GET() {
  return new Response(generateLlms(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`;
}

function svelteKitLlmsFullRoute(llmsFullImport: string): string {
  return `import { generateLlmsFull } from '${PKG_NAME}';
import { siteConfig } from '${llmsFullImport}';

export function GET() {
  return new Response(generateLlmsFull(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`;
}

function svelteKitWebmcpRoute(webmcpImport: string): string {
  return `import { generateWebmcp } from '${PKG_NAME}';
import { siteConfig } from '${webmcpImport}';

export function GET() {
  return new Response(JSON.stringify(generateWebmcp(siteConfig), null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
`;
}

function svelteKitSitemapRoute(sitemapImport: string): string {
  return `import { generateSitemap } from '${PKG_NAME}';
import { siteConfig } from '${sitemapImport}';

export function GET() {
  return new Response(generateSitemap(siteConfig), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
}
`;
}

function svelteKitRobotsRoute(robotsImport: string): string {
  return `import { generateRobots } from '${PKG_NAME}';
import { siteConfig } from '${robotsImport}';

export function GET() {
  return new Response(generateRobots(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`;
}

function svelteKitJsonLdComponent(jsonLdImport: string): string {
  return `<script lang="ts">
  import { generateJsonLd, type JsonLdKind } from '${PKG_NAME}';
  import { siteConfig } from '${jsonLdImport}';

  export let kind: JsonLdKind = 'software';
  const data = generateJsonLd(siteConfig, kind);
</script>

<svelte:head>
  {@html \`<script type="application/ld+json">\${JSON.stringify(data)}</script>\`}
</svelte:head>
`;
}

function svelteKitMirrorRoute(mirrorImport: string): string {
  return `import { generateLlmsFull } from '${PKG_NAME}';
import { siteConfig } from '${mirrorImport}';

export function GET({ params }: { params: { page: string } }) {
  const body = \`# \${params.page}

\${siteConfig.description}

Read more: \${siteConfig.siteUrl}/\${params.page}

\${generateLlmsFull(siteConfig)}\n\`;
  return new Response(body, { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
}
`;
}

export function svelteKitTemplates(root: string): Map<string, string> {
  const llmsImport = configImport(root, path.join(root, "src/routes/llms.txt/+server.ts"));
  const llmsFullImport = configImport(root, path.join(root, "src/routes/llms-full.txt/+server.ts"));
  const webmcpImport = configImport(root, path.join(root, "src/routes/webmcp.json/+server.ts"));
  const sitemapImport = configImport(root, path.join(root, "src/routes/sitemap.xml/+server.ts"));
  const robotsImport = configImport(root, path.join(root, "src/routes/robots.txt/+server.ts"));
  const jsonLdImport = configImport(root, path.join(root, "src/lib/components/JsonLd.svelte"));
  const mirrorImport = configImport(root, path.join(root, "src/routes/[page].md/+server.ts"));
  return new Map([
    ["src/routes/llms.txt/+server.ts", svelteKitLlmsRoute(llmsImport)],
    ["src/routes/llms-full.txt/+server.ts", svelteKitLlmsFullRoute(llmsFullImport)],
    ["src/routes/webmcp.json/+server.ts", svelteKitWebmcpRoute(webmcpImport)],
    ["src/routes/sitemap.xml/+server.ts", svelteKitSitemapRoute(sitemapImport)],
    ["src/routes/robots.txt/+server.ts", svelteKitRobotsRoute(robotsImport)],
    ["src/lib/components/JsonLd.svelte", svelteKitJsonLdComponent(jsonLdImport)],
    ["src/routes/[page].md/+server.ts", svelteKitMirrorRoute(mirrorImport)],
  ]);
}
