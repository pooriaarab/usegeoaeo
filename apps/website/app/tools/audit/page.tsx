import { pageAlternates, withAiSummary } from "@/utils/page-alternates";
import { ToolPageFrame } from "../tool-frame";
import { AuditClient } from "./audit-client";

export const metadata = withAiSummary({
  title: "Audit a site — free SEO, GEO & AEO score",
  description: "Score any live URL 0–100 for SEO, GEO, and AEO with the free geoaeo audit.",
  alternates: pageAlternates("/tools/audit"),
});

export default function AuditToolPage() {
  return (
    <ToolPageFrame>
      <h1 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
        Audit a site
      </h1>
      <AuditClient />
    </ToolPageFrame>
  );
}
