# Roadmap

Versioned plan for geoaeo. Shipped capabilities must match code. Items marked future
are intent, not promises of API shape.

## Product rule (all versions)

One package, three faces, strict parity:

- library — `import { audit, generate, humanize } from 'geoaeo'` (and related exports)
- CLI — `geoaeo audit | init | gen | humanize | mcp`
- MCP — `geoaeo-mcp` (stdio), tools `audit`, `gen`, `humanize`

A capability added to the library is reachable from CLI and MCP in the same release.

---

## v0.1 — baseline (shipped)

Minimum useful loop: measure gaps, generate artifacts, clean prose.

| Area | What shipped |
| --- | --- |
| Audit | URL or local dir → 0–100 score, weighted checks, top fixes, optional `--json` |
| Generators | `llms`, `llms-full`, `jsonld` (software/product/faq/breadcrumb), `webmcp`, `sitemap`, `robots` |
| Init | Next.js App Router routes or static files from config; `--force` |
| Humanize | Glob check/write; preserves code/JSX/frontmatter |
| Config | `geoaeo.config.ts` via `defineConfig` / jiti |
| Distribution | Dual ESM/CJS build (tsup), vitest suite |

Audit checks: llms, llms-full, sitemap, robots, title, description, canonical, open-graph,
twitter, json-ld, webmcp, markdown, answer-first.

---

## v0.2 — world-class packaging (this build)

Focus: make the existing engine usable in real teams and agent harnesses without
inventing new audit dimensions.

| Track | Deliverable |
| --- | --- |
| Release | Staging npm tag `next` on main; production `latest` on git tag; CI typecheck/test/build + CLI smoke |
| Agent UX | Skill + auditor subagent; `CLAUDE.md` / `AGENTS.md`; per-harness MCP docs |
| Examples | Minimal Next.js, Astro, and static-html targets with before/after audit notes |
| Docs | This roadmap, GEO/AEO checklist mapped to audit, enhancement backlog |

**Exit criteria**

- Docs and examples only describe real commands and generators.
- CI blocks merge on test/typecheck/build failure.
- Checklist ↔ audit ID map is published (`docs/GEO-AEO-CHECKLIST.md`).

---

## v0.3 — deeper audit fidelity

Close the highest-value checklist gaps that teams still fix by hand.

### Planned themes

1. **Freshness**
   - Config or frontmatter `dateModified` / `updated`
   - Sitemap `<lastmod>` from the same source
   - Audit fails when key pages have no freshness signal
   - <!-- TODO(v0.3): not built -->

2. **Citability / E-E-A-T**
   - Optional `Organization` and `Person` JSON-LD kinds
   - Author/publisher fields in config
   - Audit signals for author presence on article-like pages
   - <!-- TODO(v0.3): not built -->

3. **Answerability beyond FAQ keyword**
   - Detect direct-answer opening (question-shaped H1 or lead sentence)
   - Optional check that FAQ JSON-LD questions appear in visible text
   - <!-- TODO(v0.3): not built -->

4. **Markdown mirrors**
   - `gen` support or `init` templates for `.md` twins of configured pages
   - Stronger audit parity notes when HTML exists without MD
   - <!-- TODO(v0.3): not built -->

5. **i18n**
   - Locale list in config
   - hreflang audit (link tags and/or sitemap)
   - <!-- TODO(v0.3): not built -->

6. **JSON-LD expansion**
   - Additional kinds only when tied to audit or clear docs: e.g. `organization`, `website`, `article`
   - Still no fake “rich results guaranteed” claims

### Compatibility intent

- Keep existing check IDs stable; add new IDs rather than renaming.
- Rebalance weights only with a changelog note; document new total if not 100.

---

## v0.4 — platform integrations

Move geoaeo from “run locally” to “runs where the site already builds.”

| Integration | Intent |
| --- | --- |
| GitHub Action | `geoaeo audit` on PR/deploy; fail under threshold; upload JSON report |
| Scorecard badge | SVG/JSON endpoint or static badge from last CI audit |
| Framework kits | First-class Astro/Nuxt examples hardened; document patterns (still config + files, not heavy runtime deps) |
| Hosted audit API | Optional remote `POST /audit` for URL targets (auth, rate limits) — see enhancements |

Parity rule still applies: Action and API call the same library entry points as the CLI.

---

## v0.5+ — measurement and judgment

Only after artifact generation and CI gates are boring.

| Theme | Notes |
| --- | --- |
| Citation-share monitoring | Track if/when answer engines cite configured URLs; alert on drops |
| LLM-as-judge answerability | Sample prompts → score whether the live page would answer; never sole audit score |
| VS Code extension | Run audit/gen/humanize on the workspace with problem-panel findings |
| Bot policy presets | Opinionated robots allowlists for major AI crawlers (opt-in) |

Details and effort in `docs/ENHANCEMENTS.md`.

---

## Non-goals (through v0.4)

- Building a general SEO suite (backlinks, rank tracking, log analytics).
- Guaranteeing placement inside any proprietary answer engine.
- Replacing framework metadata APIs (Next `metadata`, etc.) with a parallel system of record.
- Shipping exploit tooling, cloaking, or doorway-page generators.

---

## Decision log (short)

| Decision | Choice | Why |
| --- | --- | --- |
| Single package | library + CLI + MCP together | Agents and humans share one behavior |
| Config file | `geoaeo.config.ts` | Site facts stay typed and reusable across generators |
| Audit target | URL or directory | Works pre-deploy and in CI against `dist`/`out` |
| Score model | Weighted checks summing to 100 today | Simple, explainable; map published in checklist |
| JSON-LD kinds | software, product, faq, breadcrumb | Covers common SaaS home/pricing/FAQ without schema sprawl |

---

## How to read status

| Label | Meaning |
| --- | --- |
| Shipped | In the published package / this repo’s current code |
| This build (v0.2) | Docs, CI, examples, agent wiring around v0.1 engine |
| v0.3+ | Not built; safe to discuss; do not document as CLI flags |

When writing user-facing docs, if a feature is not in the table for v0.1/v0.2, mark it
future or omit it.
