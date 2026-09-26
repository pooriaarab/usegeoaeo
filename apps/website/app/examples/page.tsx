import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@template/ui/primitives/badge";
import { Button } from "@template/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@template/ui/primitives/card";
import { Alert, AlertDescription } from "@template/ui/primitives/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@template/ui/primitives/breadcrumb";
import { LandingHeader } from "@/components/landing/landing-header";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Examples — geoaeo",
  description:
    "Three geoaeo example sites and their source-directory audit scores: static HTML 80/100, Next.js 48/100, Astro 46/100. Framework apps understate when audited as a source directory because artifacts are generated at runtime.",
};

const examples = [
  {
    slug: "static-html",
    name: "Static HTML",
    path: "packages/geoaeo/examples/static-html",
    score: 80,
    badge: "Fully optimized",
    badgeVariant: "success" as const,
    summary:
      "A plain GeoWeather site: one index.html plus the static artifacts geoaeo init writes at the site root. geoaeo audit . scores the files directly.",
    why:
      "This example ships fully optimized. It passes every technical and structured-data check. The open gaps are answerability signals a real content site adds: a dated/updated stamp, a named author, and Markdown mirrors.",
    command: "cd examples/static-html && geoaeo audit .",
    files: [
      { file: "index.html", purpose: "Home page with meta tags, Open Graph, Twitter, and JSON-LD" },
      { file: "geoaeo.config.ts", purpose: "Site metadata, tools, pricing, FAQ" },
      { file: "llms.txt", purpose: "Short LLM site map" },
      { file: "llms-full.txt", purpose: "Full LLM site map with FAQ and pricing" },
      { file: "sitemap.xml", purpose: "XML sitemap" },
      { file: "robots.txt", purpose: "Crawler policy with a Sitemap: line" },
      { file: "webmcp.json", purpose: "WebMCP tool manifest for agents" },
    ],
  },
  {
    slug: "nextjs-app",
    name: "Next.js App Router",
    path: "packages/geoaeo/examples/nextjs-app",
    score: 48,
    badge: "Source dir understates",
    badgeVariant: "warning" as const,
    summary:
      "A minimal Next.js App Router site with the route handlers, config, and SEO components that geoaeo init produces.",
    why:
      "Next.js generates GEO/AEO artifacts at runtime: route handlers for sitemap, robots, llms.txt, JSON-LD, and .md mirrors. A static source-directory audit cannot see that output, so 48/100 understates the live result. Audit the deployed URL for the true score.",
    command: "cd examples/nextjs-app && geoaeo audit .",
    files: [
      { file: "geoaeo.config.ts", purpose: "Site metadata, tools, pricing, FAQ" },
      { file: "src/app/llms.txt/route.ts", purpose: "Short LLM site map (GET → plain text)" },
      { file: "src/app/llms-full.txt/route.ts", purpose: "Full LLM site map with FAQ and pricing" },
      { file: "src/app/sitemap.ts", purpose: "Dynamic sitemap.xml" },
      { file: "src/app/robots.ts", purpose: "Dynamic robots.txt" },
      { file: "src/app/webmcp/route.ts", purpose: "WebMCP tool manifest (JSON)" },
      { file: "src/app/[page].md/route.ts", purpose: "Markdown mirrors of every page" },
      { file: "src/components/seo/json-ld.tsx", purpose: "JSON-LD for software, product, and FAQ" },
    ],
  },
  {
    slug: "astro-site",
    name: "Astro",
    path: "packages/geoaeo/examples/astro-site",
    score: 46,
    badge: "Source dir understates",
    badgeVariant: "warning" as const,
    summary:
      "A minimal Astro site with geoaeo.config.ts and the static artifact files geoaeo init produces for non-Next.js projects.",
    why:
      "Astro holds titles, meta tags, and JSON-LD in .astro source. Those only appear in HTML after astro build. A source-directory audit cannot see them, so 46/100 understates the result. Audit the built dist/ or the deployed URL.",
    command: "cd examples/astro-site && geoaeo audit .",
    files: [
      { file: "geoaeo.config.ts", purpose: "Site metadata, tools, pricing, FAQ" },
      { file: "src/pages/index.astro", purpose: "Home page source (meta, OG, Twitter, JSON-LD)" },
      { file: "llms.txt", purpose: "Short LLM site map" },
      { file: "llms-full.txt", purpose: "Full LLM site map with FAQ and pricing" },
      { file: "sitemap.xml", purpose: "XML sitemap" },
      { file: "robots.txt", purpose: "Crawler policy with a Sitemap: line" },
      { file: "webmcp.json", purpose: "WebMCP tool manifest for agents" },
    ],
  },
];

