"use client";

import Link from "next/link";
import { LogoMark } from "../brand/logo";
import { Button } from "@template/ui/primitives/button";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Docs", href: "/docs" },
  { label: "Checklist", href: "/checklist" },
  { label: "Tools", href: "/tools" },
  { label: "FAQ", href: "/#faq" },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color] duration-300 ${
        scrolled
          ? "bg-background border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-5 h-14 sm:h-16">
        <HeaderLogo />
        <DesktopNav />
        <DesktopCta />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && <MobileNav onNavigate={() => setMobileOpen(false)} />}
    </header>
  );
}

function HeaderLogo() {
  return (
    <Link href="/" aria-label="geoaeo home" className="flex items-center gap-2.5 shrink-0">
      <LogoMark className="size-7" />
      <span className="text-base font-semibold tracking-tight font-mono">geoaeo</span>
    </Link>
  );
}

function DesktopNav() {
  return (
    <nav className="hidden md:flex items-center gap-1">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function DesktopCta() {
  return (
    <div className="hidden md:flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <a href="https://github.com/pooriaarab/usegeoaeo" target="_blank" rel="noreferrer">GitHub</a>
      </Button>
      <Button asChild size="sm">
        <Link href="/docs">
          Get started
          <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}

/**
 * The open mobile menu. The parent owns the open/closed state, so this stays a
 * plain component and takes the close callback as a prop.
 */
function MobileNav({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="md:hidden bg-background border-b border-border px-5 pb-4">
      <nav className="flex flex-col gap-1 mb-3">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Button asChild size="sm" className="w-full">
        <Link href="/docs">
          Get started
          <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
