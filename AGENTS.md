# AGENTS.md

Guide for any agent that discovers, evaluates, or uses geoaeo.
This project follows the `agentification` skill (pooriaarab/skills).

## Brand and design context

- Read `.agents/brand.md` before writing public-facing copy.
- Read `.agents/design.md` before changing visual presentation.
- Treat both files as the canonical brand and design context.
- Keep `/design.md` byte-identical to `.agents/design.md` through its generator.

## What geoaeo does

geoaeo audits any site for SEO, GEO, and AEO, scores it 0-100, and generates these artifacts: `llms`, `llms-full`, `jsonld`, `webmcp`, `sitemap`, `robots`, `ogimage`, `rss`, `hreflang`, `mdmirror`.

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

## The parity rule

The library, the CLI, and the MCP server expose the same capabilities in every release. When you add or change a capability:

1. Implement it in the library and export it from `packages/geoaeo/src/index.ts`.
2. Wire it into the CLI in `packages/geoaeo/src/cli.ts` or a file in `packages/geoaeo/src/commands/`.
3. Wire it into the MCP server in `packages/geoaeo/src/mcp.ts`.
4. Cover the behavior with tests in `packages/geoaeo/tests/`.

A change that ships in one face but not the others is not done.

Generators take a config object. They do not read files themselves.

## The never-invent-capabilities rule

Docs, help text, comments, and commit messages must describe only what the code does today.

- CLI commands: `audit`, `init`, `gen`, `humanize`, `mcp`.
- npm bins: `geoaeo` and `geoaeo-mcp`.
- MCP tools: `audit`, `gen`, `humanize`.
- JSON-LD kinds: `software`, `product`, `faq`, `breadcrumb`, `organization`, `website`, `article`, `howto`, `person`, `review`.

If a doc needs a capability that is not built yet, mark it `<!-- TODO(v0.5): not built -->`. Do not pretend it works.

## Conventions

- TypeScript, ESM. Import local modules with the `.js` suffix.
- kebab-case file names.
- Site facts live in `SiteConfig` (`packages/geoaeo/src/config.ts`).
- Target config files are `geoaeo.config.ts`, `.js`, or `.mjs`, loaded with jiti.

## Definition of done

- `bun run ci:local` passes: lint, typecheck, and tests.
- New behavior has tests.
- The parity rule holds for every new capability.
- Docs touched by the change follow the never-invent-capabilities rule.

<!-- pr-standards:start -->

## Pull requests

One issue. One PR. One concern. Under 500 counted lines.

Open the issue first. No issue, no branch. The issue number ties the branch, the
title, the body and the merged commit to one agreed piece of work.

```text
branch:  use-<issue>-<slug>          use-142-fix-onboarding-drop-off
title:   [USE-<issue>] <Subject>   [USE-142] Fix onboarding drop-off
body:    Closes #142
         ## What / ## Why / ## How I verified
         Assisted-by: <agent>:<model>
```

Subject line: imperative mood, 10-50 characters, no trailing period, no emoji.
Write "Fix the drop-off", not "Fixed the drop-off".

Hard caps, failed by the `pr-standards` CI check: 500 counted lines, 40 counted
files, exactly one `Closes #`. Lockfiles, build output, snapshots, generated
code and migrations are not counted. There is no label that clears the cap and
no one to ask for one. Split the change.

Settings for this repo are in `.github/pr-standards.json`. The standard is at
https://github.com/pooriaarab/scripts/blob/main/pr-standards.md

## Agent presence

Before you cut a branch:

```
bin/fleet-presence claim pooriaarab/<repo> <N> --goal "..." --branch <branch>
```

One sticky GitHub comment per agent. Create once, then PATCH. Same-machine
lock is local. Name harness, model, host, start time, and goal. Do not dump
transcripts. Full rule: pooriaarab/agents-private `rules/agent-presence.md`.

<!-- pr-standards:end -->

<!-- cursor-cloud:start -->

## Cloud agents (Cursor)

This repo runs on [Cursor Cloud Agents](https://cursor.com/docs/cloud-agent). Local
`.env.local` does **not** sync — mirror keys in **Dashboard → Cloud Agents → Secrets**.

| Secret type | Use for |
|---|---|
| Runtime Secret | API keys, passwords (hidden from chat/commits) |
| Environment Variable | Non-sensitive config (URLs, flags) |
| Build Secret | Private npm/docker registries during install only |

### Install & test

Install command lives in `.cursor/environment.json`. After dashboard setup:

1. **Environments** → link this repo → wait for **Build = Success**
2. **Secrets** → copy every key from your local `.env.local` / `.env.example`
3. Run the project's test/lint command before opening a PR (see below)

### Verify before PR

```bash
bun run test
```

### Pull requests

Follow the fleet PR standard in this repo's `AGENTS.md` (`<!-- pr-standards:start -->` block).
Cloud agents need push access via Git integration and a successful environment Build.

Setup guide: https://github.com/pooriaarab/scripts/blob/main/cursor-cloud-rollout.md

<!-- cursor-cloud:end -->

## Merge gates

Run `bun run ci:local` (or `npm run ci:local`) before every `git push`.
Do not push a red local gate. Do not use CI as the test runner.

For a change a user can see, or that talks to a third party, walk the
Cloudflare Worker Preview before merge. Quote the Preview URL and status
codes. A 2xx on the site home is not that walk.

Wait for one LLM review APPROVED. Red CI blocks merge even when GitHub
does not require checks.
