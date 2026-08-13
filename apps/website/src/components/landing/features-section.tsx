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
    title: "Score any site 0-100",
    description:
      "Audit a live URL or a local build across 20 weighted checks: answerability, structured data, crawlability, freshness, and E-E-A-T.",
  },
  {
    icon: FileText,
    title: "Generate the AI files",
    description:
      "One command writes llms.txt, llms-full.txt, sitemaps, robots, RSS, and Markdown mirrors of your pages for agents to read.",
  },
  {
    icon: Braces,
    title: "Structured data, done",
    description:
      "Ten JSON-LD kinds, including Organization, WebSite with SearchAction, Article, HowTo, and FAQ, ready to drop in.",
  },
  {
    icon: Bot,
    title: "MCP server built in",
    description:
      "Run geoaeo as a Model Context Protocol server so Claude, Cursor, and other agents can audit and generate on demand.",
  },
  {
    icon: Sparkles,
    title: "Answer-first content",
    description:
      "The humanizer strips AI-writing tells, and the audit rewards direct answers and question framing that engines quote.",
  },
  {
    icon: Boxes,
    title: "Works with your stack",
    description:
      "Scaffold artifacts into Next.js, Astro, SvelteKit, Nuxt, Remix, or plain static HTML. No lock-in, MIT licensed.",
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
            From the audit that finds the gaps to the generators that fill them,
            geoaeo is the full toolkit for AI discoverability.
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
