"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is this template for?",
    answer:
      "This is a production-ready Next.js admin dashboard template. It includes authentication, user management, a full design system, data tables, settings pages, and more — everything you need to ship a SaaS product.",
  },
  {
    question: "What tech stack does it use?",
    answer:
      "Next.js on Cloudflare Workers via OpenNext, TypeScript, Tailwind CSS v4, shadcn/ui (@template/ui), Better Auth on D1 for sessions, Drizzle over Cloudflare D1, R2 for uploads, KV for flags/cache, Queues + Cron Workers for background work, Turnstile for bots, and bun as the package manager. Design tokens use OKLCh for precise theming.",
  },
  {
    question: "Can I customize the design?",
    answer:
      "Absolutely. The template ships with 8 color themes (Nord, Dracula, Catppuccin, GitHub, Solarized, Rose Pine, Tokyo Night) and 6 font families. All colors use semantic tokens, so switching themes is instant and consistent.",
  },
  {
    question: "Is it suitable for production use?",
    answer:
      "Yes. It includes middleware-based route protection, API key management, audit logging, role-based access control patterns, and comprehensive error handling. The architecture is designed to scale from prototype to production.",
  },
  {
    question: "How does the DataTable work?",
    answer:
      "The DataTable is built on TanStack Table with virtualization for large datasets, column sorting, filtering, resizing, reordering, row selection with bulk actions, persistent settings via localStorage, and a display popover for grouping and ordering.",
  },
  {
    question: "Can I use a different auth provider?",
    answer:
      "This template ships Better Auth with a D1 adapter (edge-native). The app obtains the session via Better Auth helpers rather than Firebase. You can still introduce another provider, but D1/Workers compatibility must be verified — that is the intentional Cloudflare baseline, not a leftover Firebase path.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-sm sm:text-base font-medium text-foreground group-hover:text-foreground/80 transition-colors">
          {question}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-sm text-muted-foreground leading-relaxed pr-8">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 sm:py-24 px-5 scroll-mt-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 sm:mb-12">
          <p className="text-sm font-medium text-muted-foreground mb-2 tracking-wide uppercase">
            FAQ
          </p>
          <h2 className="text-fluid-xl sm:text-3xl font-bold tracking-tight">
            Frequently asked questions
          </h2>
        </div>

        <div className="border-t border-border">
          {faqs.map((faq, i) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
