import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { auditTarget, type AuditCheck } from '../src/audit.js';

const dirs: string[] = [];
const originalFetch = globalThis.fetch;
const liveUrl = 'https://staging.example';

function canonical(checks: AuditCheck[]): AuditCheck {
  const found = checks.find(item => item.id === 'canonical');
  if (!found) throw new Error('canonical check missing');
  return found;
}

function htmlPage(canonicalHref: string | undefined): string {
  const link = canonicalHref === undefined ? '' : `<link rel="canonical" href="${canonicalHref}">`;
  return `<html><head><title>P</title>${link}</head><body><h1>P</h1></body></html>`;
}

function writeSite(canonicalHrefs: Array<string | undefined>): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'geoaeo-canonical-'));
  dirs.push(dir);
  canonicalHrefs.forEach((href, index) => {
    const name = index === 0 ? 'index.html' : `page-${index}.html`;
    writeFileSync(path.join(dir, name), htmlPage(href));
  });
  return dir;
}

function writeSourceSite(canonicals: Array<[string, string]>): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'geoaeo-canonical-src-'));
  dirs.push(dir);
  for (const [route, href] of canonicals) {
    const routeDir = path.join(dir, 'app', route);
    mkdirSync(routeDir, { recursive: true });
    writeFileSync(
      path.join(routeDir, 'page.tsx'),
      `export const metadata = { alternates: { canonical: '${href}' } };\n` +
        'export default function Page() { return <h1>x</h1>; }\n',
    );
  }
  return dir;
}

function sitemap(urls: string[]): string {
  const locs = urls.map(url => `<url><loc>${url}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locs}\n</urlset>`;
}

function installFetch(pages: Record<string, string>): void {
  globalThis.fetch = async (input: RequestInfo | URL) => {
    const body = pages[String(input)];
    return body === undefined ? new Response('', { status: 404 }) : new Response(body, { status: 200 });
  };
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('canonical links on a directory audit', () => {
  it('fails when every inspected page declares the same canonical URL', async () => {
    const report = await auditTarget(
      writeSite(['https://site.example/', 'https://site.example/', 'https://site.example/']),
    );
    const check = canonical(report.checks);
    expect(report.pages).toHaveLength(3);
    expect(check.passed).toBe(false);
    expect(check.details).toBe(
      'All inspected pages declare the same canonical URL: https://site.example/.',
    );
  });

  it('fails when the shared canonical is spelled with and without a trailing slash', async () => {
    const report = await auditTarget(
      writeSite(['https://site.example', 'https://site.example/']),
    );
    const check = canonical(report.checks);
    expect(check.passed).toBe(false);
    expect(check.details).toContain('https://site.example');
  });

  it('passes a single inspected page', async () => {
    const report = await auditTarget(writeSite(['https://site.example/']));
    expect(report.pages).toHaveLength(1);
    expect(canonical(report.checks).passed).toBe(true);
  });

  it('passes distinct per-page canonicals', async () => {
    const report = await auditTarget(
      writeSite(['https://site.example/', 'https://site.example/docs', 'https://site.example/about']),
    );
    expect(canonical(report.checks).passed).toBe(true);
  });

  it('passes when only some pages point elsewhere', async () => {
    const report = await auditTarget(
      writeSite(['https://site.example/', 'https://site.example/', 'https://site.example/docs']),
    );
    expect(canonical(report.checks).passed).toBe(true);
  });

  it('does not fold real path spellings together', async () => {
    const report = await auditTarget(
      writeSite(['https://site.example/docs', 'https://site.example/docs/']),
    );
    expect(canonical(report.checks).passed).toBe(true);
  });

  it('still fails as missing when no page declares a canonical', async () => {
    const report = await auditTarget(writeSite([undefined, undefined]));
    const check = canonical(report.checks);
    expect(check.passed).toBe(false);
    expect(check.details).toBe('Missing: every inspected page has a canonical url.');
  });

  it('reports the missing tag, not a shared canonical, when one page lacks one', async () => {
    const report = await auditTarget(
      writeSite([undefined, 'https://site.example/', 'https://site.example/']),
    );
    const check = canonical(report.checks);
    expect(check.passed).toBe(false);
    expect(check.details).toBe('Missing: every inspected page has a canonical url.');
  });

  it('fails when source pages declare the same canonical', async () => {
    const report = await auditTarget(
      writeSourceSite([
        ['docs', 'https://site.example/'],
        ['guide', 'https://site.example/'],
      ]),
    );
    const check = canonical(report.checks);
    expect(report.pages).toHaveLength(2);
    expect(check.passed).toBe(false);
    expect(check.details).toContain('https://site.example/');
  });

  it('fails when source pages declare the same root-relative canonical', async () => {
    const report = await auditTarget(
      writeSourceSite([
        ['docs', '/'],
        ['guide', '/'],
      ]),
    );
    const check = canonical(report.checks);
    expect(check.passed).toBe(false);
    expect(check.details).toContain(': /');
  });

  it('passes source pages with distinct canonicals', async () => {
    const report = await auditTarget(
      writeSourceSite([
        ['docs', 'https://site.example/docs'],
        ['guide', 'https://site.example/guide'],
      ]),
    );
    expect(canonical(report.checks).passed).toBe(true);
  });
});

describe('canonical links on a URL audit', () => {
  it('fails when every sitemap page declares the home page as canonical', async () => {
    installFetch({
      [`${liveUrl}/sitemap.xml`]: sitemap([`${liveUrl}/docs`, `${liveUrl}/checklist`]),
      [liveUrl]: htmlPage(`${liveUrl}/`),
      [`${liveUrl}/docs`]: htmlPage(`${liveUrl}/`),
      [`${liveUrl}/checklist`]: htmlPage(`${liveUrl}/`),
    });
    const report = await auditTarget(liveUrl);
    const check = canonical(report.checks);
    expect(report.pages).toHaveLength(3);
    expect(check.passed).toBe(false);
    expect(check.details).toBe(`All inspected pages declare the same canonical URL: ${liveUrl}/.`);
  });

  it('fails when every page declares the same root-relative canonical', async () => {
    installFetch({
      [`${liveUrl}/sitemap.xml`]: sitemap([`${liveUrl}/docs`]),
      [liveUrl]: htmlPage('/'),
      [`${liveUrl}/docs`]: htmlPage('/'),
    });
    const report = await auditTarget(liveUrl);
    const check = canonical(report.checks);
    expect(check.passed).toBe(false);
    expect(check.details).toContain(': /');
  });

  it('passes when each sitemap page declares its own canonical', async () => {
    installFetch({
      [`${liveUrl}/sitemap.xml`]: sitemap([`${liveUrl}/docs`, `${liveUrl}/checklist`]),
      [liveUrl]: htmlPage(`${liveUrl}/`),
      [`${liveUrl}/docs`]: htmlPage(`${liveUrl}/docs`),
      [`${liveUrl}/checklist`]: htmlPage(`${liveUrl}/checklist`),
    });
    const report = await auditTarget(liveUrl);
    expect(canonical(report.checks).passed).toBe(true);
  });
});
