import { LandingHeader } from "@/components/landing/landing-header";

/**
 * Site header plus the same below-header spacing as /checklist.
 * Every /docs page inherits this so the header is not pasted per route.
 */
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main className="pt-28 sm:pt-32 pb-16 sm:pb-24 px-5">{children}</main>
    </div>
  );
}
