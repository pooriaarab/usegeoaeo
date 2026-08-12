import { describe, expect, it } from 'vitest';
import { scoreAuditChecks, type AuditCheck } from '../src/audit.js';

function check(passed: boolean, weight: number): AuditCheck {
  return { id: String(weight), label: 'check', passed, weight, details: '' };
}

describe('audit scorer', () => {
  it('returns zero for no checks', () => {
    expect(scoreAuditChecks([])).toBe(0);
  });

  it('uses weighted pass scores', () => {
    expect(scoreAuditChecks([check(true, 80), check(false, 20)])).toBe(80);
  });

  it('rounds partial scores to the nearest integer', () => {
    expect(scoreAuditChecks([check(true, 1), check(false, 2)])).toBe(33);
  });
});

