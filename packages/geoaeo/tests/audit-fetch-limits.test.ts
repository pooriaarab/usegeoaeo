import { afterEach, describe, expect, it } from "vitest";
import { auditTarget } from "../src/audit.js";

const target = "https://public.example";
const internal = "http://127.0.0.1:8080/internal/job/run";
const originalFetch = globalThis.fetch;

const page =
  `<html><head><link rel="alternate" type="text/markdown" href="${internal}">` +
  "</head><body><h1>Hi</h1></body></html>";

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("audit fetches stay on the audited site and within a byte budget", () => {
  it("does not request a markdown alternate outside the audited site", async () => {
    const requested: string[] = [];
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const url = String(input);
      requested.push(url);
      if (url === target) {
        return new Response(page, { headers: { "content-type": "text/html" } });
      }
      return new Response("", { status: 404 });
    };

    await auditTarget(target);

    expect(requested).not.toContain(internal);
  });

  it("does not follow a redirect onto a loopback address", async () => {
    const requested: string[] = [];
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      requested.push(url);
      if (url === internal) return new Response("ran", { status: 200 });
      // The real client follows redirects unless this call opts out.
      if (url === target && init?.redirect !== "manual") {
        requested.push(internal);
        return new Response("ran", { status: 200 });
      }
      if (url === target) {
        return new Response(null, { status: 302, headers: { location: internal } });
      }
      return new Response("", { status: 404 });
    };

    await auditTarget(target);

    expect(requested).not.toContain(internal);
  });

  it("stops reading a response once it passes the byte budget", async () => {
    const seen = { n: 0 };
    const chunk = new Uint8Array(64 * 1024);
    const streamLimit = 3 * 1024 * 1024;
    globalThis.fetch = async (input: RequestInfo | URL) => {
      if (String(input) !== `${target}/llms.txt`) return new Response("", { status: 404 });
      const body = new ReadableStream<Uint8Array>({
        pull(controller) {
          if (seen.n >= streamLimit) {
            controller.close();
            return;
          }
          seen.n += chunk.byteLength;
          controller.enqueue(chunk);
        },
      });
      return new Response(body, {
        status: 200,
        headers: { "content-type": "text/plain" },
      });
    };

    await auditTarget(target);

    // Cancelling the stream can pull one extra chunk after the cap is crossed.
    expect(seen.n).toBeLessThanOrEqual(2 * 1024 * 1024 + chunk.byteLength * 2);
  });
});
