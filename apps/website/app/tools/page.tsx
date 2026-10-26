import Link from "next/link";
import { pageAlternates, withAiSummary } from "@/utils/page-alternates";
import { ToolPageFrame } from "./tool-frame";

export const metadata = withAiSummary({
  title: "Free GEO & AEO tools — audit, llms.txt, JSON-LD",
  description:
    "Audit any site 0-100 for SEO, GEO, and AEO, and generate llms.txt and JSON-LD structured data. Free, powered by the open-source geoaeo package.",
  alternates: pageAlternates("/tools"),
});

const TOOLS = [
  {
    href: "/tools/audit",
    title: "Audit a site",
    blurb:
      "Score any live URL 0–100 for SEO, GEO, and AEO. Listed as a free tool; the live audit runs in the Node CLI.",
  },
  {
    href: "/tools/llms",
    title: "Generate llms.txt",
    blurb: "A short site map for AI answer engines, built from your site facts.",
  },
  {
    href: "/tools/jsonld",
    title: "Generate JSON-LD",
    blurb: "schema.org structured data: software, product, faq, organization and more.",
  },
];

export default function ToolsPage() {
  return (
    <ToolPageFrame>
      <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
        Free GEO &amp; AEO tools
      </h1>
      <p className="mt-3 mb-8 text-center text-muted-foreground">
        Powered by the open-source <code className="font-mono">geoaeo</code> package.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-muted-foreground/40"
          >
            <h2 className="text-lg font-semibold tracking-tight">{tool.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{tool.blurb}</p>
          </Link>
        ))}
      </div>
      <p className="mt-10 text-center text-sm text-muted-foreground">
        The same capabilities ship as an npm package:{" "}
        <code className="font-mono">npm install geoaeo</code>.
      </p>
    </ToolPageFrame>
  );
}
