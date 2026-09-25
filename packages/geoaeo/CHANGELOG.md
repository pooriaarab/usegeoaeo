# Changelog

All notable changes to geoaeo are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and geoaeo uses
[semantic versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- A URL audit reads the `X-Robots-Tag` response header. The indexable
  check fails when that header or the robots meta tag contains `noindex`,
  and the detail names which signal set it. A directory audit still
  checks only the meta tag.

## [0.3.1] - 2026-09-14

### Fixed

- MCP server: `registerTool` is now bound to the server before it is called.
  It was invoked detached, so `this` was undefined inside the SDK method.
- MCP tool schemas use the Zod shapes the SDK accepts natively, replacing a
  brief detour through a `zod/v3` import.

### Added

- `mcpName` (`io.github.pooriaarab/geoaeo`) in the package manifest, so the
  MCP registry can resolve the server. `server.json` moved with it.

### Changed

- Zod range tightened from `^4.0.0` to `^4.5.4`.
- `audit` and `init` split into smaller modules to fit the repo's lint
  budgets. No behaviour change.

## [0.3.0] - 2026-08-13

### Added

- Audit checks for the agent-discovery frontier: MCP server card
  (`/.well-known/mcp/server-card.json`), agent card (`/.well-known/agent-card.json`),
  agent skills (`/.well-known/agent-skills/`), and API catalog (`/.well-known/api-catalog`).
  Weights rebalanced so the 24 checks still sum to 100.


## [0.2.2] - 2026-08-12

### Fixed

- `audit` now reads `@type` from JSON-LD nodes inside a `@graph` wrapper, the common
  real-world shape it previously missed.

### Added

- `robots.txt` now explicitly welcomes AI answer-engine crawlers (GPTBot, ClaudeBot,
  PerplexityBot, Google-Extended, and more).


## [0.2.1] - 2026-08-12

### Fixed

- `--version` now derives from `package.json`, so the CLI version cannot drift.

## [0.2.0] - 2026-08-12

### Added

- Answerability scoring in `audit`: direct-answer detection, question framing, freshness,
  and author/E-E-A-T, plus hreflang, heading structure, image alt, and indexability. The
  audit now runs 20 weighted checks that sum to 100.
- JSON-LD kinds: Organization, WebSite (with SearchAction), Article, HowTo, Person, Review.
- Generators: OG image (SVG), RSS, hreflang block, and standalone Markdown mirror.
- `init` scaffolds for Astro, SvelteKit, Nuxt, and Remix.
- `audit --ci --min-score N` — exits non-zero below the threshold for pipelines.
- Release parity: `next` (staging) and `latest` (production) npm channels, both gated by
  the same verify step. See `RELEASING.md`.
- CI workflow, a CLI end-to-end test, a `LICENSE` (MIT), `.claude` skill and agent,
  `CLAUDE.md`, `AGENTS.md`, per-harness docs, examples, and the GEO/AEO checklist.

### Changed

- Renamed the package from the provisional `aeoly` to `geoaeo` (CLI `geoaeo`,
  MCP `geoaeo-mcp`, config `geoaeo.config.ts`).

## [0.1.0] - 2026-08-12

### Added

- `audit` — score a URL or local site 0–100 and list missing artifacts.
- `init` — scaffold GEO/AEO artifacts into a Next.js or static site.
- `gen` — generate `llms.txt`, `llms-full.txt`, `robots.txt`, `sitemap.xml`, JSON-LD, and
  a WebMCP manifest.
- `humanize` — find and rewrite AI-writing tells in copy.
- `geoaeo-mcp` — an MCP server exposing `audit`, `gen`, and `humanize`.

[Unreleased]: https://github.com/pooriaarab/geoaeo/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/pooriaarab/geoaeo/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/pooriaarab/geoaeo/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/pooriaarab/geoaeo/releases/tag/v0.1.0
