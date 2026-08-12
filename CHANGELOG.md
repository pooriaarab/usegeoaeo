# Changelog

All notable changes to geoaeo are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and geoaeo uses
[semantic versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Release parity: `next` (staging) and `latest` (production) npm channels, both gated by
  the same verify step. See `RELEASING.md`.
- CI workflow: typecheck, test, build, and a CLI smoke run on every push and pull request.
- `.claude` skill and agent, `CLAUDE.md`, and `AGENTS.md` for agent-driven use.
- Per-harness setup docs under `docs/harnesses/`.
- Examples under `examples/` for Next.js, Astro, and static HTML.
- The GEO/AEO checklist, roadmap, and enhancements docs under `docs/`.

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

[Unreleased]: https://github.com/pooriaarab/geoaeo/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/pooriaarab/geoaeo/releases/tag/v0.1.0
