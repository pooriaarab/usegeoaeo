"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is GEO and AEO?",
    answer:
      "GEO is Generative Engine Optimization. AEO is Answer Engine Optimization. They ensure AI engines like ChatGPT, Claude, Perplexity, and Google AI can find, quote, and cite your site. geoaeo unifies SEO, GEO, and AEO into one audit and artifact workflow.",
  },
  {
    question: "What does geoaeo do?",
    answer:
      "geoaeo audits any site from 0 to 100 across 20 weighted checks, then generates missing discovery artifacts. It outputs llms.txt, llms-full.txt, sitemaps, robots.txt, JSON-LD schemas, WebMCP manifests, and Markdown mirrors. It also includes an AI copy humanizer and an MCP server.",
  },
  {
    question: "Does geoaeo work with my framework?",
    answer:
      "Yes. Run geoaeo init to scaffold artifacts into Next.js, Astro, SvelteKit, Nuxt, Remix, or static HTML. The audit inspects any live URL or local site directory.",
  },
  {
    question: "How do I use geoaeo with coding agents?",
    answer:
      "Run the MCP server with npx geoaeo-mcp over stdio. It exposes audit, gen, and humanize tools directly to Claude Code, Cursor, Windsurf, Codex, Gemini CLI, Copilot, and Continue.",
  },
  {
    question: "Is geoaeo free?",
    answer:
      "Yes. geoaeo is free and open source under the MIT license. There are no paid tiers, no user accounts, and no telemetry. Install it with npm install geoaeo.",
  },
  {
    question: "Can I gate CI builds on the audit score?",
    answer:
      "Yes. Run geoaeo audit <url|dir> --ci --min-score 90 in your pipeline. The command exits with a non-zero code when the score falls below your threshold, failing the build on regressions.",
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
