import path from 'node:path';
import { CONFIG_FILENAME } from '../../constants.js';

export function configImport(root: string, fromFile: string): string {
  const configPath = CONFIG_FILENAME.replace(/\.ts$/, '');
  const relative = path.relative(path.dirname(fromFile), path.join(root, configPath)).replaceAll('\\', '/');
  return relative.startsWith('.') ? relative : `./${relative}`;
}
