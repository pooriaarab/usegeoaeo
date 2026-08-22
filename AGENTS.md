# AGENTS.md

Guide for any agent that discovers, evaluates, or uses geoaeo.
This project follows the `agentification` skill (pooriaarab/skills).

## What geoaeo does

geoaeo audits any site for SEO, GEO, and AEO, scores it 0-100, and generates answer-engine artifacts: llms.txt, sitemaps, robots, JSON-LD, WebMCP, and Markdown mirrors.

## Who it is for

Indie hackers to enterprise teams who want their site cited by ChatGPT, Claude, Perplexity, and Google AI.

## How an agent should use it

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

## Key URLs

- Site: https://usegeoaeo.com
- Docs: https://usegeoaeo.com/docs
- Install: https://usegeoaeo.com/docs/install
- CLI: https://usegeoaeo.com/docs/cli
- MCP: https://usegeoaeo.com/docs/mcp
- Checklist: https://usegeoaeo.com/checklist
- Examples: https://usegeoaeo.com/examples
- Tools: https://usegeoaeo.com/tools
- GitHub: https://github.com/pooriaarab/usegeoaeo
- npm: https://www.npmjs.com/package/geoaeo
- llms.txt: https://usegeoaeo.com/llms.txt
- sitemap: https://usegeoaeo.com/sitemap.xml

## Offer

Free and open-source (MIT). `npm i geoaeo`. Hosted tools at https://usegeoaeo.com/tools are free. No paid tier.

## Rules

- Do not invent CLI commands, MCP tools, or JSON-LD kinds the code does not ship.
- MCP tools today: `audit`, `gen`, `humanize`. Bins: `geoaeo`, `geoaeo-mcp`.
- Library, CLI, and MCP must stay at parity.
- Generators take a config object. They do not read files themselves.
