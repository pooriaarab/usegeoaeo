import { stat } from 'node:fs/promises';
import type { AuditReport } from './types.js';
import { buildChecks } from './checks.js';
import { scoreAuditChecks } from './score.js';
import { snapshotDirectory, snapshotUrl } from './snapshot.js';

function topFixesFromChecks(checks: AuditReport['checks']): string[] {
  return checks
    .filter(check => !check.passed)
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 5)
    .map(check => check.label);
}

export async function auditTarget(target: string): Promise<AuditReport> {
  const targetStat = await stat(target).catch(() => undefined);
  const snapshot = targetStat?.isDirectory() ? await snapshotDirectory(target) : await snapshotUrl(target);
  const checks = buildChecks(snapshot);
  const score = scoreAuditChecks(checks);
  const topFixes = topFixesFromChecks(checks);
  return {
    target,
    score,
    checks,
    pages: snapshot.pages.map(page => page.url),
    topFixes,
  };
}
