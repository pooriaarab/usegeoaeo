import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@template/ui/primitives/button";

import { LogoMark } from "@/components/brand/logo";
import { Footer } from "@/components/landing/footer";
import { LandingHeader } from "@/components/landing/landing-header";

export const metadata: Metadata = {
  title: "Brand",
  description: "The name, mark, colors, typography, and voice of geoaeo.",
};

const swatches = [
  { name: "Background", classes: "bg-background text-foreground" },
  { name: "Foreground", classes: "bg-foreground text-background" },
  { name: "Muted", classes: "bg-muted text-muted-foreground" },
  { name: "Primary", classes: "bg-primary text-primary-foreground" },
];

const voiceRules = [
  "Lead with the answer.",
  "Name the exact command, artifact, or score.",
  "Use short sentences and active verbs.",
  "Never invent a capability or pricing claim.",
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
        <p className="text-fluid-base mb-8 max-w-2xl leading-relaxed text-muted-foreground">
          geoaeo uses direct language, quiet surfaces, and precise technical
          details. The product should feel useful before it feels branded.
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
          <p className="max-w-xl text-muted-foreground">
            Keep the name lowercase. Keep the mark monochrome. Use “usegeoaeo”
            only for the repository or domain.
          </p>
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
        <p className="text-2xl font-semibold">Geist Sans</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Interface, guidance, and long-form explanation.
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
