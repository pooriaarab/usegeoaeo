import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { auditTarget, type AuditCheck } from '../src/audit.js';

const liveUrl = 'https://artifact.example';
const originalFetch = globalThis.fetch;

const humanLlmsFull = `# Acme Field Notes -- full content

> Acme publishes teardown notes on industrial calibration rigs.

## About Acme

Acme is a two-person shop that documents calibration rigs in plain
language, with the data tables left in.

## Latest notes

- Rig 4 teardown: the gasket failed at the flange, not the weld.
- Why torque specs drift after the third service cycle.
`;

const htmlErrorPage =
  '<!DOCTYPE html><html><head><title>404 Not Found</title></head>' +
  '<body><h1>Not Found</h1><p>The requested URL was not found.</p></body></html>';

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://artifact.example/sitemap-1.xml</loc></sitemap>
</sitemapindex>
`;

function installFetch(bodies: Record<string, string>): void {
  globalThis.fetch = async (input: RequestInfo | URL) => {
    const artifactPath = Object.keys(bodies).find(candidate => String(input) === `${liveUrl}${candidate}`);
    return artifactPath ? new Response(bodies[artifactPath], { status: 200 }) : new Response('', { status: 404 });
  };
}

function check(report: { checks: AuditCheck[] }, id: string): AuditCheck {
  const found = report.checks.find(item => item.id === id);
  if (!found) throw new Error(`${id} check missing`);
  return found;
}

const dirs: string[] = [];

function writeRoute(dir: string, routePath: string, source: string): void {
  const routeDir = path.join(dir, 'app', routePath);
  mkdirSync(routeDir, { recursive: true });
  writeFileSync(path.join(routeDir, 'route.ts'), source);
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('artifact checks on a fetched body', () => {
  it('passes a human-written llms-full.txt with no geoaeo headings or identifiers', async () => {
    installFetch({ '/llms-full.txt': humanLlmsFull });
    const report = await auditTarget(liveUrl);
    expect(check(report, 'llms-full').passed).toBe(true);
  });

  it('fails an empty llms-full.txt body', async () => {
    installFetch({ '/llms-full.txt': '   \n  ' });
    const report = await auditTarget(liveUrl);
    expect(check(report, 'llms-full').passed).toBe(false);
  });

  it('fails an HTML error page served as llms-full.txt', async () => {
    installFetch({ '/llms-full.txt': htmlErrorPage });
    const report = await auditTarget(liveUrl);
    expect(check(report, 'llms-full').passed).toBe(false);
  });

  it('fails a heading-only llms-full.txt stub', async () => {
    installFetch({ '/llms-full.txt': '# Acme\n\nA one-liner.\n' });
    const report = await auditTarget(liveUrl);
    expect(check(report, 'llms-full').passed).toBe(false);
  });

  it('passes a sitemap index file served as sitemap.xml', async () => {
    installFetch({ '/sitemap.xml': sitemapIndex });
    const report = await auditTarget(liveUrl);
    expect(check(report, 'sitemap').passed).toBe(true);
  });
});

describe('artifact checks on a directory audit', () => {
  it('passes llms-full when route.ts source calls generateLlmsFull', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'geoaeo-artifacts-'));
    dirs.push(dir);
    writeRoute(dir, 'llms-full.txt', "import { generateLlmsFull } from 'geoaeo';\nexport function GET() { return new Response(generateLlmsFull(siteConfig)); }\n");
    const report = await auditTarget(dir);
    expect(check(report, 'llms-full').passed).toBe(true);
  });

  it('passes robots when route.ts source calls generateRobots', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'geoaeo-artifacts-'));
    dirs.push(dir);
    writeRoute(dir, 'robots.txt', "import { generateRobots } from 'geoaeo';\nexport function GET() { return new Response(generateRobots(siteConfig)); }\n");
    const report = await auditTarget(dir);
    expect(check(report, 'robots').passed).toBe(true);
  });
});
