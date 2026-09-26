"use client";

import { useState } from "react";
import { Button } from "@template/ui/primitives/button";
import { auditUrl, genLlms, genJsonLd, type AuditResult } from "./actions";

const JSONLD_KINDS = [
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

type JsonLdKind = (typeof JSONLD_KINDS)[number];

/** The site facts the generators below read. */
type SiteFacts = { siteName: string; siteUrl: string; description: string };

const field =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
const pre =
  "mt-4 max-h-96 overflow-auto rounded-md border border-border bg-muted p-4 text-xs whitespace-pre-wrap font-mono";

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">{hint}</p>
      {children}
    </section>
  );
}

export function ToolsClient() {
  // Only the site facts are shared; each card below owns its own state.
  const [cfg, setCfg] = useState<SiteFacts>({ siteName: "", siteUrl: "", description: "" });

  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-5 py-12">
      <AuditCard />
      <SiteFactsCard cfg={cfg} onChange={(patch) => setCfg((prev) => ({ ...prev, ...patch }))} />
      <LlmsCard cfg={cfg} />
      <JsonLdCard cfg={cfg} />
    </div>
  );
}

function AuditCard() {
  const [url, setUrl] = useState("");
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [auditing, setAuditing] = useState(false);

  return (
    <Card title="Audit a site" hint="Score any live URL 0–100 for SEO, GEO, and AEO.">
      <div className="flex gap-2">
        <input
          className={field}
          placeholder="https://example.com"
          aria-label="Live site URL to audit"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button
          disabled={auditing || !url}
          onClick={async () => {
            setAuditing(true);
            setAudit(await auditUrl(url));
            setAuditing(false);
          }}
        >
          {auditing ? "Auditing…" : "Audit"}
        </Button>
      </div>
      {audit && !audit.ok && <p className="mt-3 text-sm text-destructive">{audit.error}</p>}
      {audit?.ok && (
        <>
          <p className="mt-4 text-3xl font-bold">{audit.score}/100</p>
          <pre className={pre}>{audit.report}</pre>
        </>
      )}
    </Card>
  );
}

function SiteFactsCard({
  cfg,
  onChange,
}: {
  cfg: SiteFacts;
  onChange: (patch: Partial<SiteFacts>) => void;
}) {
  return (
    <Card title="Site facts" hint="Used by the generators below.">
      <div className="grid gap-3">
        <input
          className={field}
          placeholder="Site name"
          aria-label="Site name"
          value={cfg.siteName}
          onChange={(e) => onChange({ siteName: e.target.value })}
        />
        <input
          className={field}
          placeholder="https://your-site.com"
          aria-label="Site URL"
          value={cfg.siteUrl}
          onChange={(e) => onChange({ siteUrl: e.target.value })}
        />
        <textarea
          className={field}
          rows={2}
          placeholder="One-line description"
          aria-label="One-line description"
          value={cfg.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>
    </Card>
  );
}

function LlmsCard({ cfg }: { cfg: SiteFacts }) {
  const [llms, setLlms] = useState("");

  return (
    <Card title="Generate llms.txt" hint="A short site map for AI answer engines.">
      <Button onClick={async () => setLlms(await genLlms(cfg))}>Generate</Button>
      {llms && <pre className={pre}>{llms}</pre>}
    </Card>
  );
}

function JsonLdCard({ cfg }: { cfg: SiteFacts }) {
  const [kind, setKind] = useState<JsonLdKind>("software");
  const [jsonld, setJsonld] = useState("");

  return (
    <Card title="Generate JSON-LD" hint="schema.org structured data.">
      <div className="flex gap-2">
        <select
          className={field}
          aria-label="JSON-LD kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as JsonLdKind)}
        >
          {JSONLD_KINDS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <Button onClick={async () => setJsonld(await genJsonLd(cfg, kind))}>Generate</Button>
      </div>
      {jsonld && <pre className={pre}>{jsonld}</pre>}
    </Card>
  );
}
