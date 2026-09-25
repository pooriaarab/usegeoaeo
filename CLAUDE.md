# CLAUDE.md

Guide for Claude Code in the geoaeo repo.

Read [AGENTS.md](./AGENTS.md) before you change this package. That file holds the parity rule, the never-invent-capabilities rule, and the pull-request standard. Keep those rules in that one file.

## Setup and commands

Run these in `packages/geoaeo`.

- Node.js 20 or later. The package is ESM (`"type": "module"`).
- `npm run build`: bundle with tsup into `dist/` (dual ESM and CJS).
- `npm test`: run the vitest suite in `tests/`.
- `npm run typecheck`: run `tsc --noEmit`.
- Run all three before you call a change done.

## Layout

Paths below are relative to `packages/geoaeo/`.

- `src/audit.ts`: scores a URL or local directory from 0 to 100 and lists missing artifacts.
- `src/generators/`: `hreflang`, `jsonld`, `llms`, `mdmirror`, `ogimage`, `robots`, `rss`, `sitemap`, `webmcp`. `llms.ts` writes both the short file and the full file.
- `src/commands/`: `gen`, `humanize`, `init`, `load-config`.
- `src/humanize.ts`: finds AI-writing tells in prose files.
- `src/cli.ts`, `src/mcp.ts`, `src/index.ts`, `src/config.ts`, `src/constants.ts`.
- `tests/`: vitest files that mirror the `src/` modules.
