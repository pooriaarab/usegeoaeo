import Link from "next/link";
import { Button } from "@template/ui/primitives/button";
import { Check } from "lucide-react";
import { cn } from "@template/ui/utils";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "For individuals and small projects",
    features: [
      "Up to 3 team members",
      "1,000 API requests/month",
      "Basic analytics",
      "Community support",
      "1 integration",
    ],
    cta: "Get started",
    featured: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing teams that need more power",
    features: [
      "Unlimited team members",
      "100,000 API requests/month",
      "Advanced analytics & reports",
      "Priority support",
      "Unlimited integrations",
      "Custom themes",
      "Audit logs",
      "API key management",
    ],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations with advanced needs",
    features: [
      "Everything in Pro",
      "Unlimited API requests",
      "SSO & SAML",
      "Dedicated support",
      "Custom SLAs",
      "On-premise deployment",
      "Advanced security controls",
    ],
    cta: "Contact sales",
    featured: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 sm:py-24 px-5 scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
          <p className="text-sm font-medium text-muted-foreground mb-2 tracking-wide uppercase">
            Pricing
          </p>
          <h2 className="text-fluid-xl sm:text-3xl font-bold tracking-tight mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground text-fluid-sm sm:text-base">
            Start free, upgrade when you need to. No hidden fees.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-xl border p-6 sm:p-8 flex flex-col",
                plan.featured
                  ? "border-primary bg-card shadow-keystone"
                  : "border-border bg-card",
              )}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Most popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="size-4 text-success shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={plan.featured ? "default" : "outline"}
                className="w-full"
              >
                <Link href="/login">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
