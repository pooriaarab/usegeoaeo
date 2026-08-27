import type { AuditCheck } from './types.js';

export function scoreAuditChecks(checks: AuditCheck[]): number {
  const total = checks.reduce((sum, check) => sum + check.weight, 0);
  if (total === 0) return 0;
  const earned = checks.reduce((sum, check) => sum + (check.passed ? check.weight : 0), 0);
  return Math.round((earned / total) * 100);
}
