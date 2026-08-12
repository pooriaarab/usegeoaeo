"use client";
import { useEffect, useState } from "react";

export default function ThreadsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch('/api/v1/threads', { headers: {} })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((d: any) => setItems(d.items ?? d.users ?? d.uploads ?? []))
      .catch((e) => setError(String(e)));
  }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Threads</h1>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <ul className="divide-y border rounded-md">
        {items.map((it) => (
          <li key={it.id} className="px-3 py-2 text-sm">
            {it['title'] ?? it.id} <span className="text-muted-foreground">{it.id}</span>
          </li>
        ))}
        {items.length === 0 && !error && (
          <li className="px-3 py-4 text-sm text-muted-foreground">No rows yet.</li>
        )}
      </ul>
    </div>
  );
}
