# aeoly

`aeoly` creates the files that help answer engines find, quote, and use a site.
It includes a CLI and an MCP server.

## Install

```bash
npm install aeoly
```

Create `aeoly.config.ts` from [`aeoly.config.example.ts`](./aeoly.config.example.ts).
The config holds the site facts used by every generator.

## Quick start

Audit a live site:

```bash
npx aeoly audit https://example.com
npx aeoly audit https://example.com --json
```

Audit a local build or source directory:

```bash
npx aeoly audit ./apps/website
```

Scaffold a Next.js App Router site:

```bash
npx aeoly init ./apps/website
npx aeoly init ./apps/website --force
```

The command detects `next.config.*` and `src/app`. Other directories receive static files.
Existing files stay unchanged unless you pass `--force`.

## Generate artifacts

```bash
npx aeoly gen llms
npx aeoly gen llms-full --output public/llms-full.txt
npx aeoly gen jsonld --type faq
npx aeoly gen webmcp
npx aeoly gen sitemap --output public/sitemap.xml
npx aeoly gen robots
```

The generators use the same config as the generated Next.js routes.
The JSON-LD generator supports `software`, `product`, `faq`, and `breadcrumb` kinds.

## Humanize copy

Run a report for Markdown and JSX files:

```bash
npx aeoly humanize 'content/**/*.md' --check
```

Rewrite prose in place:

```bash
npx aeoly humanize 'src/**/*.tsx' --write
```

The humanizer keeps YAML frontmatter, code fences, JSX tags, imports, class names, and expressions.
It checks for em dashes, AI vocabulary, filler, hype, fake-depth tails, and title-case headings.

## MCP setup

Use the stdio server in an MCP client such as Claude Code or Cursor:

```json
{
  "mcpServers": {
    "aeoly": {
      "command": "npx",
      "args": ["aeoly-mcp"]
    }
  }
}
```

The server exposes `audit`, `gen`, and `humanize` tools.

You can also run it through the CLI:

```bash
npx aeoly mcp
```

## Commands

| Command | Purpose |
| --- | --- |
| `audit <url-or-dir>` | Score the site and list missing artifacts. |
| `init [dir]` | Add Next.js routes or static artifacts. |
| `gen <artifact>` | Print one generated artifact or write it to a file. |
| `humanize <glob>` | Check or rewrite prose files. |
| `mcp` | Run the MCP server over stdio. |

## Development

```bash
npm test
npm run typecheck
npm run build
```
