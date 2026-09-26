import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'dist', 'cli.js');

function run(args: string[], cwd = root, extraEnv?: Record<string, string>): string {
  return execFileSync('node', [cli, ...args], {
    encoding: 'utf8',
    cwd,
    env: extraEnv === undefined ? process.env : { ...process.env, ...extraEnv },
  });
}

function runFailure(args: string[], extraEnv: Record<string, string>, cwd = root): { status: number | null; stderr: string } {
  try {
    run(args, cwd, extraEnv);
  } catch (error) {
    const failed = error as { status?: number | null; stderr?: string };
    return { status: failed.status ?? null, stderr: failed.stderr ?? '' };
  }
  throw new Error(`expected failure: ${args.join(' ')}`);
}

describe('geoaeo CLI end-to-end', () => {
  it('has a built binary (run npm run build first)', () => {
    expect(existsSync(cli)).toBe(true);
  });

  it('prints the version from package.json', () => {
    const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
    expect(run(['--version']).trim()).toBe(pkg.version);
  });

  it('audits a fixture and returns a scored report whose weights sum to 100', () => {
    const report = JSON.parse(run(['audit', 'examples/static-html', '--json']));
    expect(typeof report.score).toBe('number');
    expect(report.score).toBeGreaterThan(0);
    expect(Array.isArray(report.checks)).toBe(true);
    expect(report.checks.reduce((sum: number, c: { weight: number }) => sum + c.weight, 0)).toBe(100);
  });

  it('generates an Organization JSON-LD from a config directory', () => {
    const out = run(['gen', 'jsonld', '--type', 'organization'], path.join(root, 'examples', 'static-html'));
    expect(out).toContain('"@type": "Organization"');
  });

  it('exits non-zero for --ci below the threshold', () => {
    expect(() => run(['audit', 'examples/static-html', '--ci', '--min-score', '200'])).toThrow();
  });

  it('allows audit, gen, and humanize inside GEOAEO_ALLOWED_ROOTS', () => {
    const allowed = path.join(root, 'examples', 'static-html');
    const env = { GEOAEO_ALLOWED_ROOTS: allowed };
    const report = JSON.parse(run(['audit', allowed, '--json'], root, env));
    expect(report.score).toBeGreaterThan(0);
    expect(report.target).toBe(allowed);
    expect(run(['gen', 'llms'], allowed, env).length).toBeGreaterThan(0);
    expect(run(['humanize', 'no-such-*.md', '--check'], allowed, env)).toBe('');
  });

  it('refuses audit, gen, and humanize outside GEOAEO_ALLOWED_ROOTS', () => {
    const allowed = path.join(root, 'examples', 'static-html');
    const env = { GEOAEO_ALLOWED_ROOTS: allowed };
    const message = `${root} is outside GEOAEO_ALLOWED_ROOTS`;
    for (const args of [['audit', root, '--json'], ['gen', 'llms'], ['humanize', '*.md', '--check']]) {
      const failed = runFailure(args, env, root);
      expect(failed.status).toBe(1);
      expect(failed.stderr).toContain(message);
    }
  });
});
