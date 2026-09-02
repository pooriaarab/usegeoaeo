import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@template/ui/primitives/badge";

const examples = [
  {
    slug: "static-html",
    name: "Static HTML",
    score: 80,
    badge: "Fully optimized",
    badgeVariant: "success" as const,
    summary:
      "A plain GeoWeather site: one index.html plus static artifacts at the root. Scores files directly on disk.",
  },
  {
    slug: "nextjs-app",
    name: "Next.js App Router",
    score: 48,
    badge: "Source dir understates",
    badgeVariant: "warning" as const,
    summary:
      "Generates sitemaps, robots, llms.txt, and Markdown mirrors via route handlers at runtime.",
  },
  {
    slug: "astro-site",
    name: "Astro",
    score: 46,
    badge: "Source dir understates",
    badgeVariant: "warning" as const,
    summary:
      "Compiles titles, meta tags, and JSON-LD into HTML at build time before deployment.",
  },
];

export function ProofSection() {
  return (
    <section id="examples" className="py-16 sm:py-24 px-5 scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <ProofHeading />
        <ProofCards />
        <ProofNote />
      </div>
    </section>
  );
}

function ProofHeading() {
  return (
    <div className="max-w-2xl mb-12 sm:mb-16">
      <p className="text-sm font-medium text-muted-foreground mb-2 tracking-wide uppercase">
        Audit scores
      </p>
      <h2 className="text-fluid-xl sm:text-3xl font-bold tracking-tight mb-3">
        Real targets, real audit scores
      </h2>
      <p className="text-muted-foreground text-fluid-sm sm:text-base">
        Every score comes from running <code className="font-mono text-sm">geoaeo audit .</code> on
        the GeoWeather reference projects shipped in the repository.
      </p>
    </div>
  );
}

function ProofCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
      {examples.map((item) => (
        <Link
          key={item.slug}
          href={`/examples#${item.slug}`}
          className="group relative p-5 sm:p-6 rounded-xl border border-border bg-card hover:border-foreground/10 transition-colors flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-semibold">{item.name}</h3>
              <Badge variant={item.badgeVariant} className="font-normal text-[11px]">
                {item.badge}
              </Badge>
            </div>
            <div className="mb-4">
              <span className="text-4xl font-bold tracking-tight tabular-nums font-mono">
                {item.score}
              </span>
              <span className="text-base font-medium text-muted-foreground font-mono">
                /100
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.summary}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ProofNote() {
  return (
    <div className="p-4 sm:p-5 rounded-xl border border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        <strong className="font-semibold text-foreground">Note:</strong> Framework apps
        understate when audited as a source directory because artifacts are generated
        at runtime. Audit the deployed URL for the live score.
      </p>
      <Link
        href="/examples"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline underline-offset-4 shrink-0"
      >
        Explore all examples
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
