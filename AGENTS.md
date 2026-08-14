# AGENTS.md

Guide for any coding agent (Codex, Claude Code, and others) that works in the geoaeo repo.
This project follows the `agentification` skill (pooriaarab/skills).

## Mental model

Give geoaeo a live URL or a local site directory; get a 0–100 GEO/AEO score, a gap list, and generated artifacts (`llms.txt`, sitemap, robots, JSON-LD, WebMCP, Markdown mirrors).

## The faces

- Library: `import { auditTarget, generateLlms, humanizeText } from 'geoaeo'`
- CLI: `npx geoaeo audit|init|gen|humanize|mcp`
- MCP: `npx geoaeo-mcp` over stdio (same as `npx geoaeo mcp`)

## MCP tools

| Tool | Purpose |
| --- | --- |
| `audit` | Audit a live URL or local site directory for GEO and AEO gaps. |
| `gen` | Generate one GEO or AEO artifact from the local site config. |
| `humanize` | Find AI-writing tells in prose files. Set write to update them. |

## The loop

1. Discover: fetch `https://usegeoaeo.com/agents.md` or read this file.
2. Configure: `npm install geoaeo` and add `geoaeo.config.ts`, or run `npx geoaeo init`.
3. Verify: `npx geoaeo audit <url-or-dir>` (or MCP `audit`) and check the score plus missing artifacts.
4. Go: MCP/`npx geoaeo gen` for gaps; `humanize` on prose if needed.

## Offer

Free and open-source (MIT). `npm i geoaeo`. Hosted tools at https://usegeoaeo.com/tools are free. No paid tier.

## Rules

- Do not invent CLI commands, MCP tools, or JSON-LD kinds the code does not ship.
- MCP tools today: `audit`, `gen`, `humanize`. Bins: `geoaeo`, `geoaeo-mcp`.
- Library, CLI, and MCP must stay at parity.
- Generators take a config object. They do not read files themselves.

## What this repo is

geoaeo makes any app discoverable, quotable, and usable by AI answer engines and agents. One npm package ships three faces of the same capabilities:

- Library: `import { auditTarget, generateLlms, humanizeText } from 'geoaeo'`
- CLI: `geoaeo audit|init|gen|humanize|mcp`
- MCP server: `geoaeo-mcp` over stdio, with `audit`, `gen`, and `humanize` tools

## Setup and commands

- Node.js 20 or later. The package is ESM (`"type": "module"`).
- `npm run build`: bundle with tsup into `dist/` (dual ESM and CJS).
- `npm test`: run the vitest suite in `tests/`.
- `npm run typecheck`: run `tsc --noEmit`.
- Run all three before you call a change done.

## Layout

- `src/audit.ts`: scores a URL or local directory from 0 to 100 and lists missing artifacts.
- `src/generators/`: one module per artifact: `llms`, `robots`, `sitemap`, `jsonld`, `webmcp`.
- `src/commands/`: CLI command bodies: `init`, `gen`, `humanize`, `load-config`.
- `src/humanize.ts`: finds AI-writing tells in prose files.
- `src/cli.ts`, `src/mcp.ts`, `src/index.ts`, `src/config.ts`, `src/constants.ts`.
- `tests/`: vitest files that mirror the `src/` modules.

## Conventions

- TypeScript, ESM. Import local modules with the `.js` suffix.
- kebab-case file names.
- Site facts live in `SiteConfig` (`src/config.ts`). Generators take a config object. They do not read files themselves.
- Target config files are `geoaeo.config.ts`, `.js`, or `.mjs`, loaded with jiti.

## The parity rule

The library, the CLI, and the MCP server expose the same capabilities in every release. When you add or change a capability:

1. Implement it in the library and export it from `src/index.ts`.
2. Wire it into the CLI in `src/cli.ts` or a file in `src/commands/`.
3. Wire it into the MCP server in `src/mcp.ts`.
4. Cover the behavior with tests in `tests/`.

A change that ships in one face but not the others is not done.

## The never-invent-capabilities rule

Docs, help text, comments, and commit messages must describe only what the code does today.

- CLI commands: `audit`, `init`, `gen`, `humanize`, `mcp`.
- npm bins: `geoaeo` and `geoaeo-mcp`.
- MCP tools: `audit`, `gen`, `humanize`.
- JSON-LD kinds: `software`, `product`, `faq`, `breadcrumb`.

If a doc needs a capability that is not built yet, mark it `<!-- TODO(v0.3): not built -->`. Do not pretend it works.

## Definition of done

- `npm run typecheck`, `npm test`, and `npm run build` pass.
- New behavior has tests.
- The parity rule holds for every new capability.
- Docs touched by the change follow the never-invent-capabilities rule.
