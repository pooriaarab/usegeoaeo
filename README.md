# geoaeo

<p align="center">Scores a site 0-100 and generates GEO/AEO files for owners who want AI citations.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/geoaeo"><img src="https://img.shields.io/npm/v/geoaeo" alt="npm geoaeo 0.4.0"/></a>
  <a href="https://github.com/pooriaarab/usegeoaeo/actions"><img src="https://github.com/pooriaarab/usegeoaeo/actions/workflows/ci.yml/badge.svg" alt="CI"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License MIT"/></a>
  <a href="docs/GEO-AEO-CHECKLIST.md"><img src="https://img.shields.io/badge/checks-25-informational" alt="25 weighted audit checks"/></a>
</p>

```bash
npx geoaeo audit https://usegeoaeo.com
```

```
https://usegeoaeo.com: 85/100

PASS  /llms.txt: Short site map is present.
PASS  /llms-full.txt: Full site map is present.
PASS  /sitemap.xml: A sitemap artifact is present.
PASS  /robots.txt: Robots policy includes a sitemap URL.
PASS  AI crawler access: No named AI crawler is disallowed from /.
PASS  WebMCP manifest: A WebMCP-style tool manifest is present.
FAIL  Markdown mirrors: Missing: no page markdown mirrors were found.
PASS  Page titles: Every inspected page has a title.

... 17 more checks ...

Top fixes:
1. Markdown mirrors
2. MCP server card
3. hreflang alternates
```

## Contents

