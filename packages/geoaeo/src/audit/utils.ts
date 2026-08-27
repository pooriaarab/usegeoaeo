import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { SKIPPED_DIRS } from './constants.js';

export async function walkFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory() && !SKIPPED_DIRS.has(entry.name)) {
      files.push(...(await walkFiles(path.join(directory, entry.name))));
    } else if (entry.isFile()) {
      files.push(path.join(directory, entry.name));
    }
  }
  return files;
}

export function findArtifact(files: string[], name: string): string | undefined {
  return files.find(file => {
    const relative = file.replaceAll('\\', '/');
    return relative.endsWith(`/${name}`) || path.basename(relative) === name || relative.endsWith(`/${name}/route.ts`);
  });
}

export async function readOptional(file: string | undefined): Promise<string> {
  if (!file) return '';
  try {
    return await readFile(file, 'utf8');
  } catch {
    return '';
  }
}

export function sourceHas(source: string, patterns: RegExp[]): boolean {
  return patterns.some(pattern => pattern.test(source));
}
