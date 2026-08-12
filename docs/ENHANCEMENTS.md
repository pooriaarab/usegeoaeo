# Enhancements

Ideas beyond the current CLI / library / MCP surface. None of these are shipped.
Each entry: idea, rough effort, value, and notes on how it should reuse the existing
engine so parity does not break.

Effort scale: **S** days · **M** about one to two weeks · **L** multi-week · **XL** ongoing product.

---

## 1. Hosted audit API

**Idea.** HTTP API that runs the same `auditTarget` logic against a public URL and
returns the JSON report (`score`, `checks`, `topFixes`, `pages`). Enables dashboards,
agency workflows, and “audit this link” buttons without a local Node install.

**Rough effort.** L  
Auth, rate limits, abuse controls (SSRF protections for fetch), queueing for slow
targets, hosting, billing if public, SLOs.

**Value.** High for distribution. Turns geoaeo from a dev dependency into a service
edge while keeping scoring identical to `geoaeo audit --json`.

**Design constraints.**
- Call the published library; do not fork check logic.
- Default to URL targets only (no arbitrary customer disk).
- Return the same `AuditReport` shape as the CLI `--json` path.
- Cache by URL + content hash with short TTL; never claim live citation guarantees.

**Depends on.** Stable audit JSON schema (document and version it), SSRF-safe fetcher.

---

## 2. GitHub Action

**Idea.** Official action: checkout → install → `geoaeo audit <url-or-dir>` → fail if
score < threshold → upload report artifact. Optional comment on PR with top fixes.

**Rough effort.** M  
Action metadata, example workflows, threshold inputs, JSON summary for job annotations,
docs in the action README.

**Value.** High for adoption. Makes the v0.2 CI smoke pattern reusable for *consumer*
repos, not only geoaeo itself.

**Design constraints.**
- Inputs mirror CLI: `target`, `threshold`, `json`, optional path to `geoaeo.config.ts`
  for gen steps if we add a composite “audit + suggest gen” later.
- Prefer `npx geoaeo@latest` (or pinned version input) over bundling a second build.
- Do not require secrets beyond what the target site already needs.

**Nice follow-on.** Post a sticky PR comment only when score drops vs base branch.

---

## 3. VS Code extension

**Idea.** Workspace commands: Audit folder, Generate artifact, Humanize open file.
Show failed checks in the Problems panel; CodeLens on `geoaeo.config.ts` for “preview
llms.txt.”

**Rough effort.** L  
Extension host, config resolution, task UX, packaging, marketplace listing, keep in
lockstep with CLI versions.

**Value.** Medium–high for content and marketing sites edited in-editor. Lower for
teams that already live in CI + agents.

**Design constraints.**
- Shell out to or import the same package API (`auditTarget`, generators, humanize).
- Humanize `--check` findings should map to ranges when possible; fall back to file-level
  diagnostics if offsets are unavailable.
- MCP users may not need this; keep scope thin (no full CMS).

---

## 4. Citation-share monitoring and alerts

**Idea.** Periodic probes: for a set of prompts and engines/surfaces you care about,
record whether your URLs appear as citations or grounded sources. Alert on disappearance
or share drop. Pair with audit score so “artifacts healthy but citations down” is visible.

**Rough effort.** XL  
Provider APIs differ; some surfaces have no official API. Needs storage, scheduling,
legal/ToS review per surface, noisy-result handling, and clear ethics (no cloaking, no
ToS-violating scraping dressed up as product).

**Value.** Very high if accurate—this is the business metric GEO/AEO exists for. Also
the easiest place to overclaim; ship only with transparent methodology.

**Design constraints.**
- Separate product surface from core audit score (do not bake flaky external probes into
  the 0–100 artifact score).
- Start with export formats (CSV/JSON) and webhooks before a full dashboard.
- Document sample size, geography, and login state of each probe.

**Prereq.** Stable site identity in config (`siteUrl`, key paths); optional hosted API
for running probes off-laptop.

---

## 5. More frameworks

**Idea.** First-class init/docs beyond Next App Router vs generic static files: Astro,
Nuxt, SvelteKit, Remix/React Router frameworks, plain Vite multi-page. Each gets a tiny
example and an `init` detection path that drops artifacts where that framework serves
static files or routes.