export default function ExamplesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main className="pt-28 sm:pt-32 pb-16 sm:pb-24 px-5">
        <div className="mx-auto max-w-6xl">
          <ExamplesBreadcrumb />

          <PageIntro />

          <SourceAuditCaveat />

          <ScoreCards />

          <ExampleCards />

          <ReproduceSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}

/** Home / Examples. */
function ExamplesBreadcrumb() {
  return (
    <Breadcrumb className="mb-8">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Examples</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/** Title and the one-paragraph framing. */
function PageIntro() {
  return (
    <div className="max-w-2xl mb-10 sm:mb-14">
      <p className="text-sm font-medium text-muted-foreground mb-2 tracking-wide uppercase">
        Examples
      </p>
      <h1 className="text-fluid-xl sm:text-4xl font-bold tracking-tight mb-4">
        Three GeoWeather targets, three audit scores
      </h1>
      <p className="text-muted-foreground text-fluid-sm sm:text-base leading-relaxed">
        The geoaeo package ships a static HTML site, a Next.js App Router
        app, and an Astro site. Each is the same product (GeoWeather)
        after <code className="font-mono text-sm">geoaeo init</code>.
        Scores below are from{" "}
        <code className="font-mono text-sm">geoaeo audit .</code> on the
        source directory.
      </p>
    </div>
  );
}

/** Why a source-directory audit understates a framework app. */
function SourceAuditCaveat() {
  return (
    <Alert className="mb-10 sm:mb-14 max-w-3xl">
      {/* Same look as AlertTitle, but a paragraph so we do not skip h2–h4. */}
      <p className="mb-1 font-medium leading-none tracking-tight">
        Source-directory audits understate framework apps
      </p>
      <AlertDescription>
        <p>
          Framework apps understate when audited as a source directory
          because artifacts are generated at runtime. Next.js serves{" "}
          <code className="font-mono text-xs">llms.txt</code>, sitemap,
          robots, WebMCP, and Markdown mirrors from route handlers. Astro
          writes titles, meta, and JSON-LD into HTML at build time. Audit
          the deployed URL (or Astro{" "}
          <code className="font-mono text-xs">dist/</code>) for the true
          score. The static HTML example has no such gap: the files on
          disk are what engines fetch.
        </p>
      </AlertDescription>
    </Alert>
  );
}

/** Jump links, one per example, showing its score. */
function ScoreCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-3 mb-12 sm:mb-16">
      {examples.map((example) => (
        <a
          key={example.slug}
          href={`#${example.slug}`}
          className="rounded-xl border border-border bg-card p-5 hover:border-foreground/10 transition-colors"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            {example.name}
          </p>
          <p className="text-3xl font-bold tracking-tight tabular-nums">
            {example.score}
            <span className="text-base font-medium text-muted-foreground">
              /100
            </span>
          </p>
        </a>
      ))}
    </div>
  );
}

/** The full write-up for each example. */
function ExampleCards() {
  return (
    <div className="grid gap-8">
      {examples.map((example) => (
        <ExampleCard key={example.slug} example={example} />
      ))}
    </div>
  );
}

/** How to re-run the audits yourself. */
function ReproduceSection() {
  return (
    <div className="mt-14 max-w-2xl">
      <h2 className="text-fluid-xl sm:text-2xl font-bold tracking-tight mb-3">
        Reproduce a score
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        From a clone of the repo, audit the example directory. Then
        compare the gap list to the{" "}
        <Link href="/checklist" className="text-foreground underline underline-offset-4">
          GEO/AEO checklist
        </Link>
        .
      </p>
      <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs font-mono mb-6">{`npx geoaeo audit ./packages/geoaeo/examples/static-html
npx geoaeo audit ./packages/geoaeo/examples/nextjs-app
npx geoaeo audit ./packages/geoaeo/examples/astro-site`}</pre>
      <Button asChild>
        <Link href="/checklist">
          Open the checklist
          <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}


/** One example: its badges, summary, audit command and shipped files. */
function ExampleCard({ example }: { example: (typeof examples)[number] }) {
  return (
    <Card id={example.slug} className="scroll-mt-24">
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant={example.badgeVariant} className="font-normal">
            {example.badge}
          </Badge>
          <Badge variant="outline" className="font-mono font-normal">
            {example.score}/100
          </Badge>
        </div>
        <CardTitle className="text-xl">{example.name}</CardTitle>
        <CardDescription className="font-mono text-xs">
          {example.path}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm leading-relaxed">{example.summary}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {example.why}
        </p>
        <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs font-mono">
          {example.command}
        </pre>
        <div>
          <h2 className="text-sm font-semibold mb-3">What ships</h2>
          <ul className="space-y-2">
            {example.files.map((item) => (
              <li
                key={item.file}
                className="grid gap-1 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4 text-sm"
              >
                <code className="font-mono text-xs break-all">
                  {item.file}
                </code>
                <span className="text-muted-foreground">
                  {item.purpose}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
