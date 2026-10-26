"use client";

import { useState } from "react";
import { Button } from "@template/ui/primitives/button";

export const field =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
export const pre =
  "mt-4 max-h-96 overflow-auto rounded-md border border-border bg-muted p-4 text-xs whitespace-pre-wrap font-mono";

export function ToolShell({
  title,
  hint,
  error,
  children,
}: {
  title: string;
  hint: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">{hint}</p>
      {children}
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </section>
  );
}

/** Site facts shared by the llms.json / jsonld generators. */
export function SiteFactsFields({
  value,
  onChange,
}: {
  value: { siteName: string; siteUrl: string; description: string };
  onChange: (patch: Partial<{ siteName: string; siteUrl: string; description: string }>) => void;
}) {
  return (
    <div className="grid gap-3">
      <input
        className={field}
        placeholder="Site name"
        aria-label="Site name"
        value={value.siteName}
        onChange={(e) => onChange({ siteName: e.target.value })}
      />
      <input
        className={field}
        placeholder="https://your-site.com"
        aria-label="Site URL"
        value={value.siteUrl}
        onChange={(e) => onChange({ siteUrl: e.target.value })}
      />
      <textarea
        className={field}
        rows={2}
        placeholder="One-line description"
        aria-label="One-line description"
        value={value.description}
        onChange={(e) => onChange({ description: e.target.value })}
      />
    </div>
  );
}

export const JSONLD_KINDS = [
  "software",
  "product",
  "faq",
  "breadcrumb",
  "organization",
  "website",
  "article",
  "howto",
  "person",
  "review",
] as const;

export type JsonLdKind = (typeof JSONLD_KINDS)[number];

export { Button };
