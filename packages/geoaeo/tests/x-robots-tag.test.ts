import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { auditTarget, type AuditCheck } from '../src/audit.js';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const staticSite = path.join(packageRoot, 'examples/static-html');
const liveUrl = 'https://staging.example';

const openPage =
  '<html><head><title>Staging</title></head><body><h1>Staging</h1>' +
  '<p>A staging page that should stay out of the index.</p></body></html>';

const metaNoindexPage =
  '<html><head><title>Staging</title><meta name="robots" content="noindex">' +
  '</head><body><h1>Staging</h1></body></html>';

function indexable(checks: AuditCheck[]): AuditCheck {
  const check = checks.find(item => item.id === 'meta-robots');
  if (!check) throw new Error('meta-robots check missing');
  return check;
}

const originalFetch = globalThis.fetch;

function installFetch(body: string, xRobotsTag?: string): void {
  globalThis.fetch = async (input: RequestInfo | URL) => {
    if (String(input) !== liveUrl) return new Response('', { status: 404 });
    const headers = new Headers();
    if (xRobotsTag !== undefined) headers.set('X-Robots-Tag', xRobotsTag);
    return new Response(body, { status: 200, headers });
  };
}

function rejectFetch(): { calls: number } {
  const seen = { calls: 0 };
  globalThis.fetch = async () => {
    seen.calls += 1;
    throw new Error('directory mode must not fetch');
  };
  return seen;
}

describe('X-Robots-Tag on a live URL', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it.each(['noindex', 'noindex, nofollow'])('fails meta-robots when the header is %s', async header => {
    installFetch(openPage, header);
    const report = await auditTarget(liveUrl);
    const check = indexable(report.checks);
    expect(check.passed).toBe(false);
    expect(check.weight).toBe(2);
    expect(check.details).toBe('noindex set by X-Robots-Tag header');
    expect(report.checks).toHaveLength(24);
    expect(report.checks.reduce((sum, item) => sum + item.weight, 0)).toBe(100);
  });

  it('passes meta-robots when the header does not set noindex', async () => {
    installFetch(openPage, 'index, follow');
    const report = await auditTarget(liveUrl);
    expect(indexable(report.checks)).toMatchObject({
      passed: true,
      weight: 2,
      details: 'No page is set to noindex.',
    });
  });

  it('names the meta tag when that is the only noindex signal', async () => {
    installFetch(metaNoindexPage);
    const report = await auditTarget(liveUrl);
    expect(indexable(report.checks).details).toBe('noindex set by meta tag');
  });

  it('names both signals when the header and the meta tag set noindex', async () => {
    installFetch(metaNoindexPage, 'noindex');
    const report = await auditTarget(liveUrl);
    expect(indexable(report.checks).details).toBe(
      'noindex set by X-Robots-Tag header; noindex set by meta tag',
    );
  });
});

describe('directory mode indexable check', () => {
  const dirs: string[] = [];

  afterEach(() => {
    globalThis.fetch = originalFetch;
    for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
    dirs.length = 0;
  });

  function writeSite(html: string): string {
    const dir = mkdtempSync(path.join(tmpdir(), 'geoaeo-robots-'));
    dirs.push(dir);
    writeFileSync(path.join(dir, 'index.html'), html);
    return dir;
  }

  it('still passes the static fixture and does not fetch', async () => {
    const fetchMock = rejectFetch();
    const report = await auditTarget(staticSite);
    const check = indexable(report.checks);
    expect(fetchMock.calls).toBe(0);
    expect(check).toMatchObject({
      id: 'meta-robots',
      label: 'Indexable',
      passed: true,
      weight: 2,
      details: 'No page is set to noindex.',
    });
  });

  it('still fails only from the meta tag', async () => {
    const fetchMock = rejectFetch();
    const report = await auditTarget(writeSite(metaNoindexPage));
    expect(fetchMock.calls).toBe(0);
    expect(indexable(report.checks)).toMatchObject({
      passed: false,
      details: 'noindex set by meta tag',
    });
  });

  it('ignores the word noindex outside the robots meta tag', async () => {
    const html =
      '<html><head><title>Ok</title></head><body><p>This page explains the noindex directive.</p></body></html>';
    const report = await auditTarget(writeSite(html));
    expect(indexable(report.checks).passed).toBe(true);
  });
});
