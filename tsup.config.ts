import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/cli.ts',
    mcp: 'src/mcp.ts',
    index: 'src/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  // Shebangs live in the cli.ts / mcp.ts sources; tsup preserves them.
  // A global banner would double the shebang and break `node dist/cli.js`.
});

