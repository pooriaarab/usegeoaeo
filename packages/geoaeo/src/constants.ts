import pkg from '../package.json';

export const PKG_NAME = pkg.name;
export const VERSION = pkg.version;
export const CONFIG_FILENAME = `${PKG_NAME}.config.ts`;
