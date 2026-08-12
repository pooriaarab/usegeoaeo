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
  title: "Cloudflare Master Template — The platform for modern teams",
  description:
    "Build, deploy, and manage your applications with a unified Cloudflare-native full-stack template: OpenNext, D1, Better Auth, and more.",
};

function CTAFooter() {
  return (
    <section className="py-16 sm:py-24 px-5">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-fluid-xl sm:text-3xl font-bold tracking-tight mb-3">
          Ready to get started?
        </h2>
        <p className="text-muted-foreground mb-6">
          Start for free. Upgrade when you need to.
        </p>
        <Button asChild size="lg">
          <Link href="/login">
            Get started free
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
