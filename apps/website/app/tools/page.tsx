import { LandingHeader } from "@/components/landing/landing-header";
import { Footer } from "@/components/landing/footer";
import { ToolsClient } from "./tools-client";

export const metadata = {
  title: "Free GEO & AEO tools — audit, llms.txt, JSON-LD",
  description:
    "Audit any site 0-100 for SEO, GEO, and AEO, and generate llms.txt and JSON-LD structured data. Free, powered by the open-source geoaeo package.",
};

export default function ToolsPage() {
  return (
    <>
      <LandingHeader />
      <main>
        <div className="mx-auto max-w-3xl px-5 pt-16 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Free GEO &amp; AEO tools</h1>
          <p className="mt-3 text-muted-foreground">
            Powered by the open-source <code className="font-mono">geoaeo</code> package.
          </p>
        </div>
        <ToolsClient />
      </main>
      <Footer />
    </>
  );
}
