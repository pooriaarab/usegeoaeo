import { LandingHeader } from "@/components/landing/landing-header";
import { Footer } from "@/components/landing/footer";

/** Common chrome for the /tools pages: header, constrained main, footer. */
export function ToolPageFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingHeader />
      <main className="mx-auto max-w-3xl px-5 pt-16">{children}</main>
      <Footer />
    </>
  );
}
