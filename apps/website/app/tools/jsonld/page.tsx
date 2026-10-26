import { pageAlternates, withAiSummary } from "@/utils/page-alternates";
import { ToolPageFrame } from "../tool-frame";
import { JsonLdClient } from "./jsonld-client";

export const metadata = withAiSummary({
  title: "Generate JSON-LD — free schema.org tool",
  description:
    "Generate schema.org JSON-LD structured data: software, product, faq, breadcrumb, organization, website, article, howto, person, and review.",
  alternates: pageAlternates("/tools/jsonld"),
});

export default function JsonLdToolPage() {
  return (
    <ToolPageFrame>
      <h1 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
        Generate JSON-LD
      </h1>
      <JsonLdClient />
    </ToolPageFrame>
  );
}
