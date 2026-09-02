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
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl mb-12 sm:mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-2 tracking-wide uppercase">
            Capabilities
          </p>
          <h2 className="text-fluid-xl sm:text-3xl font-bold tracking-tight mb-3">
            Everything an answer engine looks for
          </h2>
          <p className="text-muted-foreground text-fluid-sm sm:text-base">
            From the audit that finds gaps to the generators that fill them,
            geoaeo provides tools for search and answer engine discoverability.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-fade-in">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative p-5 sm:p-6 rounded-xl border border-border bg-card hover:border-foreground/10 transition-colors"
            >
              <div className="size-9 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-foreground/[0.06] transition-colors">
                <f.icon className="size-[18px] text-foreground" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