**Rough effort.** M per framework for example + init detection; L if maintaining
official adapters that track framework major versions.

**Value.** Medium–high. Reduces “works on Next, unclear elsewhere.” Examples already
planned in v0.2 for Astro and static HTML; deeper init automation is the enhancement.

**Design constraints.**
- Prefer generating standard files (`public/llms.txt`, etc.) over framework-specific
  runtime plugins.
- Keep generators framework-agnostic; only `init` layout differs.
- Do not add heavy peer dependencies to core `geoaeo`.

---

## 6. Scorecard badge

**Idea.** A badge (`geoaeo-score-92.svg`) and optional JSON endpoint showing the last
audit score for a site. Embed in README or footer. Link target opens the checklist
section for top failing checks.

**Rough effort.** S–M standalone generator in CI; L if hosted and always-on.

**Value.** Medium for social proof and open-source README culture; light pressure to
keep artifacts green. Low direct SEO value.

**Design constraints.**
- Badge must state *when* it was computed and *what* was audited (commit SHA or URL).
- Easy to game if hosted without re-audit; prefer CI-produced SVG committed or uploaded
  as a release asset.
- Never imply certification by a standards body.

**Implementation sketch.** GitHub Action runs audit → writes `scorecard.json` + SVG →
pages/README consume the artifact.

---

## 7. LLM-as-judge answerability scoring

**Idea.** Given N prompts (“What does {product} cost?”, “Does it have an API?”), fetch
page text and ask a model whether the page answers directly, partially, or not at all.
Emit a separate **answerability** report alongside the deterministic artifact score.

**Rough effort.** L  
Prompt set design, judge rubrics, multi-model variance, cost controls, offline fixtures
for tests, user-supplied API keys.

**Value.** High for content quality; complementary to checklist items that regex cannot
see. Risk: non-deterministic CI if used as a hard gate.

**Design constraints.**
- Keep the classic weighted audit **deterministic and offline**.
- Ship judge mode as `audit --answerability` or a distinct command only after the rubric
  is documented; mark flaky in CI docs.
- Store raw judge rationales for debugging; version the rubric.
- Prefer extracting page text the same way audit already fetches/parses HTML.

**Open questions.** Default prompt pack per site type (SaaS, docs, blog); how to avoid
punishing intentionally narrow landing pages.

---

## Other candidates (shorter list)

| Idea | Effort | Value | Note |
| --- | --- | --- | --- |
| AI-crawler robots presets (opt-in allow/deny lists) | S | M | Easy to get wrong legally/product-wise; keep opt-in |
| `Organization` / `Article` JSON-LD kinds | S–M | M | Fits v0.3 citability theme |
| Sitemap hreflang / locale-aware llms | M | M | Needs real i18n config model |
| MD mirror generator from HTML or MDX | M | H | Closes audit `markdown` gap with a real fix path |
| Config schema JSON for non-TS consumers | S | M | Helps Python/Ruby sites calling CLI only |
| Baseline score budgets in config (`minScore: 85`) | S | M | Pairs with Action |
| Diff mode: audit vs previous JSON report | S | M | “What regressed?” in CI |
| Playwright-backed render pass | L | M | Only for SPA-heavy targets; keep optional |

---

## Priority suggestion

If capacity is limited, sequence by leverage on the existing engine:

1. **GitHub Action** + **score budgets** — force the loop in consumer CI.  
2. **Markdown mirror generation** + **freshness/E-E-A-T audit fields** — raise the ceiling of the deterministic score.  
3. **Scorecard badge** — cheap visibility on top of Action output.  
4. **Hosted audit API** — when support load from “help me run Node” justifies ops.  
5. **LLM-as-judge** — after deterministic checks plateau.  
6. **Citation-share monitoring** — when methodology and ToS path are clear.  
7. **VS Code extension** — when editor-centric users show up in feedback.

---

## Contribution test for any enhancement

Before adding a feature, answer:

1. Does it call the same library entry points as `geoaeo` / `geoaeo-mcp`?
2. Can docs show a copy-paste command that works on the released package?
3. Does it avoid claiming engine-specific ranking outcomes?
4. If it is not built yet, is it marked future here—not in the README as a live flag?

If those fail, it is not an enhancement to geoaeo; it is a different product.
