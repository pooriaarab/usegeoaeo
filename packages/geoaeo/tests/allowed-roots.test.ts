import { mkdir, mkdtemp, realpath, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALLOWED_ROOTS_ENV, assertAllowedPath, PathOutsideAllowedRootsError, readAllowedRoots } from '../src/allowed-roots.js';

async function withParent(run: (parent: string) => Promise<void>): Promise<void> {
  const parent = await mkdtemp(path.join(tmpdir(), 'geoaeo-roots-'));
  try {
    await run(parent);
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
}

describe('readAllowedRoots', () => {
  it('names the startup variable GEOAEO_ALLOWED_ROOTS', () => {
    expect(ALLOWED_ROOTS_ENV).toBe('GEOAEO_ALLOWED_ROOTS');
  });

  it('stays unset when the variable is missing, empty, or blank', () => {
    expect(readAllowedRoots({})).toBeUndefined();
    expect(readAllowedRoots({ [ALLOWED_ROOTS_ENV]: '' })).toBeUndefined();
    expect(readAllowedRoots({ [ALLOWED_ROOTS_ENV]: '   ' })).toBeUndefined();
  });

  it('splits roots on the platform path delimiter and resolves them', () => {
    const raw = `  first  ${path.delimiter} ${path.delimiter} second `;
    expect(readAllowedRoots({ [ALLOWED_ROOTS_ENV]: raw })).toEqual([path.resolve('first'), path.resolve('second')]);
    expect(readAllowedRoots({ [ALLOWED_ROOTS_ENV]: path.delimiter })).toEqual([]);
  });
});

describe('assertAllowedPath', () => {
  it('allows every path when roots are unset and refuses every local path when the list is empty', async () => {
    await expect(assertAllowedPath('/etc/passwd', undefined)).resolves.toBeUndefined();
    await expect(assertAllowedPath('/etc/passwd', [])).rejects.toBeInstanceOf(PathOutsideAllowedRootsError);
  });

  it('allows an absolute http or https URL for audit and rejects other schemes', async () => {
    await withParent(async parent => {
      await expect(assertAllowedPath('https://example.com/docs', [parent], true)).resolves.toBeUndefined();
      await expect(assertAllowedPath('HTTP://example.com', [parent], true)).resolves.toBeUndefined();
      await expect(assertAllowedPath('file:///etc/passwd', [parent], true)).rejects.toBeInstanceOf(PathOutsideAllowedRootsError);
      await expect(assertAllowedPath('ftp://example.com/file', [parent], true)).rejects.toBeInstanceOf(PathOutsideAllowedRootsError);
      await expect(assertAllowedPath('https://example.com', [parent], false)).rejects.toBeInstanceOf(PathOutsideAllowedRootsError);
    });
  });

  it('allows a path that resolves inside one root, including a second root and a symlink alias', async () => {
    await withParent(async parent => {
      const first = path.join(parent, 'first');
      const second = path.join(parent, 'second');
      await mkdir(first);
      await mkdir(second);
      const real = await realpath(first);
      const link = path.join(parent, 'alias');
      await symlink(first, link, 'dir');
      const missing = path.join(link, 'not-created-yet.txt');
      await expect(assertAllowedPath(first, [real, second])).resolves.toBeUndefined();
      await expect(assertAllowedPath(link, [first])).resolves.toBeUndefined();
      await expect(assertAllowedPath(missing, [second, first])).resolves.toBeUndefined();
      await expect(assertAllowedPath(path.join(second, 'page.txt'), [first, second])).resolves.toBeUndefined();
    });
  });

  it('refuses a path outside the roots and keeps the path the caller passed', async () => {
    await withParent(async parent => {
      const inside = path.join(parent, 'inside');
      const outside = path.join(parent, 'outside');
      await mkdir(inside);
      await mkdir(outside);
      const given = path.join(inside, '..', 'outside');
      const jump = path.join(inside, 'jump');
      await symlink(outside, jump, 'dir');
      const pending = path.join(jump, 'new-file.txt');
      const inputs = [outside, given, jump, pending, path.join(parent, 'inside-extra')];
      await Promise.all(inputs.map(input => expect(assertAllowedPath(input, [inside])).rejects.toMatchObject({
        name: 'PathOutsideAllowedRootsError',
        inputPath: input,
        message: `${input} is outside GEOAEO_ALLOWED_ROOTS`,
      })));
    });
  });
});
