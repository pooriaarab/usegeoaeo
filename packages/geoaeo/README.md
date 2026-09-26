# geoaeo

`geoaeo` makes any app discoverable, quotable, and usable by AI answer engines and search —
SEO, GEO, and AEO in one tool. It audits a site, scores it 0–100, and generates the files
answer engines need. It ships a library, a CLI, and an MCP server, all at one version.

## Install

```bash
npm install geoaeo
```

The package name is unscoped: `geoaeo`, `geoaeo` (CLI), and `geoaeo-mcp` (MCP server).

Create `geoaeo.config.ts` from [`geoaeo.config.example.ts`](./geoaeo.config.example.ts).
The config holds the site facts used by every generator.

## Quick start

Audit a live site:

```bash
npx geoaeo audit https://example.com
npx geoaeo audit https://example.com --json
```

Audit a local build or source directory:

```bash
npx geoaeo audit ./apps/website
```

Scaffold a Next.js App Router site:

```bash
npx geoaeo init ./apps/website
npx geoaeo init ./apps/website --force
```

The command detects the framework — Next.js, Astro, SvelteKit, Nuxt, or Remix — and writes
the routes that emit each artifact. Other directories receive static files. Existing files
stay unchanged unless you pass `--force`.

## Generate artifacts

```bash
npx geoaeo gen llms
npx geoaeo gen llms-full --output public/llms-full.txt
npx geoaeo gen jsonld --type faq
npx geoaeo gen webmcp
npx geoaeo gen sitemap --output public/sitemap.xml
npx geoaeo gen robots
npx geoaeo gen ogimage --output public/og.svg
npx geoaeo gen rss --output public/feed.xml
npx geoaeo gen hreflang
npx geoaeo gen mdmirror
```

The generators use the same config as the generated framework routes.
The JSON-LD generator supports `software`, `product`, `faq`, `breadcrumb`, `organization`,
`website`, `article`, `howto`, `person`, and `review` kinds.

## Gate a build on the score

Use `--ci` in a pipeline to fail when a site drops below a minimum score:

```bash
npx geoaeo audit https://example.com --ci --min-score 85
```

The command exits non-zero when the score is below the threshold.

## Humanize copy

Run a report for Markdown and JSX files:

```bash
npx geoaeo humanize 'content/**/*.md' --check
```

Rewrite prose in place:

```bash
npx geoaeo humanize 'src/**/*.tsx' --write
```

The humanizer keeps YAML frontmatter, code fences, JSX tags, imports, class names, and expressions.
It checks for em dashes, AI vocabulary, filler, hype, fake-depth tails, and title-case headings.

## MCP setup

Use the stdio server in an MCP client such as Claude Code or Cursor:

```json
{
  "mcpServers": {
    "geoaeo": {
      "command": "npx",
      "args": ["-y", "geoaeo", "mcp"]
    }
  }
}
```

The server exposes `audit`, `gen`, and `humanize` tools.

Set `GEOAEO_ALLOWED_ROOTS` when you start the CLI or the MCP server.
Separate directories with your platform path delimiter (`:` on macOS and Linux, `;` on Windows).
`audit`, `gen`, and `humanize` then accept a local directory only when it resolves inside one of those directories.
For the CLI, that directory is the `audit` target, or the working directory of `gen` and `humanize`.
`audit` still accepts an absolute `http` or `https` URL.
When the variable is unset or empty, local paths stay unbounded.
A path outside the list returns an error that names the path you passed.

You can also run it through the CLI:

```bash
npx geoaeo mcp
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
