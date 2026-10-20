const MAX_CONCURRENT = 2;
const MAX_PER_WINDOW = 8;
const WINDOW_MS = 60_000;
let active = 0;
const startedAt: number[] = [];
export function tryAdmitAudit(): boolean {
  const now = Date.now();
  while (startedAt.length > 0 && now - (startedAt[0] ?? now) > WINDOW_MS) startedAt.shift();
  if (active >= MAX_CONCURRENT || startedAt.length >= MAX_PER_WINDOW) return false;
  active += 1;
  startedAt.push(now);
  return true;
}
export function releaseAudit(): void {
  active = Math.max(0, active - 1);
}
