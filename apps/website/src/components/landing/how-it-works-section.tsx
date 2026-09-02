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
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl mb-12 sm:mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-2 tracking-wide uppercase">
            How it works
          </p>
          <h2 className="text-fluid-xl sm:text-3xl font-bold tracking-tight mb-3">
            Audit, generate, ship
          </h2>
        </div>

        <div className="grid gap-8 sm:gap-6 lg:grid-cols-3">
          {steps.map((step) => (
            <div key={step.num} className="relative">
              <span className="text-[64px] sm:text-[80px] font-bold leading-none text-foreground/[0.04] absolute -top-2 -left-1 select-none pointer-events-none">
                {step.num}
              </span>
              <div className="relative pt-12 sm:pt-14">
                <div className="size-9 rounded-lg bg-muted flex items-center justify-center mb-4">
                  <step.icon className="size-[18px] text-foreground" />
                </div>
                <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
