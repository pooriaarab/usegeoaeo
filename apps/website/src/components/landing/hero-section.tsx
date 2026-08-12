import Link from "next/link";
import { Button } from "@template/ui/primitives/button";
import { Badge } from "@template/ui/primitives/badge";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-5">
      {/* Subtle dot grid background */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="secondary" className="mb-6 font-normal">
          SEO + GEO + AEO, one tool
        </Badge>

        <h1 className="text-fluid-2xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-foreground mb-5">
          Get your app{" "}
          <span className="text-muted-foreground">cited by AI</span>
        </h1>

        <p className="text-fluid-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-2">
          geoaeo audits any site 0&ndash;100 for search, generative, and answer
          engines, then generates the files they need to find, quote, and use it:
          llms.txt, structured data, sitemaps, and more.
        </p>

        <p className="text-fluid-sm sm:text-base font-medium text-foreground/70 mb-8">
          Free and open source. One command to start.
        </p>

        <div className="mx-auto mb-8 max-w-md">
          <code className="block rounded-lg border border-border bg-muted px-4 py-3 text-sm font-mono">
            npm install geoaeo
          </code>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/docs">
              Read the docs
              <ArrowRight />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href="/tools">Try the free tools</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
