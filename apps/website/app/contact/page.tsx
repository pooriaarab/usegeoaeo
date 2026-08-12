"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

  // Declare global callback for Turnstile
  useEffect(() => {
    (window as any).onTurnstileSuccess = (token: string) => {
      setToken(token);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !message) return;

    // In production we require the token, in dev we allow bypass if missing
    if (!token && siteKey !== "1x00000000000000000000AA") {
      setStatus("error");
      setStatusMessage("Please solve the Turnstile verification first.");
      return;
    }

    setStatus("loading");
    setStatusMessage("Verifying token and processing your submission...");

    try {
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          message,
          turnstileToken: token,
        }),
      });

      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        setStatus("success");
        setStatusMessage(data.message || "Thank you! Form submitted successfully.");
        setEmail("");
        setMessage("");
        // Reset turnstile widget if available
        if ((window as any).turnstile) {
          (window as any).turnstile.reset();
        }
        setToken("");
      } else {
        setStatus("error");
        setStatusMessage(data.error || "Turnstile verification failed or request rejected.");
      }
    } catch (err: any) {
      console.error("Form submission failed:", err);
      setStatus("error");
      setStatusMessage("Network error: Failed to submit the form.");
    }
  }

  return (
    <main className="wrap" style={{ paddingTop: "40px" }}>
      {/* Cloudflare Turnstile API Script */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Contact Support</h1>
        <Link className="btn secondary" href="/">Home</Link>
      </div>

      <div className="card" style={{ marginTop: "30px" }}>
        <h2>Turnstile Protected Contact Form</h2>
        <p className="muted" style={{ marginBottom: "20px" }}>
          This form is protected from spam and abuse by Cloudflare Turnstile. In development mode with dummy credentials, verification always passes.
        </p>

        {status === "success" && (
          <div
            style={{
              padding: "15px",
              background: "#eaf9e6",
              border: "2px solid #2e7d32",
              borderRadius: "8px",
              color: "#1b5e20",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            ✅ {statusMessage}
          </div>
        )}

        {status === "error" && (
          <div
            style={{
              padding: "15px",
              background: "#fbf0f0",
              border: "2px solid #c62828",
              borderRadius: "8px",
              color: "#b71c1c",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            ❌ {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Your Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === "loading"}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>Message</label>
            <textarea
              placeholder="Type your message here..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={status === "loading"}
            />
          </div>

          {/* Turnstile Widget */}
          <div style={{ marginBottom: "20px" }}>
            <div
              className="cf-turnstile"
              data-sitekey={siteKey}
              data-callback="onTurnstileSuccess"
              data-theme="light"
            />
          </div>

          <button
            className="btn"
            type="submit"
            disabled={status === "loading" || (!token && siteKey !== "1x00000000000000000000AA")}
            style={{ width: "100%" }}
          >
            {status === "loading" ? "Submitting..." : "Send Verified Message"}
          </button>
        </form>
      </div>
    </main>
  );
}
