"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What are GEO and AEO?",
    answer:
      "GEO is Generative Engine Optimization and AEO is Answer Engine Optimization. They are the practice of making your site easy for AI systems like ChatGPT, Claude, Perplexity, and Google AI to find, quote, and cite, the way SEO does for classic search. geoaeo covers all three: SEO, GEO, and AEO.",
  },
  {
    question: "What does geoaeo actually do?",
    answer:
      "It audits any site 0-100 across 20 weighted checks, then generates the files answer engines need: llms.txt, llms-full.txt, sitemaps, robots, JSON-LD structured data, a WebMCP manifest, and Markdown mirrors of your pages. It also humanizes copy and runs as an MCP server.",
  },
  {
    question: "Does it work with my framework?",
    answer:
      "Yes. geoaeo init scaffolds the right routes for Next.js, Astro, SvelteKit, Nuxt, and Remix, and writes static files for plain HTML sites. The audit works on a live URL or a local build directory, whatever you use.",
  },
  {
    question: "How do I use it with Claude, Cursor, or another agent?",
    answer:
      "geoaeo ships an MCP server (geoaeo-mcp) that exposes audit, gen, and humanize as tools. Point your agent at it and it can score and fix a site on demand. The docs have a setup page for each harness.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes. geoaeo is free and open source under the MIT license. Install it with npm install geoaeo. There is no account, no paywall, and no telemetry.",
  },
  {
    question: "Can I gate my CI on the score?",
    answer:
      "Yes. Run geoaeo audit --ci --min-score 85 in your pipeline and the command exits non-zero when the score drops below your threshold, so a regression fails the build.",
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
