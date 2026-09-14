import Link from "next/link";
import { Button } from "@template/ui/primitives/button";
import { Check } from "lucide-react";

const features = [
  "Full site audit: 24 weighted checks with 0-100 score",
  "All generators: llms.txt, JSON-LD, sitemaps, robots.txt, WebMCP, RSS, Markdown mirrors",
  "Scaffolding for Next.js, Astro, SvelteKit, Nuxt, Remix, and static HTML",
  "Built-in MCP server: audit, gen, and humanize tools over stdio",
  "CI regression gating with geoaeo audit --ci --min-score",
  "Free and open source under MIT, with no paid tier or telemetry",
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 sm:py-24 px-5 scroll-mt-20">
      <div className="mx-auto max-w-6xl border-t border-border pt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground mb-10 sm:mb-12">
          03 / PRICING
        </p>

        <PricingHeading />

        <div className="max-w-md">
          <PricingCard />
        </div>
      </div>
    </section>
  );
}

/** The heading above the single pricing card. */
function PricingHeading() {
  return (
    <div className="max-w-2xl mb-12 sm:mb-16">
      <h2 className="text-4xl sm:text-5xl font-bold tracking-[-0.035em] leading-[0.98] mb-4">
        Free and open source
      </h2>
      <p className="text-muted-foreground text-base leading-[1.5]">
        geoaeo is MIT licensed. Every feature is free with no paid tier.
      </p>
    </div>
  );
}

/** The one and only plan: everything, free, MIT licensed. */
function PricingCard() {
  return (
    <div className="border border-foreground bg-card p-6 sm:p-8 flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">geoaeo</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Complete CLI, library, and MCP server.
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">$0</span>
          <span className="text-sm text-muted-foreground">/ forever</span>
        </div>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check className="size-4 text-foreground shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2">
        <Button asChild className="w-full shadow-none">
          <Link href="/docs">Read the docs</Link>
        </Button>
        <Button asChild variant="outline" className="w-full shadow-none">
          <a href="https://github.com/pooriaarab/usegeoaeo" target="_blank" rel="noreferrer">
            Star on GitHub
          </a>
        </Button>
      </div>
    </div>
  );
}
