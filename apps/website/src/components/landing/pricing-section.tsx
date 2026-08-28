import Link from "next/link";
import { Button } from "@template/ui/primitives/button";
import { Check } from "lucide-react";

const features = [
  "The full audit: 20 weighted checks, 0-100 score",
  "Every generator: llms.txt, sitemap, robots, JSON-LD, WebMCP, RSS, Markdown mirrors",
  "init scaffolds for Next.js, Astro, SvelteKit, Nuxt, Remix, and static HTML",
  "MCP server for Claude, Cursor, and other agents",
  "CI gate: audit --ci --min-score",
  "No account, no telemetry, no paywall",
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 sm:py-24 px-5 scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <PricingHeading />

        <div className="mx-auto max-w-md">
          <PricingCard />
        </div>
      </div>
    </section>
  );
}

/** The centred heading above the single pricing card. */
function PricingHeading() {
  return (
    <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
      <p className="text-sm font-medium text-muted-foreground mb-2 tracking-wide uppercase">
        Pricing
      </p>
      <h2 className="text-fluid-xl sm:text-3xl font-bold tracking-tight mb-3">
        Free and open source
      </h2>
      <p className="text-muted-foreground text-fluid-sm sm:text-base">
        geoaeo is MIT licensed. Everything, for everyone, at no cost.
      </p>
    </div>
  );
}

/** The one and only plan: everything, free, MIT licensed. */
function PricingCard() {
  return (
    <div className="relative rounded-xl border border-primary bg-card p-6 sm:p-8 flex flex-col shadow-keystone">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">geoaeo</h3>
        <p className="text-sm text-muted-foreground mb-4">
          The whole toolkit, open source.
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">$0</span>
          <span className="text-sm text-muted-foreground">/ forever</span>
        </div>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check className="size-4 text-success shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2">
        <Button asChild className="w-full">
          <Link href="/docs">Read the docs</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <a href="https://github.com/pooriaarab/usegeoaeo" target="_blank" rel="noreferrer">
            Star on GitHub
          </a>
        </Button>
      </div>
    </div>
  );
}
