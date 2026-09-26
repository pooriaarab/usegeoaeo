import { Badge } from "@template/ui/primitives/badge";
import { Separator } from "@template/ui/primitives/separator";
import { DocsBreadcrumb } from "@/components/docs/docs-breadcrumb";

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
      <DocsBreadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Docs", href: "/docs" },
          { label: crumb },
        ]}
      />

      <Badge variant="secondary" className="mb-3">
        {badge}
      </Badge>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-3 text-muted-foreground leading-relaxed">{intro}</p>

      <Separator className="my-8" />
    </>
  );
}
