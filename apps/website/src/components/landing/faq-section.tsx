"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqs } from "./faq-data";

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
          <p className="pb-5 text-sm text-muted-foreground leading-relaxed pr-8">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 sm:py-24 px-5 scroll-mt-20">
      <div className="mx-auto max-w-6xl border-t border-border pt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground mb-10 sm:mb-12">
          04 / FAQ
        </p>
        <div className="mb-10 sm:mb-12 max-w-2xl">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-[-0.035em] leading-[0.98]">
            Frequently asked questions
          </h2>
        </div>

        <div className="border-t border-border max-w-3xl">
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