[Try it](#try-it) · [Set up in your agent](#set-up-in-your-agent) · [Install](#install) · [Quick start](#quick-start) · [Why](#why) · [Usage](#usage) · [How it works](#how-it-works) · [Run it locally](#run-it-locally) · [Contributing](#contributing) · [License](#license)

## Try it

Each path runs the same audit. Start at the top.

1. Run it in the browser. No install: [usegeoaeo.com/tools](https://usegeoaeo.com/tools).
2. Run one command. No install:

```bash
npx geoaeo audit https://example.com
```

3. Add it to a project, and call it from a build script or CI. See [Install](#install).

4. Drive it from your agent over MCP:

```json
{
  "mcpServers": {
    "geoaeo": {
      "command": "npx",
      "args": ["-y", "geoaeo-mcp"]
    }
  }
}
```

## Set up in your agent

Paste this prompt into your agent:

```
Set up geoaeo in this agent. Detect the harness, then configure the
geoaeo MCP server with command `npx` and args `-y geoaeo-mcp`.
Run an audit on the current directory. Report the score and the
top three fixes.
```

Then try one of these:

- `Audit https://example.com and list the top 3 fixes.`
- `Generate llms.txt for this repo.`

## Install

```bash
npm install geoaeo
```

> [!NOTE]
> Node.js 20 or later.

Save this as `example.mjs`:

```js
import { defineConfig, generateLlms } from 'geoaeo'

const llms = generateLlms(
  defineConfig({
    siteName: 'Reply Kit',
    siteUrl: 'https://example.com',
    description: 'a tool that drafts replies for social posts',
    tools: [
      {
        name: 'Engagement rate calculator',
        url: '/tools/engagement-rate-calculator',
        description: 'Calculate the interaction rate for a post or profile.',
      },
    ],
  }),
)
process.stdout.write(llms)
```

## Quick start

```bash
node example.mjs
```

```
# Reply Kit

> a tool that drafts replies for social posts

## Product

Reply Kit is a tool that drafts replies for social posts.

## Free tools

- [Engagement rate calculator](https://example.com/tools/engagement-rate-calculator): Calculate the interaction rate for a post or profile.

## Plans

- No plans listed.
```

## Why

For site owners who want ChatGPT, Claude, Perplexity, and Google AI to cite
their pages. GEO is generative-engine optimization. AEO is answer-engine
optimization. Today those owners write `llms.txt` by hand or use a classic SEO
plugin such as Yoast. Not a crawler, not a search engine, and not a substitute
for Yoast if you only need Google search snippets.

The package is free and open source under MIT. There is no paid tier. Hosted
tools at [usegeoaeo.com/tools](https://usegeoaeo.com/tools) are free.

## Usage

The same capabilities ship as a library, a CLI, and an MCP server, all at one
version.

| Export | What it does |
|---|---|
| `auditTarget` | Scores a URL or directory 0-100 and lists missing artifacts |
| `generateLlms` | Builds the short `llms.txt` from a `SiteConfig` |
| `generateLlmsFull` | Builds the long `llms-full.txt` |
| `generateJsonLd` | Builds schema.org JSON-LD for a named kind |
| `generateSitemap` | Builds `sitemap.xml` |
| `generateRobots` | Builds `robots.txt` |
| `generateWebmcp` | Builds the WebMCP tool manifest |
| `humanizeText` | Finds AI-writing tells and returns rewritten prose |
| `defineConfig` | Normalizes a `SiteConfig` object |

```js
import { auditTarget, generateLlms, humanizeText } from 'geoaeo'
```

| Command | What it does |
|---|---|
| `geoaeo audit <url\|dir>` | Score 0-100 and list the gaps |
| `geoaeo init [dir]` | Scaffold artifacts into an existing site |
| `geoaeo gen <artifact>` | Generate one artifact from `geoaeo.config.ts` |
| `geoaeo humanize <glob>` | Find AI-writing tells in prose |
| `geoaeo mcp` | Serve over stdio |

`init` detects Next.js, Astro, SvelteKit, Nuxt, and Remix, and writes routes
that emit each artifact. Any other directory gets static files. After
`npm install geoaeo`:

```bash
npx geoaeo init
npx geoaeo gen llms
```

`gen` reads `geoaeo.config.ts` from the current directory. Artifacts: `llms`,
`llms-full`, `jsonld`, `webmcp`, `sitemap`, `robots`, `ogimage`, `rss`,
`hreflang`, `mdmirror`. JSON-LD `--type` values: `software`, `product`, `faq`,
`breadcrumb`, `organization`, `website`, `article`, `howto`, `person`, `review`.

The audit is 25 weighted checks across answerability, structured data,
`llms.txt`, crawlability, freshness, and E-E-A-T. `--ci --min-score N` exits
non-zero when the score is below the threshold.

The bundled examples, audited from source:

| Target | Score |
|---|---|
| `packages/geoaeo/examples/static-html` | 69 / 100 |
| `packages/geoaeo/examples/nextjs-app` | 43 / 100 |
| `packages/geoaeo/examples/astro-site` | 26 / 100 |

Framework apps score lower because the audit reads source directories, not
built output. Audit the deployed URL for the true score.

Point an MCP client at the server to get the `audit`, `gen`, and `humanize`
tools:

```json
{
  "mcpServers": {
    "geoaeo": {
      "command": "npx",
      "args": ["-y", "geoaeo-mcp"]
    }
  }
}
```

Docs: [usegeoaeo.com/docs](https://usegeoaeo.com/docs) ·
[Install](https://usegeoaeo.com/docs/install) ·
[CLI](https://usegeoaeo.com/docs/cli) ·
[MCP](https://usegeoaeo.com/docs/mcp) ·
[checklist](https://usegeoaeo.com/checklist) ·
[examples](https://usegeoaeo.com/examples) ·
[hosted tools](https://usegeoaeo.com/tools).
[`AGENTS.md`](AGENTS.md) is how an agent should discover and drive this project.

## How it works

`auditTarget` snapshots a live URL or a local directory, runs 25 weighted
checks that sum to 100, and returns the score plus the top missing artifacts.
Generators take a `SiteConfig` object. They do not read the site themselves.
`init` writes that config and either framework routes or static files.

The published npm package is `geoaeo`. This repository also holds the docs
site.

| Path | What it is |
|---|---|
| `packages/geoaeo/` | The published npm package: library, CLI, and MCP server |
| `apps/website/` | [usegeoaeo.com](https://usegeoaeo.com) — docs, hosted tools, and the checklist |
| `workers/` | Cloudflare Workers that back the hosted tools |
| `docs/` | The GEO/AEO checklist and per-harness setup guides |

## Run it locally

The package needs Node.js 20 or later. It does not start a database or a web
server.

```bash
npm install geoaeo
node example.mjs   # the file from Install, above
```

The docs site at [usegeoaeo.com](https://usegeoaeo.com) lives in `apps/website/`
and is not required to use the library.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for this repo's layout, build commands
and the library/CLI/MCP parity rule. It sits on top of the account-wide
[contribution guide](https://github.com/pooriaarab/.github/blob/main/CONTRIBUTING.md),
which carries the issue-first rule, the branch pattern and the 500-line cap.

## License

[MIT](LICENSE)
