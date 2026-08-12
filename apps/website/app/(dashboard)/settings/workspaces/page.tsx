"use client";

import { useEffect, useState } from "react";

type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  role: string;
};

export default function WorkspacesSettingsPage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceRow[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const res = await fetch("/api/v1/workspaces");
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    const data = (await res.json()) as { workspaces: WorkspaceRow[] };
    setWorkspaces(data.workspaces ?? []);
  }

  useEffect(() => {
    void reload();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/v1/workspaces", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    setName("");
    await reload();
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Workspaces</h1>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <form onSubmit={create} className="flex gap-2">
        <input
          className="border border-border rounded-md px-3 py-2 flex-1 text-sm"
          placeholder="New workspace name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="bg-primary text-primary-foreground rounded-md px-3 py-2 text-sm" type="submit">
          Create
        </button>
      </form>
      <ul className="divide-y border border-border rounded-md">
        {workspaces.map((w) => (
          <li key={w.id} className="px-3 py-2 text-sm flex justify-between">
            <span>
              {w.name} <span className="text-muted-foreground">({w.slug})</span>
            </span>
            <span className="text-muted-foreground">{w.role}</span>
          </li>
        ))}
        {workspaces.length === 0 && (
          <li className="px-3 py-4 text-sm text-muted-foreground">No workspaces yet.</li>
        )}
      </ul>
    </div>
  );
}
