"use client";

import { useState } from "react";
import { genLlms, type SiteFactsInput } from "../actions";
import { ToolShell, SiteFactsFields, pre, Button } from "../tools-ui";

export function LlmsClient() {
  const [cfg, setCfg] = useState<SiteFactsInput>({ siteName: "", siteUrl: "", description: "" });
  const [llms, setLlms] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await genLlms(cfg);
      if (!result.ok) setError(result.error ?? "Could not generate llms.txt.");
      else setLlms(result.data ?? "");
    } catch {
      setError("Could not generate llms.txt.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolShell
      title="Generate llms.txt"
      hint="A short site map for AI answer engines, built from your site facts."
      error={error}
    >
      <SiteFactsFields
        value={cfg}
        onChange={(patch) => setCfg((prev) => ({ ...prev, ...patch }))}
      />
      <div className="mt-4">
        <Button disabled={busy} onClick={() => void run()}>
          {busy ? "Generating…" : "Generate"}
        </Button>
      </div>
      {llms && <pre className={pre}>{llms}</pre>}
    </ToolShell>
  );
}
