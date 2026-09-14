import Link from "next/link";
import { Button } from "@template/ui/primitives/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative px-5 pt-32 sm:pt-40 pb-16 sm:pb-24">
      <div className="relative mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground mb-6">
            SEO + GEO + AEO
          </p>

          <h1 className="text-[clamp(2.75rem,8vw,6rem)] font-bold tracking-[-0.035em] leading-[0.98] text-foreground mb-8">
            Get your site cited by AI answers
          </h1>

          <div className="w-8 mb-8">
            <span aria-hidden="true" className="swiss-red-square" />
          </div>

          <p className="text-base sm:text-lg text-muted-foreground leading-[1.5] mb-8">
            geoaeo audits your site 0&ndash;100 and generates the llms.txt,
            structured data, and Markdown mirrors engines cite.
          </p>

          <div className="mb-8 max-w-md">
            <code className="block border border-border bg-muted px-4 py-3 text-sm font-mono">
              npm install geoaeo
            </code>
          </div>

          <HeroActions />
        </div>
      </div>
    </section>
  );
}

/** The hero call to action: docs, then the hosted tools. */
function HeroActions() {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-3">
      <Button asChild size="lg" className="w-full sm:w-auto shadow-none">
        <Link href="/docs">
          Read the docs
          <ArrowRight />
        </Link>
      </Button>
      <Button
        asChild
        variant="outline"
        size="lg"
        className="w-full sm:w-auto shadow-none"
      >
        <Link href="/tools">Try the free tools</Link>
      </Button>
    </div>
  );
}
