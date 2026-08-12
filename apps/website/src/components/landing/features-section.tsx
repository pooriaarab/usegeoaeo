import {
  BarChart3,
  Shield,
  Zap,
  Users,
  Puzzle,
  Palette,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Built on Next.js with server components and edge functions. Every page loads instantly with zero configuration.",
  },
  {
    icon: Puzzle,
    title: "Powerful Integrations",
    description:
      "Connect to Slack, GitHub, Stripe, and dozens more. Pre-built connectors get you running in minutes.",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    description:
      "Role-based access control, API key management, and full audit logs. Enterprise-grade security out of the box.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Track usage, monitor performance, and understand your users with built-in dashboards and custom reports.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Invite your team, assign roles, and work together. Activity feeds and notifications keep everyone in sync.",
  },
  {
    icon: Palette,
    title: "Fully Customizable",
    description:
      "8 color themes, 6 font families, and a modular component system. Make it yours without fighting the framework.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-24 px-5 scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl mb-12 sm:mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-2 tracking-wide uppercase">
            Capabilities
          </p>
          <h2 className="text-fluid-xl sm:text-3xl font-bold tracking-tight mb-3">
            Everything you need to build and scale
          </h2>
          <p className="text-muted-foreground text-fluid-sm sm:text-base">
            From user management to analytics, integrations to security — a
            complete toolkit for modern SaaS applications.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-fade-in">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative p-5 sm:p-6 rounded-xl border border-border bg-card hover:border-foreground/10 transition-colors"
            >
              <div className="size-9 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-foreground/[0.06] transition-colors">
                <f.icon className="size-[18px] text-foreground" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
