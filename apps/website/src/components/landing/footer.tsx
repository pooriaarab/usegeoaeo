import Link from "next/link";

const footerLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Docs", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-8 px-5">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="size-6 rounded-md bg-foreground flex items-center justify-center">
            <span className="text-background text-xs font-bold leading-none">
              A
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            Acme &mdash; Modern SaaS Platform
          </span>
        </div>
        <nav className="hidden sm:flex items-center gap-4">
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
          &copy; {new Date().getFullYear()} Acme Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
