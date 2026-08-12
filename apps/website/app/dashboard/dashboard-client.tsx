"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

interface Upload {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  status: "pending" | "ready" | "failed";
  createdAt: string;
}

interface Flag {
  name: string;
  value: any;
}

interface DashboardClientProps {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
  };
}

export default function DashboardClient({ user }: DashboardClientProps) {
  // Notes State
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  // Uploads State
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // Jobs State
  const [jobText, setJobText] = useState("Demo message from dashboard");
  const [isEnqueuing, setIsEnqueuing] = useState(false);
  const [lastJobResult, setJobResult] = useState<any | null>(null);

  // Flags State
  const [flags, setFlags] = useState<Flag[]>([]);
  const [isTogglingFlag, setIsTogglingFlag] = useState<string | null>(null);

  // Global Loading
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setIsLoading(true);
    try {
      const [notesRes, uploadsRes, flagsRes] = (await Promise.all([
        fetch("/api/v1/notes").then((r) => r.json()),
        fetch("/api/v1/uploads").then((r) => r.json()),
        fetch("/api/v1/flags").then((r) => r.json()),
      ])) as [any, any, any];

      if (notesRes.notes) setNotes(notesRes.notes);
      if (uploadsRes.uploads) setUploads(uploadsRes.uploads);
      if (flagsRes.flags) setFlags(flagsRes.flags);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // Notes CRUD handlers
  async function handleCreateNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteTitle || !noteBody) return;

    setIsCreatingNote(true);
    try {
      const res = await fetch("/api/v1/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: noteTitle, body: noteBody }),
      });
      const data = (await res.json()) as any;
      if (data.note) {
        setNotes((prev) => [data.note, ...prev]);
        setNoteTitle("");
        setNoteBody("");
      }
    } catch (err) {
      console.error("Failed to create note", err);
    } finally {
      setIsCreatingNote(false);
    }
  }

  async function handleDeleteNote(id: string) {
    try {
      await fetch(`/api/v1/notes?id=${id}`, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete note", err);
    }
  }

  // R2 Upload handlers
  async function handleUploadFile(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress("Registering upload in database...");

    try {
      // 1. POST /api/v1/uploads to create a pending record
      const regRes = await fetch("/api/v1/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedFile.name,
          contentType: selectedFile.type,
          sizeBytes: selectedFile.size,
        }),
      });

      const regData = (await regRes.json()) as any;
      if (regData.error) {
        throw new Error(regData.error);
      }

      const { uploadId, putUrl } = regData;

      // 2. Stream the body to R2 via PUT PUT_URL
      setUploadProgress("Streaming content to R2 storage...");
      const streamRes = await fetch(putUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type,
        },
        body: selectedFile,
      });

      if (!streamRes.ok) {
        const errText = await streamRes.text();
        throw new Error(`R2 PUT failed: ${errText}`);
      }

      // 3. POST /api/v1/uploads/[id]/complete to finalise the upload
      setUploadProgress("Verifying upload with head metadata...");
      const compRes = await fetch(`/api/v1/uploads/${uploadId}/complete`, {
        method: "POST",
      });

      const compData = (await compRes.json()) as any;
      if (compData.error) {
        throw new Error(compData.error);
      }

      setUploadProgress("Upload successful!");
      setSelectedFile(null);
      // Reset input element
      const fileInput = document.getElementById("file-uploader") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Refresh uploads list
      setUploads((prev) => [compData.upload, ...prev]);
    } catch (err: any) {
      console.error("File upload failed:", err);
      setUploadProgress(`Error: ${err.message || err}`);
    } finally {
      setIsUploading(false);
    }
  }

  // Queue Job handlers
  async function handleEnqueueJob(e: React.FormEvent) {
    e.preventDefault();
    setIsEnqueuing(true);
    setJobResult(null);

    try {
      const res = await fetch("/api/v1/jobs/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: jobText }),
      });
      const data = (await res.json()) as any;
      setJobResult(data);
    } catch (err) {
      console.error("Job enqueue failed:", err);
      setJobResult({ error: "Failed to connect to jobs API" });
    } finally {
      setIsEnqueuing(false);
    }
  }

  // Feature Flag handlers
  async function handleToggleFlag(name: string, currentValue: any) {
    setIsTogglingFlag(name);
    const newValue = !currentValue;

    try {
      const res = await fetch("/api/v1/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, value: newValue }),
      });
      const data = (await res.json()) as any;
      if (data.ok) {
        setFlags((prev) =>
          prev.map((f) => (f.name === name ? { ...f, value: newValue } : f))
        );
      }
    } catch (err) {
      console.error("Failed to toggle flag:", err);
    } finally {
      setIsTogglingFlag(null);
    }
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  return (
    <div className="wrap" style={{ paddingBottom: "100px" }}>
      <div className="row" style={{ justifyContent: "space-between", margin: "20px 0" }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <span className="muted">Logged in as: <strong>{user.email}</strong></span>
        </div>
        <Link className="btn secondary" href="/">Home</Link>
      </div>

      {isLoading ? (
        <div className="card" style={{ textAlign: "center" }}>
          <p>Loading template capabilities...</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {/* Notes Card */}
          <div className="card">
            <h2 style={{ borderBottom: "2px solid var(--ink)", paddingBottom: "8px", marginTop: 0 }}>
              1. Relational Database (D1 + Drizzle)
            </h2>
            <p className="muted" style={{ marginBottom: "16px" }}>
              Submit data that persists securely in your Cloudflare D1 SQL database behind user authentication.
            </p>

            <form onSubmit={handleCreateNote} style={{ marginBottom: "20px" }}>
              <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "1fr 2fr auto", alignItems: "start" }}>
                <input
                  type="text"
                  placeholder="Note title"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  style={{ marginBottom: 0 }}
                  required
                />
                <input
                  type="text"
                  placeholder="Note body details..."
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  style={{ marginBottom: 0 }}
                  required
                />
                <button className="btn" style={{ padding: "8px 16px" }} type="submit" disabled={isCreatingNote}>
                  {isCreatingNote ? "Saving..." : "Add Note"}
                </button>
              </div>
            </form>

            {notes.length === 0 ? (
              <p className="muted" style={{ textAlign: "center", padding: "20px 0" }}>No notes in the database yet.</p>
            ) : (
              <div style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid var(--line)", borderRadius: "8px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ background: "#f0ebe0", textAlign: "left" }}>
                      <th style={{ padding: "10px", borderBottom: "2px solid var(--ink)" }}>Title</th>
                      <th style={{ padding: "10px", borderBottom: "2px solid var(--ink)" }}>Body</th>
                      <th style={{ padding: "10px", borderBottom: "2px solid var(--ink)", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.map((note) => (
                      <tr key={note.id} style={{ borderBottom: "1px solid var(--line)" }}>
                        <td style={{ padding: "10px", fontWeight: "bold" }}>{note.title}</td>
                        <td style={{ padding: "10px", color: "var(--muted)" }}>{note.body}</td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            style={{
                              background: "#ff4a4a",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              padding: "4px 8px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* R2 Storage Card */}
          <div className="card">
            <h2 style={{ borderBottom: "2px solid var(--ink)", paddingBottom: "8px", marginTop: 0 }}>
              2. Object Storage (R2 Bucket)
            </h2>
            <p className="muted" style={{ marginBottom: "16px" }}>
              Upload files to Cloudflare R2 bucket. Next.js handles streams directly to the Workers Assets backend storage without needing bulky Node.js libraries.
            </p>

            <form onSubmit={handleUploadFile} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "15px" }}>
              <input
                id="file-uploader"
                type="file"
                accept="image/*,application/pdf,text/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                style={{ flex: 1, padding: "6px", marginBottom: 0 }}
                required
              />
              <button className="btn" type="submit" disabled={isUploading || !selectedFile}>
                {isUploading ? "Uploading..." : "Upload File"}
              </button>
            </form>

            {uploadProgress && (
              <div
                style={{
                  fontSize: "13px",
                  padding: "8px",
                  background: "#eaf9e6",
                  border: "1px solid #cce8be",
                  borderRadius: "6px",
                  marginBottom: "15px",
                }}
              >
                ℹ️ {uploadProgress}
              </div>
            )}

            {uploads.length === 0 ? (
              <p className="muted" style={{ textAlign: "center", padding: "20px 0" }}>No uploads registered yet.</p>
            ) : (
              <div style={{ maxHeight: "250px", overflowY: "auto", border: "1px solid var(--line)", borderRadius: "8px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ background: "#f0ebe0", textAlign: "left" }}>
                      <th style={{ padding: "10px", borderBottom: "2px solid var(--ink)" }}>Filename</th>
                      <th style={{ padding: "10px", borderBottom: "2px solid var(--ink)" }}>Type</th>
                      <th style={{ padding: "10px", borderBottom: "2px solid var(--ink)" }}>Size</th>
                      <th style={{ padding: "10px", borderBottom: "2px solid var(--ink)", textAlign: "right" }}>Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploads.map((upl) => (
                      <tr key={upl.id} style={{ borderBottom: "1px solid var(--line)" }}>
                        <td style={{ padding: "10px" }}>{upl.filename}</td>
                        <td style={{ padding: "10px" }} className="muted">{upl.contentType}</td>
                        <td style={{ padding: "10px" }} className="muted">{formatBytes(upl.sizeBytes)}</td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          {upl.status === "ready" ? (
                            <a
                              href={`/api/v1/uploads/${upl.id}/content`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: "inline-block",
                                background: "#4caf50",
                                color: "white",
                                textDecoration: "none",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            >
                              Download
                            </a>
                          ) : (
                            <span style={{ fontSize: "12px", color: "orange", fontWeight: "bold" }}>Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Queues & Background Workers */}
          <div className="card">
            <h2 style={{ borderBottom: "2px solid var(--ink)", paddingBottom: "8px", marginTop: 0 }}>
              3. Async Jobs (Cloudflare Queues)
            </h2>
            <p className="muted" style={{ marginBottom: "16px" }}>
              Enqueue async background jobs to Cloudflare Queues with idempotency keys. A separate lightweight Queue Consumer Worker will receive, verify, and process the payload.
            </p>

            <form onSubmit={handleEnqueueJob} style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <input
                type="text"
                placeholder="Async job text..."
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                style={{ flex: 1, marginBottom: 0 }}
                required
              />
              <button className="btn" type="submit" disabled={isEnqueuing}>
                {isEnqueuing ? "Enqueuing..." : "Enqueue Job"}
              </button>
            </form>

            {lastJobResult && (
              <pre
                style={{
                  fontSize: "12px",
                  padding: "10px",
                  background: "#f0ebe0",
                  border: "1px solid var(--line)",
                  borderRadius: "6px",
                  overflowX: "auto",
                }}
              >
                {JSON.stringify(lastJobResult, null, 2)}
              </pre>
            )}
          </div>

          {/* Feature Flags (KV) */}
          <div className="card">
            <h2 style={{ borderBottom: "2px solid var(--ink)", paddingBottom: "8px", marginTop: 0 }}>
              4. Feature Flags (Cloudflare KV Store)
            </h2>
            <p className="muted" style={{ marginBottom: "16px" }}>
              Store, retrieve, and toggle global features inside Cloudflare KV. State updates are highly performant and accessible globally in milliseconds.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {flags.map((flag) => (
                <div
                  key={flag.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 15px",
                    background: "#fdfdfd",
                    border: "1px solid var(--line)",
                    borderRadius: "8px",
                  }}
                >
                  <div>
                    <span style={{ fontFamily: "monospace", fontWeight: "bold" }}>flag:{flag.name}</span>
                    <span style={{ marginLeft: "10px" }} className="muted">
                      ({typeof flag.value})
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        background: flag.value ? "#eaf9e6" : "#fbf0f0",
                        color: flag.value ? "#2e7d32" : "#c62828",
                      }}
                    >
                      {flag.value ? "ENABLED" : "DISABLED"}
                    </span>
                    <button
                      onClick={() => handleToggleFlag(flag.name, flag.value)}
                      disabled={isTogglingFlag === flag.name}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        font: "inherit",
                        fontSize: "12px",
                        fontWeight: "bold",
                        background: "var(--ink)",
                        color: "var(--bg)",
                        border: "none",
                      }}
                    >
                      {isTogglingFlag === flag.name ? "Updating..." : "Toggle"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
