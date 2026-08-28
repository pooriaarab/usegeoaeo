import type { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@template/ui/primitives/breadcrumb";
import { HowToUseSection, CrawlabilitySection, SemanticHtmlSection, StructuredDataSection, LlmsTxtSection } from "./sections-foundations";
import { MarkdownMirrorsSection, WebmcpSection, AnswerabilitySection, CitabilitySection, SitemapRobotsSection, OpenGraphSection, I18nSection, ProseSection } from "./sections-surfaces";
import { AuditScoreMapSection, FixLoopSection, NonGoalsSection } from "./sections-audit";
import { LandingHeader } from "@/components/landing/landing-header";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "GEO/AEO checklist — geoaeo",
  description:
    "Canonical GEO/AEO checklist for making an app discoverable and quotable by AI answer engines. geoaeo audit maps to the items marked Covered.",
};

const toc = [
  { href: "#how-to-use", label: "How to use" },
  { href: "#crawlability", label: "1. Crawlability" },
  { href: "#semantic-html", label: "2. Semantic HTML" },
  { href: "#structured-data", label: "3. Structured data" },
  { href: "#llms-txt", label: "4. llms.txt" },
  { href: "#markdown-mirrors", label: "5. Markdown mirrors" },
  { href: "#webmcp", label: "6. WebMCP" },
  { href: "#answerability", label: "7. Answerability" },
  { href: "#citability", label: "8. Citability" },
  { href: "#sitemap-robots", label: "9. Sitemap and robots" },
  { href: "#open-graph", label: "10. Open Graph" },
  { href: "#i18n", label: "11. Internationalization" },
  { href: "#prose", label: "12. Prose quality" },
  { href: "#audit-score-map", label: "Audit score map" },
  { href: "#fix-loop", label: "Recommended fix loop" },
  { href: "#non-goals", label: "Non-goals" },
];

export default function ChecklistPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main className="pt-28 sm:pt-32 pb-16 sm:pb-24 px-5">
        <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
          <TableOfContents />

          <article className="min-w-0">
            <ChecklistBreadcrumb />

            <PageHeader />

            <HowToUseSection />

            <CrawlabilitySection />

            <SemanticHtmlSection />

            <StructuredDataSection />

            <LlmsTxtSection />

            <MarkdownMirrorsSection />

            <WebmcpSection />

            <AnswerabilitySection />

            <CitabilitySection />

            <SitemapRobotsSection />

            <OpenGraphSection />

            <I18nSection />

            <ProseSection />

            <AuditScoreMapSection />

            <FixLoopSection />

            <NonGoalsSection />
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/** Sticky in-page nav, desktop only. */
function TableOfContents() {
  return (
    <aside className="hidden lg:block">
      <nav className="sticky top-24 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
          On this page
        </p>
        {toc.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="block text-sm text-muted-foreground hover:text-foreground py-1 transition-colors"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

/** Home / Checklist. */
function ChecklistBreadcrumb() {
  return (
    <Breadcrumb className="mb-8">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Checklist</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/** Title and what the checklist is for. */
function PageHeader() {
  return (
    <header className="max-w-2xl mb-10 sm:mb-14">
      <p className="text-sm font-medium text-muted-foreground mb-2 tracking-wide uppercase">
        GEO / AEO
      </p>
      <h1 className="text-fluid-xl sm:text-4xl font-bold tracking-tight mb-4">
        GEO/AEO checklist
      </h1>
      <p className="text-muted-foreground text-fluid-sm sm:text-base leading-relaxed">
        Canonical checklist for making an app discoverable and quotable
        by AI answer engines and agents. Use it as the target state for
        any site.{" "}
        <code className="font-mono text-sm text-foreground">geoaeo audit</code>{" "}
        maps to the items marked Covered. Items marked Not covered yet
        are product gaps, not implicit features.
      </p>
    </header>
  );
}
