import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { auditTarget, type AuditCheck } from '../src/audit.js';
import { ANSWERABILITY_WORD_FLOOR } from '../src/audit/constants.js';

const here = path.dirname(fileURLToPath(import.meta.url));

function answerability(checks: AuditCheck[]): AuditCheck {
  const check = checks.find(item => item.id === 'answerability');
  if (!check) throw new Error('answerability check missing');
  return check;
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
});
