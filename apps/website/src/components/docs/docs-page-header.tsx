import Link from "next/link";
import { Badge } from "@template/ui/primitives/badge";
import { Separator } from "@template/ui/primitives/separator";

type DocsPageHeaderProps = {
  /** Last breadcrumb crumb, e.g. "CLI". */
  crumb: string;
  /** Badge text above the title, e.g. "Bin: geoaeo". */
  badge: string;
  title: string;
  /** One-paragraph summary shown under the title. */
  intro: string;
};

/**
 * Breadcrumb, badge, title and intro for a page under /docs.
 *
 * The install, CLI and MCP pages each carried a copy of this markup that was
 * identical apart from the four values above.
 */
export function DocsPageHeader({ crumb, badge, title, intro }: DocsPageHeaderProps) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/docs" className="hover:text-foreground transition-colors">
          Docs
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{crumb}</span>
      </nav>

      <Badge variant="secondary" className="mb-3">
        {badge}
      </Badge>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">{intro}</p>

      <Separator className="my-8" />
    </>
  );
}
