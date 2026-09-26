# geoaeo — world-class build spec (v0.2)

This file is the source of truth for the v0.2 "world-class" build. It is also the brief
each delegated worker reads. Workers: build only your assigned unit, only under the paths
listed for it, and **write files only — do NOT run `git`, `npm install`, or a build.** The
advisor (Opus) commits, builds, and verifies.

## What geoaeo is

`geoaeo` makes any app discoverable, quotable, and usable by AI answer engines and agents —
SEO + GEO (Generative Engine Optimization) + AEO (Answer Engine Optimization) in one tool.
It ships three faces of one package, kept at strict parity:

- **library** — `import { audit, generate, humanize } from 'geoaeo'`
- **CLI** — `geoaeo audit|init|gen|humanize|mcp`
- **MCP server** — `geoaeo-mcp` (stdio), tools `audit`, `gen`, `humanize`

One version, one build, one test suite feed all three. A capability added to the library is
reachable from the CLI and the MCP server in the same release. That parity is the product.

## Current state (v0.1, do not rebuild)

- `src/audit.ts` — scores a URL or local dir 0–100, lists missing artifacts.
- `src/generators/{llms,robots,sitemap,jsonld,webmcp}.ts` — artifact generators.
- `src/commands/{init,gen,humanize,load-config}.ts` — CLI command bodies.
- `src/humanize.ts` — AI-writing-tell stripper.
- `src/{cli,mcp,index,config,constants}.ts`.
- `tests/{audit,generators,humanize}.test.ts` — 18 tests green.
- Build: tsup (dual ESM/CJS). Test: vitest. Config: `geoaeo.config.ts` (via `jiti`).

## Quality bar (every unit)

- Prose follows ASD-STE100 + the Google developer docs style. Run it clean; no AI tells
  (no em-dash overuse, no "rule of three" padding, no hype, no vague attributions).
- Every claim about what geoaeo does must match the v0.1 code above. Do **not** invent
  commands, flags, or capabilities that do not exist. If a doc needs a capability that is
  not built yet, mark it `<!-- TODO(v0.3): not built -->` — do not pretend it works.
- Code examples must be copy-paste runnable against the real CLI/MCP surface.
- Match existing repo conventions (TS, ESM, kebab-case files).

---

## Work units

### Unit A — release parity + CI  (owner: codex)
Paths: `.github/workflows/**`, `RELEASING.md`, `CHANGELOG.md`, `package.json` (scripts +
`publishConfig` only). **Only unit A touches `package.json`.**

Deliver the staging→production release model for an npm/CLI/MCP package:
- **Staging channel** = npm dist-tag `next`. Every merge to `main` publishes a prerelease
  `x.y.z-next.N` under `@next`. Installable as `npm i geoaeo@next`.
- **Production channel** = npm dist-tag `latest`. A pushed git tag `vX.Y.Z` publishes the
  stable release under `@latest`.
- **Parity is enforced**: both channels run the identical `build` + `test` + `typecheck`
  before publish; only the version suffix and dist-tag differ. Document this in `RELEASING.md`.
- `.github/workflows/ci.yml` — on PR + push: install, typecheck, test, build, and a
  `geoaeo audit` smoke run of the built CLI.
- `.github/workflows/release.yml` — `next` on merge to main, `latest` on tag. Use
  `NPM_TOKEN` secret. Provenance (`npm publish --provenance`) on.
- `CHANGELOG.md` — Keep a Changelog format, seed `0.1.0` + `Unreleased`.
- `package.json` — add `"publishConfig": { "access": "public", "provenance": true }` and any
  release scripts (`release:next`, `release:latest`). Do not touch `name`, `bin`, `exports`.

### Unit B — skills + agents + CLAUDE.md/AGENTS.md  (owner: kimi k3)
Paths: `.claude/skills/geoaeo/**`, `.claude/agents/**`, `CLAUDE.md`, `AGENTS.md`.

- `.claude/skills/geoaeo/SKILL.md` — a skill that teaches an agent to run geoaeo on any
  target repo: when to trigger (making a site AI-discoverable), the audit→fix loop, how to
  read the score, which generators to run for which gap. Frontmatter `name` + `description`
  per the skill-creator convention.
- `.claude/agents/geoaeo-auditor.md` — subagent that audits a repo and reports the gap list.
- `CLAUDE.md` — repo guide for agents working **in** geoaeo (build, test, conventions,
  the parity rule, the "don't invent capabilities" rule).
- `AGENTS.md` — the cross-harness equivalent (Codex/others read this).

### Unit C — per-harness agent docs  (owner: muse)
Paths: `docs/harnesses/**` only.

One doc per harness, each showing how to wire the geoaeo **MCP server** and (where it
applies) the skill, with a copy-paste config block and a first-run example:
`docs/harnesses/{claude-code,codex,cursor,windsurf,gemini-cli,github-copilot,continue}.md`.
Each: install, MCP config JSON, one `audit` + one `gen` walkthrough, troubleshooting.
The MCP command is `npx geoaeo mcp` (stdio); tools are `audit`, `gen`, `humanize`.

### Unit D — examples  (owner: gemini-personal)
Paths: `examples/**` only.

Three minimal target apps with a README each showing the before→after audit score:
- `examples/nextjs-app/` — Next.js App Router stub + `geoaeo.config.ts` + generated routes.
- `examples/astro-site/` — Astro stub + static artifacts.
- `examples/static-html/` — plain HTML + static `llms.txt`/`sitemap.xml`/`robots.txt`.
Each README: the commands run, the score before, the score after. Keep apps tiny (stubs,
not full apps). Do not add heavy dependencies.

### Unit E — GEO/AEO checklist + roadmap  (owner: pi / grok 4.6)
Paths: `docs/GEO-AEO-CHECKLIST.md`, `docs/ROADMAP.md`, `docs/ENHANCEMENTS.md` only.

- `docs/GEO-AEO-CHECKLIST.md` — the canonical, opinionated checklist to make an app
  discoverable + quotable by AI: crawlability, semantic HTML, structured data (JSON-LD
  kinds), `llms.txt`/`llms-full.txt`, `.md` mirrors, WebMCP, answerability (Q&A framing,
  direct answers), citability (stable URLs, canonical, freshness dates, author/E-E-A-T),
  sitemap/robots, OG/social, i18n/hreflang. Each item: why it matters + how geoaeo covers it
  (or that it does not yet). This checklist is what `audit` should map to.
- `docs/ROADMAP.md` — versioned plan (v0.2 shipped here → v0.3+).
- `docs/ENHANCEMENTS.md` — "how else could this be enhanced": hosted audit API, GitHub
  Action, VS Code extension, citation-share monitoring/alerts, more frameworks, a scorecard
  badge, LLM-as-judge answerability scoring. Idea + rough effort + value each.

---

## Delegation + integration (advisor)

- Fan out A–E on non-overlapping paths. Workers write files only.
- Advisor reviews each diff, runs `npm run typecheck && npm test && npm run build`, fixes,
  then integrates onto branch `world-class` and opens a PR to `main`.
- Publish to npm only after the domain (`usegeoaeo.com`) is registered and the user says go.
