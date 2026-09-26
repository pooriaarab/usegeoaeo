import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@template/ui/primitives/button";

import { LogoMark } from "@/components/brand/logo";
import { Footer } from "@/components/landing/footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { pageAlternates } from "@/utils/page-alternates";

export const metadata: Metadata = {
  title: "Brand",
  description: "Name, mark, colors, typography, and voice rules for geoaeo.",
  alternates: pageAlternates("/brand"),
};

const swatches = [
  { name: "Background", classes: "bg-background text-foreground" },
  { name: "Foreground", classes: "bg-foreground text-background" },
  { name: "Muted", classes: "bg-muted text-muted-foreground" },
  { name: "Primary", classes: "bg-primary text-primary-foreground" },
];

const markMisuseRules = [
  "Do not uppercase geoaeo or capitalize the mark.",
  "Do not recolor the mark; preserve monochrome foreground and background tokens.",
  "Do not add gradients, outlines, shadows, or decorative effects.",
  "Do not stretch, rotate, or alter the square geometry.",
];

const voiceRules = [
  "Lead with the answer or completed action.",
  "Use concrete nouns, active verbs, and short sentences.",
  "Name the exact artifact, command, score, or missing check.",
  "Explain limitations directly without hedging.",
  "Avoid hype, filler, and invented capabilities.",
  "Prefer npm install geoaeo when showing installation.",
];

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main>
        <BrandHero />
        <BrandFoundations />
        <ColorAndType />
      </main>
      <Footer />
    </div>
  );
}

function BrandHero() {
  return (
    <section className="px-5 pb-16 pt-28 sm:pb-24 sm:pt-36">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Brand guide
        </p>
        <h1 className="text-fluid-2xl mb-5 font-bold tracking-tight">
          Clear enough to quote
        </h1>
        <p className="text-fluid-base mb-4 max-w-2xl leading-relaxed text-muted-foreground">
          geoaeo audits sites for search engine optimization (SEO), generative
          engine optimization (GEO), and answer engine optimization (AEO). It
          scores gaps from 0 to 100 and generates discovery artifacts. The
          package is free, open source (MIT), and has no paid tier.
        </p>
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          This human guide at{" "}
          <Link
            href="/brand"
            className="text-foreground underline underline-offset-4 hover:text-muted-foreground"
          >
            /brand
          </Link>{" "}
          defines name, mark, and voice rules. The machine guide at{" "}
          <Link
            href="/design.md"
            className="text-foreground underline underline-offset-4 hover:text-muted-foreground"
          >
            /design.md
          </Link>{" "}
          defines semantic tokens for agents. The{" "}
          <a
            href="https://www.npmjs.com/package/geoaeo"
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-muted-foreground"
          >
            geoaeo package
          </a>{" "}
          ships on npm via <code className="font-mono text-xs">npm install geoaeo</code>.
        </p>
        <Button asChild variant="outline">
          <Link href="/design.md">Read the machine guide</Link>
        </Button>
      </div>
    </section>
  );
}

function BrandFoundations() {
  return (
    <section className="border-t border-border px-5 py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Name and mark
          </p>
          <div className="mb-5 flex items-center gap-3">
            <LogoMark className="size-12 text-xl" />
            <span className="font-mono text-2xl font-semibold">geoaeo</span>
          </div>
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Write the product name as lowercase <code className="font-mono">geoaeo</code>.
            Render the mark as a monochrome, high-contrast square with a lowercase{" "}
            <code className="font-mono">g</code>. Use “usegeoaeo” only for the
            repository or domain.
          </p>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Mark misuse
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {markMisuseRules.map((rule) => (
                <li key={rule} className="border-l border-border pl-3">
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Voice
          </p>
          <ul className="space-y-3 text-sm">
            {voiceRules.map((rule) => (
              <li key={rule} className="border-l border-border pl-4">
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ColorAndType() {
  return (
    <section className="border-t border-border px-5 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Color and type
        </p>
        <h2 className="text-fluid-xl mb-8 font-bold tracking-tight">
          Monochrome structure, semantic states
        </h2>
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {swatches.map((swatch) => (
            <div
              key={swatch.name}
              className={`${swatch.classes} rounded-xl border border-border p-5`}
            >
              <span className="text-sm font-medium">{swatch.name}</span>
            </div>
          ))}
        </div>
        <TypeSamples />
      </div>
    </section>
  );
}

function TypeSamples() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-2xl font-semibold">Archivo</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Interface, prose, and explanatory copy.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="font-mono text-2xl font-semibold">geoaeo audit</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Commands, code, scores, and the product wordmark.
        </p>
      </div>
    </div>
  );
}
