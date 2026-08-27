import type { AuditReport } from './types.js';

export function formatAuditReport(report: AuditReport): string {
  const lines = [`${report.target}: ${report.score}/100`, ''];
  for (const check of report.checks) lines.push(`${check.passed ? 'PASS' : 'FAIL'}  ${check.label}: ${check.details}`);
  lines.push('', 'Top fixes:');
  if (report.topFixes.length) report.topFixes.forEach((fix, index) => lines.push(`${index + 1}. ${fix}`));
  else lines.push('None.');
  return lines.join('\n');
}
