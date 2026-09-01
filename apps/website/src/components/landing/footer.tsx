import Link from "next/link";
import { LogoMark } from "../brand/logo";

const footerLinks = [
  { label: "Docs", href: "/docs" },
  { label: "Checklist", href: "/checklist" },
  { label: "Examples", href: "/examples" },
  { label: "Tools", href: "/tools" },
  { label: "Brand", href: "/brand" },
  { label: "GitHub", href: "https://github.com/pooriaarab/usegeoaeo" },
  { label: "npm", href: "https://www.npmjs.com/package/geoaeo" },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-8 px-5">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <LogoMark className="size-6" />
          <span className="text-sm text-muted-foreground">
            geoaeo &mdash; SEO, GEO &amp; AEO for any app
          </span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} geoaeo &middot; MIT
        </p>
      </div>
    </footer>
  );
}
