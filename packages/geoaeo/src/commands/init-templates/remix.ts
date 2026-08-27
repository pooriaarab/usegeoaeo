import path from 'node:path';
import { PKG_NAME } from '../../constants.js';
import { configImport } from './helpers.js';

function remixLlmsRoute(llmsImport: string): string {
  return `import { generateLlms } from '${PKG_NAME}';
import { siteConfig } from '${llmsImport}';

export function loader() {
  return new Response(generateLlms(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`;
}

function remixLlmsFullRoute(llmsFullImport: string): string {
  return `import { generateLlmsFull } from '${PKG_NAME}';
import { siteConfig } from '${llmsFullImport}';

export function loader() {
  return new Response(generateLlmsFull(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`;
}

function remixWebmcpRoute(webmcpImport: string): string {
  return `import { generateWebmcp } from '${PKG_NAME}';
import { siteConfig } from '${webmcpImport}';

export function loader() {
  return new Response(JSON.stringify(generateWebmcp(siteConfig), null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
`;
}

function remixSitemapRoute(sitemapImport: string): string {
  return `import { generateSitemap } from '${PKG_NAME}';
import { siteConfig } from '${sitemapImport}';

export function loader() {
  return new Response(generateSitemap(siteConfig), {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
}
`;
}

function remixRobotsRoute(robotsImport: string): string {
  return `import { generateRobots } from '${PKG_NAME}';
import { siteConfig } from '${robotsImport}';

export function loader() {
  return new Response(generateRobots(siteConfig), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
`;
}

function remixJsonLdComponent(jsonLdImport: string): string {
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

function remixMirrorRoute(mirrorImport: string): string {
  return `import type { LoaderFunctionArgs } from '@remix-run/node';
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
`;
}

export function remixTemplates(root: string): Map<string, string> {
  const llmsImport = configImport(root, path.join(root, 'app/routes/llms.txt.tsx'));
  const llmsFullImport = configImport(root, path.join(root, 'app/routes/llms-full.txt.tsx'));
  const webmcpImport = configImport(root, path.join(root, 'app/routes/webmcp[.]json.tsx'));
  const sitemapImport = configImport(root, path.join(root, 'app/routes/sitemap[.]xml.tsx'));
  const robotsImport = configImport(root, path.join(root, 'app/routes/robots[.]txt.tsx'));
  const jsonLdImport = configImport(root, path.join(root, 'app/components/seo/json-ld.tsx'));
  const mirrorImport = configImport(root, path.join(root, 'app/routes/$page[.]md.tsx'));
  return new Map([
    ['app/routes/llms.txt.tsx', remixLlmsRoute(llmsImport)],
    ['app/routes/llms-full.txt.tsx', remixLlmsFullRoute(llmsFullImport)],
    ['app/routes/webmcp[.]json.tsx', remixWebmcpRoute(webmcpImport)],
    ['app/routes/sitemap[.]xml.tsx', remixSitemapRoute(sitemapImport)],
    ['app/routes/robots[.]txt.tsx', remixRobotsRoute(robotsImport)],
    ['app/components/seo/json-ld.tsx', remixJsonLdComponent(jsonLdImport)],
    ['app/routes/$page[.]md.tsx', remixMirrorRoute(mirrorImport)],
  ]);
}
