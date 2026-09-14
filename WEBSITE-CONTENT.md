# usegeoaeo.com — content brief

The site for the **geoaeo** npm package. Workers: build ONLY your unit, write files only, no
git/npm/build. Match the existing design (Next.js App Router at `apps/website/app/`, landing
components at `apps/website/src/components/landing/*.tsx`, shadcn primitives from
`@template/ui/primitives/*`, Tailwind v4, Geist fonts). The advisor builds + reviews.

## Product truth (do NOT invent)
- **geoaeo** = an npm package (CLI + MCP server + library) that makes any app discoverable and
  quotable by AI answer engines: SEO + GEO (Generative Engine Optimization) + AEO (Answer Engine
  Optimization). Install: `npm install geoaeo`. Free and open source (MIT).
- Real commands only: `geoaeo audit <url|dir>` (0–100 score + gap list), `geoaeo init`
  (scaffold artifacts into Next/Astro/SvelteKit/Nuxt/Remix/static), `geoaeo gen <artifact>`
  (llms.txt, llms-full, sitemap, robots, jsonld, webmcp, ogimage, rss, hreflang, mdmirror),
  `geoaeo humanize` (strip AI-writing tells), `geoaeo mcp` (MCP server, bin `geoaeo-mcp`,
  tools audit/gen/humanize). Audit = 24 weighted checks (answerability, structured data,
  llms.txt, crawlability, freshness, E-E-A-T…).
- Audience: indie hackers → enterprise teams who want their site cited by ChatGPT, Claude,
  Perplexity, Google AI. Source of truth: `packages/geoaeo/README.md`,
  `packages/geoaeo/docs/GEO-AEO-CHECKLIST.md`, `packages/geoaeo/docs/harnesses/*.md`.

## Copy quality
Answer-first, concrete, plain. Short sentences. No hype, no em-dash overuse, no "rule of three"
padding. This site is itself a GEO/AEO showcase — write like it will be quoted by an LLM.

## Units

### W1 — landing copy (owner: kimi)
Rewrite the 8 components in `apps/website/src/components/landing/` and the metadata in
`apps/website/app/page.tsx` + `apps/website/app/layout.tsx` for geoaeo. Keep each component's
structure/props/imports; change the COPY only (headings, body, feature lists, FAQ Q&A, pricing =
"Free & open source"). Hero: what geoaeo is + `npm install geoaeo`. Integration-marquee: the
harnesses (Claude Code, Cursor, Windsurf, Codex, Gemini CLI, Copilot, Continue). FAQ: real
questions (What is GEO/AEO? Does it work with my framework? Is it free?). Footer links: Docs,
Checklist, Examples, Tools, GitHub, npm. Do NOT touch other files.

### W2 — docs pages (owner: muse)
Create `apps/website/app/docs/` — a docs index page + pages for Install, CLI, MCP, and one page
per harness (from `packages/geoaeo/docs/harnesses/*.md`). Server components, each exports
`metadata` (title + description). Reuse `@template/ui` prose/typography. Link from the footer.
Match the App Router patterns already in the repo. Do NOT touch landing/ or app/tools/.

### W3 — free tools (advisor-owned)
`apps/website/app/tools/` — web audit (URL → score, needs a server route for the fetch),
llms.txt generator, JSON-LD generator. Interactive client components + one API route.

### W4 — checklist + examples pages (owner: pi / grok-4.6)
Create `apps/website/app/checklist/page.tsx` (render `packages/geoaeo/docs/GEO-AEO-CHECKLIST.md`
as a styled page — you may inline the content as JSX/MDX) and `apps/website/app/examples/page.tsx`
(summarize the three examples in `packages/geoaeo/examples/` with their audit scores:
static-html 80, nextjs-app 48, astro-site 46, and a note that framework apps understate as
source dirs). Each exports `metadata`. Match the design. Do NOT touch landing/, docs/, or tools/.
