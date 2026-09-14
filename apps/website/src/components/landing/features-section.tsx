import {
  Gauge,
  FileText,
  Braces,
  Bot,
  Sparkles,
  Boxes,
} from "lucide-react";

const features = [
  {
    icon: Gauge,
    title: "Score any site from 0 to 100",
    description:
      "Run geoaeo audit on a live URL or local directory. Inspect 20 weighted checks across answerability, structured data, crawlability, and freshness.",
  },
  {
    icon: FileText,
    title: "Generate discovery artifacts",
    description:
      "Run geoaeo gen to output llms.txt, llms-full.txt, sitemaps, robots.txt, WebMCP manifests, and Markdown mirrors.",
  },
  {
    icon: Braces,
    title: "Schema.org structured data",
    description:
      "Generate JSON-LD for software, product, FAQ, and breadcrumb schemas, ready to drop into any page.",
  },
  {
    icon: Bot,
    title: "Built-in MCP server",
    description:
      "Run geoaeo-mcp over stdio. Agents in Claude Code, Cursor, and other harnesses call the audit, gen, and humanize tools directly.",
  },
  {
    icon: Sparkles,
    title: "Detect AI-writing tells",
    description:
      "Run geoaeo humanize to find AI filler, inflated phrasing, and unnatural patterns that lower search and citation quality.",
  },
  {
    icon: Boxes,
    title: "Framework scaffolding",
    description:
      "Run geoaeo init to scaffold routes and static files into Next.js, Astro, SvelteKit, Nuxt, Remix, or static HTML.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-24 px-5 scroll-mt-20">
      <div className="mx-auto max-w-6xl border-t border-border pt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground mb-10 sm:mb-12">
          01 / WHAT IT DOES
        </p>

        <div className="max-w-2xl mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-[-0.035em] leading-[0.98] mb-4">
            Everything an answer engine looks for
          </h2>
          <p className="text-muted-foreground text-base leading-[1.5]">
            From the audit that finds gaps to the generators that fill them,
            geoaeo provides tools for search and answer engine discoverability.
          </p>
        </div>

        <div className="grid gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-background p-5 sm:p-6"
            >
              <div className="size-9 bg-muted flex items-center justify-center mb-4">
                <f.icon className="size-[18px] text-foreground" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-[1.5]">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
