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
          Ship faster. Scale smarter.
        </Badge>

        <h1 className="text-fluid-2xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-foreground mb-5">
          The platform for{" "}
          <span className="text-muted-foreground">modern teams</span>
        </h1>

        <p className="text-fluid-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-2">
          Build, deploy, and manage your applications with a unified dashboard.
          Analytics, user management, and integrations — all in one place.
        </p>

        <p className="text-fluid-sm sm:text-base font-medium text-foreground/70 mb-8">
          Everything you need, nothing you don&apos;t.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/login">
              Get started free
              <ArrowRight />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <a href="#how-it-works">See how it works</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
