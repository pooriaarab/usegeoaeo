export interface LandingFaq {
  question: string;
  answer: string;
}

// One source for the visible FAQ section and the FAQPage JSON-LD on the
// landing page, so schema and copy cannot drift apart.
export const faqs: LandingFaq[] = [
  {
    question: "What is GEO and AEO?",
    answer:
      "GEO is Generative Engine Optimization. AEO is Answer Engine Optimization. They ensure AI engines like ChatGPT, Claude, Perplexity, and Google AI can find, quote, and cite your site. geoaeo unifies SEO, GEO, and AEO into one audit and artifact workflow.",
  },
  {
    question: "What does geoaeo do?",
    answer:
      "geoaeo audits any site from 0 to 100 across 31 weighted checks, then generates missing discovery artifacts. It outputs llms.txt, llms-full.txt, sitemaps, robots.txt, JSON-LD schemas, WebMCP manifests, and Markdown mirrors. It also includes an AI copy humanizer and an MCP server.",
  },
  {
    question: "Does geoaeo work with my framework?",
    answer:
      "Yes. Run geoaeo init to scaffold artifacts into Next.js, Astro, SvelteKit, Nuxt, Remix, or static HTML. The audit inspects any live URL or local site directory.",
  },
  {
    question: "How do I use geoaeo with coding agents?",
    answer:
      "Run the MCP server with npx geoaeo mcp over stdio. It exposes audit, gen, and humanize tools directly to Claude Code, Cursor, Windsurf, Codex, Gemini CLI, Copilot, and Continue.",
  },
  {
    question: "Is geoaeo free?",
    answer:
      "Yes. geoaeo is free and open source under the MIT license. There are no paid tiers, no user accounts, and no telemetry. Install it with npm install geoaeo.",
  },
  {
    question: "Can I gate CI builds on the audit score?",
    answer:
      "Yes. Run geoaeo audit <url|dir> --ci --min-score 90 in your pipeline. The command exits with a non-zero code when the score falls below your threshold, failing the build on regressions.",
  },
];
