import path from 'node:path';
import { PKG_NAME } from '../../constants.js';
import { configImport } from './helpers.js';

function nuxtLlmsRoute(llmsImport: string): string {
  return `import { generateLlms } from '${PKG_NAME}';
import { siteConfig } from '${llmsImport}';

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8');
  return generateLlms(siteConfig);
});
`;
}

function nuxtLlmsFullRoute(llmsFullImport: string): string {
  return `import { generateLlmsFull } from '${PKG_NAME}';
import { siteConfig } from '${llmsFullImport}';

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8');
  return generateLlmsFull(siteConfig);
});
`;
}

function nuxtWebmcpRoute(webmcpImport: string): string {
  return `import { generateWebmcp } from '${PKG_NAME}';
import { siteConfig } from '${webmcpImport}';

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'application/json; charset=utf-8');
  return JSON.stringify(generateWebmcp(siteConfig), null, 2);
});
`;
}

function nuxtSitemapRoute(sitemapImport: string): string {
  return `import { generateSitemap } from '${PKG_NAME}';
import { siteConfig } from '${sitemapImport}';

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'application/xml; charset=utf-8');
  return generateSitemap(siteConfig);
});
`;
}

function nuxtRobotsRoute(robotsImport: string): string {
  return `import { generateRobots } from '${PKG_NAME}';
import { siteConfig } from '${robotsImport}';

export default defineEventHandler((event) => {
  setHeader(event, 'content-type', 'text/plain; charset=utf-8');
  return generateRobots(siteConfig);
});
`;
}

function nuxtJsonLdComponent(jsonLdImport: string): string {
  return `<script setup lang="ts">
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
`;
}

function nuxtMirrorRoute(mirrorImport: string): string {
  return `import { generateLlmsFull } from '${PKG_NAME}';
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
`;
}

export function nuxtTemplates(root: string): Map<string, string> {
  const llmsImport = configImport(root, path.join(root, 'server/routes/llms.txt.get.ts'));
  const llmsFullImport = configImport(root, path.join(root, 'server/routes/llms-full.txt.get.ts'));
  const webmcpImport = configImport(root, path.join(root, 'server/routes/webmcp.json.get.ts'));
  const sitemapImport = configImport(root, path.join(root, 'server/routes/sitemap.xml.get.ts'));
  const robotsImport = configImport(root, path.join(root, 'server/routes/robots.txt.get.ts'));
  const jsonLdImport = configImport(root, path.join(root, 'components/SeoJsonLd.vue'));
  const mirrorImport = configImport(root, path.join(root, 'server/routes/[page].md.get.ts'));
  return new Map([
    ['server/routes/llms.txt.get.ts', nuxtLlmsRoute(llmsImport)],
    ['server/routes/llms-full.txt.get.ts', nuxtLlmsFullRoute(llmsFullImport)],
    ['server/routes/webmcp.json.get.ts', nuxtWebmcpRoute(webmcpImport)],
    ['server/routes/sitemap.xml.get.ts', nuxtSitemapRoute(sitemapImport)],
    ['server/routes/robots.txt.get.ts', nuxtRobotsRoute(robotsImport)],
    ['components/SeoJsonLd.vue', nuxtJsonLdComponent(jsonLdImport)],
    ['server/routes/[page].md.get.ts', nuxtMirrorRoute(mirrorImport)],
  ]);
}
