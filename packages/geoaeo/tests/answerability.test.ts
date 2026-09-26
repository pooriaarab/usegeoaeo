import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { analyzePage, auditTarget, type AuditCheck } from '../src/audit.js';
import { ANSWERABILITY_WORD_FLOOR } from '../src/audit/constants.js';

const here = path.dirname(fileURLToPath(import.meta.url));

function answerability(checks: AuditCheck[]): AuditCheck {
  const check = checks.find(item => item.id === 'answerability');
  if (!check) throw new Error('answerability check missing');
  return check;
}

function readSourceFixture(name: string): string {
  return readFileSync(path.join(here, 'fixtures', name, 'page.tsx.txt'), 'utf8');
}

function directoryWithPage(source: string): string {
  const root = mkdtempSync(path.join(tmpdir(), 'geoaeo-source-'));
  mkdirSync(path.join(root, 'app'));
  writeFileSync(path.join(root, 'app', 'page.tsx'), source);
  return root;
}

describe('answerability word floor', () => {
  it('fails a thin page and names the word-count half', async () => {
    const report = await auditTarget(path.join(here, 'fixtures', 'thin-content'));
    const check = answerability(report.checks);
    expect(check.passed).toBe(false);
    expect(check.weight).toBe(9);
    expect(check.details).toBe(`Not enough words to quote (need ${ANSWERABILITY_WORD_FLOOR}).`);
    expect(check.details).toMatch(/word/i);
    expect(report.checks).toHaveLength(25);
  });

  it('passes a page with a direct opening and enough words to quote', async () => {
    const report = await auditTarget(path.join(here, 'fixtures', 'substantial-content'));
    const check = answerability(report.checks);
    expect(check.passed).toBe(true);
    expect(check.weight).toBe(9);
    expect(check.details).toMatch(/enough body text to quote/i);
  });

  it('does not let a <script> block satisfy the word floor', async () => {
    const report = await auditTarget(path.join(here, 'fixtures', 'thin-content-script-padded'));
    const check = answerability(report.checks);
    expect(check.passed).toBe(false);
    expect(check.details).toBe(`Not enough words to quote (need ${ANSWERABILITY_WORD_FLOOR}).`);
  });

  it('fails a thin source page whose imports and classNames clear the raw-token floor', async () => {
    const source = readSourceFixture('thin-source');
    const rawWords = source.trim().split(/\s+/).length;
    const signals = analyzePage(source, false);
    expect(rawWords).toBeGreaterThan(ANSWERABILITY_WORD_FLOOR);
    expect(signals.wordCount).toBeGreaterThan(5);
    expect(signals.wordCount).toBeLessThan(40);
    expect(signals.h1).toBe(true);
    expect(signals.directAnswer).toBe(true);

    const report = await auditTarget(directoryWithPage(source));
    const check = answerability(report.checks);
    expect(check.passed).toBe(false);
    expect(check.details).toBe(`Not enough words to quote (need ${ANSWERABILITY_WORD_FLOOR}).`);
  });

  it('passes a source page with real prose after the same strips', async () => {
    const source = readSourceFixture('substantial-source');
    const signals = analyzePage(source, false);
    expect(signals.wordCount).toBeGreaterThanOrEqual(ANSWERABILITY_WORD_FLOOR);

    const report = await auditTarget(directoryWithPage(source));
    const check = answerability(report.checks);
    expect(check.passed).toBe(true);
    expect(check.details).toMatch(/enough body text to quote/i);
  });
});
