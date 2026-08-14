# WORKER BRIEF — usegeoaeo

State: Next website + `packages/geoaeo` lib that SHIPS an MCP (`packages/geoaeo/src/mcp.ts`). Already has: root AGENTS.md, llms.txt suite, webmcp.json, a `[page].md/route.ts` route pattern.
ADD: (a) `server.json` — the MCP is an npx-run npm package, so use a `packages` entry (read `packages/geoaeo/package.json` for the real npm name + bin; the MCP is started via that package). (b) `/agents.md` route in `apps/website` — copy the existing `llms.txt` or `[page].md` route. (c) Offer block (this is a dev tool — state the real model: OSS/free `npm i` and any hosted tier; plain block, + JSON-LD only if the website already emits structured data). (d) Refresh root AGENTS.md if its tools table is stale vs `mcp.ts`. 
ALSO (special): add one short line to the root AGENTS.md noting this project follows the `agentification` skill (pooriaarab/skills). One sentence, no more.

---

## Goal

Make this repo more agent-native by adding **purely-additive discovery files**.
An autonomous AI agent should be able to discover the product, understand it, and
find its machine-readable offer. You are adding NEW files/routes only.

## HARD SCOPE — do ONLY these rungs. Nothing else.

You add only additive discovery artifacts. You DO NOT touch auth, billing,
payment, signup, or any existing route/handler logic. If a rung would require
editing existing app logic, SKIP it and list it under "Follow-ups" in your
final report instead.

The allowed rungs (do the ones the repo is missing — see the repo-specific
header at the top of this file for what already exists and what to add):

1. **Root `AGENTS.md`** — at the repo root (NOT a copy of README). Write it for
   the agent that will operate the product. Shape:
   - **Mental model** — one sentence: what goes in, what comes out.
   - **The faces** — how an agent reaches it (CLI `npx …` / SDK `import …` /
     MCP / HTTP API) — one line each, only the ones that exist.
   - **MCP tools table** (only if the repo ships an MCP) — tool name | purpose.
     Source the names from the actual MCP source; do NOT invent tool names.
   - **The loop** — ordered steps an agent follows (discover → configure →
     verify → go). Keep it to what the product actually supports.
   - **Rules** — guardrails (what never to do, what to check before success).
   Keep it short and product-shaped. If a nested AGENTS.md already exists
   (e.g. apps/website/AGENTS.md), the ROOT one may be short and point to it.

2. **Serve `/agents.md` over HTTP** — an operating agent fetches it, it does not
   clone the repo. Add a route that returns the AGENTS.md content as
   `text/markdown; charset=utf-8`. **Use the SAME mechanism the repo already
   uses to serve `llms.txt`** — find the existing `llms.txt/route.ts` (or the
   `[page].md/route.ts` / `about.md/route.ts` pattern) and copy it. Single
   source of truth: the route must return the same text as the root AGENTS.md
   file — read/import it, do NOT hand-duplicate the markdown into a TS string
   that will drift. If the repo has no web app (pure CLI/lib), SKIP this rung
   and note it.

3. **`server.json`** at repo root — the official MCP-registry manifest — ONLY if
   the repo ships an MCP server. Shape (fill in real values):
   ```json
   {
     "$schema": "https://static.modelcontextprotocol.io/schemas/2025-07-09/server.json",
     "name": "io.github.pooriaarab/REPO",
     "description": "One line: what the MCP does.",
     "repository": { "url": "https://github.com/pooriaarab/REPO", "source": "github" },
     "version": "0.1.0",
     "remotes": [ { "type": "streamable-http", "url": "https://HOST/PATH" } ]
   }
   ```
   Use `remotes` for a hosted HTTP MCP; use `packages` (npm) for an npx-run MCP.
   Pick whichever matches how THIS repo's MCP is actually run. If unsure which,
   read the MCP's own README/package.json.

4. **Honest machine-readable `Offer`** — a schema.org JSON-LD `Offer` (or
   `SoftwareApplication` with an `offers` field) describing the real pricing,
   surfaced where the site already emits JSON-LD (find existing structured-data
   / JSON-LD code and add to it), AND a short plain "Offer" block in AGENTS.md.
   TWO HARD RULES, non-negotiable:
   - Only terms the product can actually honor. No made-up discount.
   - NO scarcity / countdown / "sign up now" / fake-urgency copy — state the
     real price plainly. If the product is free / open-source, say that.
   If the repo has no pricing and no JSON-LD surface, add only the plain AGENTS.md
   "Offer" block (e.g. "Free and open-source. `npm i REPO`."). Skip the JSON-LD.

5. **`llms.txt` (+ `llms-full.txt`)** — ONLY if missing. If the repo already
   serves llms.txt, do nothing here. If adding, build it the same way the repo
   builds other generated text routes (shared constant → route), served at root.

## Explicitly OUT of scope (list as Follow-ups, do NOT implement)

- Building a new MCP server where none exists.
- New agent-signup / API-key endpoints.
- Any payment / commerce / x402 / ACP rail.
- "Where did you find us?" signup attribution (touches existing signup form).
- Editing any existing auth/billing/route logic.

## Verify before you finish

- The repo still builds / typechecks if a quick check exists (`pnpm -w typecheck`,
  `npm run build`, etc.). If deps are missing and you cannot run it, say so —
  do NOT claim it passed.
- Every MCP tool name / endpoint you wrote is real (grep the source). No invented names.
- `git diff` shows only additive files + additions to JSON-LD; no deletions of
  existing logic.

## Deliverable

- Make the edits on a new branch `agentify-punchlist`.
- Commit with a clear message (no "Co-Authored-By" trailer).
- Push the branch: `git push -u origin agentify-punchlist`.
- Do NOT open a pull request. Do NOT merge.
- End with a short report: which rungs you did, which you skipped and why, the
  Follow-ups list, and whether the build/typecheck passed or could not run.

## Reference — adscapi (the closest-to-done sibling), for shape only

adscapi has: root AGENTS.md (mental model + faces + tool table + loop + rules),
`.mcp.json`, `server.json`, a `llms.txt/route.ts` returning text, and
`SoftwareApplication`+`Offer` JSON-LD. Match that shape; do not copy its content.
