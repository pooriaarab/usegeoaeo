import { realpath } from 'node:fs/promises';
import path from 'node:path';

export const ALLOWED_ROOTS_ENV = 'GEOAEO_ALLOWED_ROOTS';

export class PathOutsideAllowedRootsError extends Error {
  readonly code = 'PATH_OUTSIDE_ALLOWED_ROOTS' as const;
  readonly inputPath: string;

  constructor(inputPath: string) {
    super(`${inputPath} is outside GEOAEO_ALLOWED_ROOTS`);
    this.name = 'PathOutsideAllowedRootsError';
    this.inputPath = inputPath;
  }
}

// Undefined means the variable was unset or empty, so callers keep today's paths.
// An empty list means the variable was set and names no roots, so every local path fails.
export function readAllowedRoots(env: NodeJS.ProcessEnv = process.env): readonly string[] | undefined {
  const raw = env[ALLOWED_ROOTS_ENV];
  if (raw === undefined || raw.trim() === '') return undefined;
  return raw
    .split(path.delimiter)
    .map(entry => entry.trim())
    .filter(entry => entry.length > 0)
    .map(entry => path.resolve(entry));
}

// audit already fetches an absolute http(s) URL. Any other string stays a local path,
// so a file URL cannot skip the root check.
function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function isEnoent(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}

async function realPathIfExists(target: string): Promise<string | undefined> {
  try {
    return await realpath(target);
  } catch (error) {
    if (isEnoent(error)) return undefined;
    throw error;
  }
}

// realpath folds symlinks and macOS /tmp vs /private/tmp. A missing tail stays on its real parent,
// so a link that points outside the root is still outside when the last segment does not exist yet.
async function canonicalLocalPath(input: string): Promise<string> {
  const resolved = path.resolve(input);
  const direct = await realPathIfExists(resolved);
  if (direct) return direct;
  const parent = path.dirname(resolved);
  if (parent === resolved) return resolved;
  return path.join(await canonicalLocalPath(parent), path.basename(resolved));
}

function isInside(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  if (relative === '' || relative === '.') return true;
  if (relative === '..' || relative.startsWith(`..${path.sep}`)) return false;
  return !path.isAbsolute(relative);
}

export async function assertAllowedPath(input: string, roots: readonly string[] | undefined, allowHttpUrl = false): Promise<void> {
  if (roots === undefined) return;
  if (allowHttpUrl && isHttpUrl(input)) return;
  const candidate = await canonicalLocalPath(input);
  const realRoots = await Promise.all(roots.map(root => canonicalLocalPath(root)));
  if (realRoots.some(root => isInside(root, candidate))) return;
  throw new PathOutsideAllowedRootsError(input);
}
