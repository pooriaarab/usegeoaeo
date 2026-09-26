import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@template/ui/primitives/badge";
import { Separator } from "@template/ui/primitives/separator";
import { DocsBreadcrumb } from "@/components/docs/docs-breadcrumb";

type HarnessDocPageProps = {
  /** Route segment under /docs/harnesses, e.g. "claude-code". */
  slug: string;
  /** Display name of the harness, e.g. "Claude Code". */
  name: string;
  /** One-paragraph summary shown under the page title. */
  intro: ReactNode;
  /** The guide body, rendered inside the prose wrapper. */
  children: ReactNode;
};

/**
 * Shared chrome for every /docs/harnesses/* guide: breadcrumb, title block,
 * prose wrapper and footer links. The seven guides rendered a byte-identical
 * copy of this markup, so it lives here once and each page supplies only the
 * parts that differ.
 */
export function HarnessDocPage({ slug, name, intro, children }: HarnessDocPageProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <DocsBreadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Docs", href: "/docs" },
          { label: "Harnesses", href: `/docs/harnesses/${slug}` },
          { label: name },
        ]}
      />

      <Badge variant="secondary" className="mb-3">
        {`Harness: ${name}`}
      </Badge>
      <h1 className="text-3xl font-bold tracking-tight">{`geoaeo for ${name}`}</h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">{intro}</p>

      <Separator className="my-8" />

      <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tight prose-code:text-sm prose-pre:bg-muted prose-pre:border">
        {children}
      </div>

      <div className="mt-8 flex gap-3 text-sm">
        <Link href="/docs/mcp" className="text-primary hover:underline underline-offset-4">
          MCP overview &rarr;
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/docs/cli" className="text-primary hover:underline underline-offset-4">
          CLI reference &rarr;
        </Link>
      </div>
    </div>
  );
}
