"use client";

import { useState } from "react";
import { genJsonLd, type SiteFactsInput } from "../actions";
import {
  ToolShell,
  SiteFactsFields,
  JSONLD_KINDS,
  pre,
  field,
  Button,
  type JsonLdKind,
} from "../tools-ui";

export function JsonLdClient() {
  const [cfg, setCfg] = useState<SiteFactsInput>({ siteName: "", siteUrl: "", description: "" });
  const [kind, setKind] = useState<JsonLdKind>("software");
  const [jsonld, setJsonld] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await genJsonLd(cfg, kind);
      if (!result.ok) setError(result.error ?? "Could not generate JSON-LD.");
      else setJsonld(result.data ?? "");
    } catch {
      setError("Could not generate JSON-LD.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      title="Generate JSON-LD"
      hint="schema.org structured data, built from your site facts."
      error={error}
    >
      <SiteFactsFields value={cfg} onChange={(patch) => setCfg((p) => ({ ...p, ...patch }))} />
      <div className="mt-4 flex gap-2">
        <select
          className={field}
          aria-label="JSON-LD kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as JsonLdKind)}
        >
          {JSONLD_KINDS.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
        <Button disabled={busy} onClick={() => void run()}>
          {busy ? "Generating…" : "Generate"}
        </Button>
      </div>
      {jsonld && <pre className={pre}>{jsonld}</pre>}
    </ToolShell>
  );
}
