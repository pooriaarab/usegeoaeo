# Vision — usegeoaeo

## What this is

geoaeo is an npm package that makes a website discoverable, quotable, and usable by AI answer engines and agents. `npx geoaeo audit <url-or-dir>` scores a live site or a local directory 0-100 and lists the missing answer-engine artifacts. `npx geoaeo gen` produces them: llms.txt, sitemaps, robots rules, JSON-LD, WebMCP, and Markdown mirrors. `npx geoaeo humanize` finds AI-writing tells in prose. The same capabilities ship three ways — as a library import, as CLI commands, and as an MCP server (`npx geoaeo mcp`) — so a person or an agent can run the full loop. The repo also holds usegeoaeo.com, the docs and marketing site, which serves the artifacts the package generates.

## Who it is for

The repo names two readers. The first is "indie hackers to enterprise teams who want their site cited by ChatGPT, Claude, Perplexity, and Google AI" — developers and site owners whose traffic starts at an AI answer instead of a search page. The second is the AI agent itself: AGENTS.md is written as a guide for "any agent that discovers, evaluates, or uses geoaeo", and the MCP server exists so an agent can discover, configure, audit, and fix a site inside its own loop.

## What good looks like

- An audit run — CLI or MCP — ends with a 0-100 score and a named list of missing artifacts for the target.
- Every artifact the audit names can be generated from `geoaeo.config.ts` with one `gen` call: llms.txt, sitemap, robots, JSON-LD, WebMCP, Markdown mirror.
- Every new capability reaches all three faces in the same release: a library export from `src/index.ts`, a CLI command, an MCP tool, plus tests in `tests/`.
- usegeoaeo.com serves what the package checks for: llms.txt, sitemap.xml, /agents.md, ai-plugin.json, and a welcome for AI crawlers.

## Explicitly not this

- A capability that ships in one face only: an MCP tool with no library export, or a CLI command the library does not expose. The parity rule calls that change not done.
- Docs, help text, or commit messages that advertise a capability the code does not have today. The never-invent rule requires a `<!-- TODO(v0.3): not built -->` marker instead.
- A generator that reads files itself instead of taking a `SiteConfig` object. Site facts stay in the config layer, loaded through `geoaeo.config.ts`.
- A paid tier, user accounts, or metered hosted usage. The offer is free and open-source under MIT, and AGENTS.md states "No paid tier."

## How it pays for itself

There is no revenue model in the repo. AGENTS.md states the offer: free and open-source under MIT, install with `npm i geoaeo`, hosted tools at usegeoaeo.com/tools free, no paid tier. What the project gets back is reach and proof. The monorepo builds and deploys usegeoaeo.com as a dogfooded example of the package's output. `server.json` registers the MCP server with the MCP registry. The parity rule keeps every capability reachable through the library, `npx`, and an agent's MCP client. The tool is its own first user and its own demo.

## The current bet

Through 2026, geoaeo bets that agent-readiness — an AI agent being able to use a site, not just read it — is the next layer its audit must score and its generators must supply, and the v0.3 agent-interface audit checks, the ai-plugin.json and Link-header signals, and the MCP registry listing are the work in flight. <!-- CHECK: no deadline appears anywhere in the repo; the date is a draft assumption for a human to confirm. -->
