import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { IntegrationMarquee } from "@/components/landing/integration-marquee";
import { ProblemSection } from "@/components/landing/problem-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { ProofSection } from "@/components/landing/proof-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FAQSection } from "@/components/landing/faq-section";
import { Footer } from "@/components/landing/footer";
import { Button } from "@template/ui/primitives/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { pageAlternates } from "@/utils/page-alternates";

export const metadata = {
  title: "geoaeo | Make any site quotable by AI answer engines",
  description:
    "geoaeo audits any site for SEO, GEO, and AEO, scores it 0 to 100, and generates llms.txt, sitemap, robots, JSON-LD, WebMCP, and Markdown mirrors. CLI, MCP server, and library. Free and open source under the MIT license.",
  alternates: pageAlternates("/"),
};

/**
 * The visible twelve-column grid. One fixed, non-interactive layer for the
 * whole page, at z-index 0, so the hairlines read through the empty space of
 * every section while the type above them stays on z-index 1.
 */
function SwissGridOverlay() {
  return (
    <div aria-hidden="true" className="swiss-grid-overlay">
      <div className="swiss-grid-overlay__inner">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="swiss-grid-cell" />
        ))}
      </div>
    </div>
  );
}

function CTAFooter() {
  return (
    <section className="relative z-[1] py-16 sm:py-24 px-5">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground mb-6">
          09 / Get started
        </p>
        <div className="max-w-2xl">
          <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.03em] leading-[1.05] mb-4">
            Make your site answerable
          </h2>
          <p className="text-muted-foreground mb-8">
            Install geoaeo and audit your first site in a minute. Free and open
            source under the MIT license.
          </p>
          <Button asChild size="lg">
            <Link href="/docs">
              Get started
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <SwissGridOverlay />
      <LandingHeader />
      <main>
        <HeroSection />
        <IntegrationMarquee />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ProofSection />
        <PricingSection />
        <FAQSection />
        <CTAFooter />
      </main>
      <Footer />
    </div>
  );
}
