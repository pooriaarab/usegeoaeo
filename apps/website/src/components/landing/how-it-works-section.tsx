import { Search, Wand2, Rocket } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Search,
    title: "Audit",
    description:
      "Run geoaeo audit on a live URL or local directory. Get a 0-100 score and a ranked list of missing SEO, GEO, and AEO signals.",
  },
  {
    num: "02",
    icon: Wand2,
    title: "Generate",
    description:
      "Run geoaeo gen to fill gaps. Output llms.txt, JSON-LD, sitemaps, robots.txt, WebMCP manifests, and Markdown mirrors from one config.",
  },
  {
    num: "03",
    icon: Rocket,
    title: "Gate and ship",
    description:
      "Add geoaeo audit --ci --min-score 90 to your pipeline. Block regressions and keep your site discoverable before PRs merge.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 px-5 scroll-mt-20">
      <div className="mx-auto max-w-6xl border-t border-border pt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground mb-10 sm:mb-12">
          02 / HOW IT WORKS
        </p>

        <div className="max-w-2xl mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-[-0.035em] leading-[0.98]">
            Audit, generate, ship
          </h2>
        </div>

        <div className="grid gap-px bg-border border border-border lg:grid-cols-3">
          {steps.map((step) => (
            <div key={step.num} className="bg-background p-5 sm:p-6">
              <p className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground mb-6">
                {step.num}
              </p>
              <div className="size-9 bg-muted flex items-center justify-center mb-4">
                <step.icon className="size-[18px] text-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-[1.5]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
