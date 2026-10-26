"use client";

import { useState } from "react";
import { auditUrl, type AuditResult } from "../actions";
import { ToolShell, field, pre, Button } from "../tools-ui";

export function AuditClient() {
  const [url, setUrl] = useState("");
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");
  const [auditing, setAuditing] = useState(false);

  const run = async () => {
    setAuditing(true);
    setError("");
    setAudit(null);
    try {
      const result = await auditUrl(url);
      if (!result.ok) setError(result.error ?? "Audit failed.");
      else if (result.data) setAudit(result.data);
    } catch {
      setError("Audit failed unexpectedly. Try again, or run `npx geoaeo audit <url>` locally.");
    } finally {
      setAuditing(false);
    }
  };

  return (
    <ToolShell
      title="Audit a site"
      hint="Score any live URL 0–100 for SEO, GEO, and AEO."
      error={error}
    >
      <div className="flex gap-2">
        <input
          className={field}
          placeholder="https://example.com"
          aria-label="Live site URL to audit"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !auditing && url && void run()}
        />
        <Button disabled={auditing || !url} onClick={() => void run()}>
          {auditing ? "Auditing…" : "Audit"}
        </Button>
      </div>
      {audit && (
        <>
          <p className="mt-4 text-3xl font-bold">{audit.score}/100</p>
          <pre className={pre}>{audit.report}</pre>
        </>
      )}
    </ToolShell>
  );
}
