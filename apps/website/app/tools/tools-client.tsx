"use client";

import { useState } from "react";
import { Button } from "@template/ui/primitives/button";
import { auditUrl, genLlms, genJsonLd, type AuditResult } from "./actions";

const JSONLD_KINDS = [
  "software", "product", "faq", "breadcrumb", "organization",
  "website", "article", "howto", "person", "review",
] as const;

const field =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
const pre =
  "mt-4 max-h-96 overflow-auto rounded-md border border-border bg-muted p-4 text-xs whitespace-pre-wrap font-mono";

function Card({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">{hint}</p>
      {children}
    </section>
  );
}

export function ToolsClient() {
  const [url, setUrl] = useState("");
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [auditing, setAuditing] = useState(false);

  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [description, setDescription] = useState("");
  const [llms, setLlms] = useState("");
  const [kind, setKind] = useState<(typeof JSONLD_KINDS)[number]>("software");
  const [jsonld, setJsonld] = useState("");

  const cfg = { siteName, siteUrl, description };

  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-5 py-12">
      <Card title="Audit a site" hint="Score any live URL 0–100 for SEO, GEO, and AEO.">
        <div className="flex gap-2">
          <input
            className={field}
            placeholder="https://example.com"
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

      <Card title="Site facts" hint="Used by the generators below.">
        <div className="grid gap-3">
          <input className={field} placeholder="Site name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          <input className={field} placeholder="https://your-site.com" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} />
          <textarea className={field} rows={2} placeholder="One-line description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </Card>

      <Card title="Generate llms.txt" hint="A short site map for AI answer engines.">
        <Button onClick={async () => setLlms(await genLlms(cfg))}>Generate</Button>
        {llms && <pre className={pre}>{llms}</pre>}
      </Card>

      <Card title="Generate JSON-LD" hint="schema.org structured data.">
        <div className="flex gap-2">
          <select className={field} value={kind} onChange={(e) => setKind(e.target.value as (typeof JSONLD_KINDS)[number])}>
            {JSONLD_KINDS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <Button onClick={async () => setJsonld(await genJsonLd(cfg, kind))}>Generate</Button>
        </div>
        {jsonld && <pre className={pre}>{jsonld}</pre>}
      </Card>
    </div>
  );
}
