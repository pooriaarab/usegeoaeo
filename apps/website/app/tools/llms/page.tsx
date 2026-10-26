import { pageAlternates, withAiSummary } from "@/utils/page-alternates";
import { ToolPageFrame } from "../tool-frame";
import { LlmsClient } from "./llms-client";

export const metadata = withAiSummary({
  title: "Generate llms.txt — free AI site map tool",
  description:
    "Generate an llms.txt site map for AI answer engines from your site name, URL, and description.",
  alternates: pageAlternates("/tools/llms"),
});

export default function LlmsToolPage() {
  return (
    <ToolPageFrame>
      <h1 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
        Generate llms.txt
      </h1>
      <LlmsClient />
    </ToolPageFrame>
  );
}
