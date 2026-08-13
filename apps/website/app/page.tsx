import { LandingHeader } from "@/components/landing/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { IntegrationMarquee } from "@/components/landing/integration-marquee";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FAQSection } from "@/components/landing/faq-section";
import { Footer } from "@/components/landing/footer";
import { Button } from "@template/ui/primitives/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "geoaeo | Make any site quotable by AI answer engines",
  description:
    "geoaeo audits any site for SEO, GEO, and AEO, scores it 0 to 100, and generates llms.txt, sitemap, robots, JSON-LD, WebMCP, and Markdown mirrors. CLI, MCP server, and library. Free and open source under the MIT license.",
};

function CTAFooter() {
  return (
    <section className="py-16 sm:py-24 px-5">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-fluid-xl sm:text-3xl font-bold tracking-tight mb-3">
          Make your site answerable
        </h2>
        <p className="text-muted-foreground mb-6">
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
    </section>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main>
        <HeroSection />
        <IntegrationMarquee />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <FAQSection />
        <CTAFooter />
      </main>
      <Footer />
    </div>
  );
}
