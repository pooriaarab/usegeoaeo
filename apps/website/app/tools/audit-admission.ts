/** How many hosted audits may run in this isolate at once. */
const MAX_CONCURRENT = 2;
/** How many hosted audits may start in one minute. */
const MAX_PER_WINDOW = 8;
const WINDOW_MS = 60_000;

let active = 0;
const startedAt: number[] = [];

/** Reserve one audit slot. False when this isolate is already busy. */
export function tryAdmitAudit(): boolean {
  const now = Date.now();
  while (startedAt.length > 0 && now - startedAt[0]! > WINDOW_MS) startedAt.shift();
  if (active >= MAX_CONCURRENT || startedAt.length >= MAX_PER_WINDOW) return false;
  active += 1;
  startedAt.push(now);
  return true;
}

export function releaseAudit(): void {
  active = Math.max(0, active - 1);
}
