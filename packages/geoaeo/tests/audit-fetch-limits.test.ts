import net from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";
import { auditTarget } from "../src/audit.js";
const dnsState = vi.hoisted(() => ({
  impl: null as null | (() => Promise<Array<{ address: string; family: number }>>),
}));
vi.mock("node:dns/promises", () => ({
  lookup: () => (dnsState.impl ? dnsState.impl() : Promise.reject(new Error("dns down"))),
}));
const target = "https://public.example";
const internal = "http://127.0.0.1:8080/internal/job/run";
const originalFetch = globalThis.fetch;
const page = `<html><head><link rel="alternate" type="text/markdown" href="${internal}"></head><body><h1>Hi</h1></body></html>`;
afterEach(() => {
  globalThis.fetch = originalFetch;
  dnsState.impl = null;
});
describe("audit fetches stay on the audited site and within a byte budget", () => {
  it("does not request a markdown alternate outside the audited site", async () => {
    const requested: string[] = [];
    globalThis.fetch = async (input: RequestInfo | URL) => {
      requested.push(String(input));
      return String(input) === target
        ? new Response(page, { headers: { "content-type": "text/html" } })
        : new Response("", { status: 404 });
    };
    await auditTarget(target);
    expect(requested).not.toContain(internal);
  });
  it("does not follow a redirect onto a loopback address", async () => {
    const requested: string[] = [];
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      requested.push(url);
      if (url === target && init?.redirect !== "manual") requested.push(internal);
      if (url === target)
        return new Response(null, { status: 302, headers: { location: internal } });
      return new Response(url === internal ? "ran" : "", { status: url === internal ? 200 : 404 });
    };
    await auditTarget(target);
    expect(requested).not.toContain(internal);
  });
  it("shares one budget across concurrent sitemap reads", async () => {
    const pulled = { n: 0 };
    const chunk = new Uint8Array(256 * 1024);
    const index = `<sitemapindex><sitemap><loc>${target}/a.xml</loc></sitemap><sitemap><loc>${target}/b.xml</loc></sitemap></sitemapindex>`;
    const stream = () =>
      new Response(
        new ReadableStream<Uint8Array>({
          pull(controller) {
            if (pulled.n >= 12 * 1024 * 1024) return controller.close();
            pulled.n += chunk.byteLength;
            controller.enqueue(chunk);
          },
        }),
        { status: 200 },
      );
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (["/llms.txt", "/llms-full.txt", "/robots.txt"].some((path) => url.endsWith(path)))
        return stream();
      if (url.endsWith("/sitemap.xml")) return new Response(index, { status: 200 });
      if (url.endsWith("/a.xml") || url.endsWith("/b.xml")) return stream();
      return new Response("", { status: 404 });
    };
    await auditTarget(target);
    expect(pulled.n).toBeLessThanOrEqual(8 * 1024 * 1024 + chunk.byteLength * 6);
  });
  it("connects to the validated address and stops when DNS fails", async () => {
    let calls = 0;
    dnsState.impl = async () => [
      { address: ++calls === 1 ? "203.0.113.10" : "127.0.0.1", family: 4 },
    ];
    const hosts: string[] = [];
    const original = net.Socket.prototype.connect;
    net.Socket.prototype.connect = function connect(this: net.Socket, ...args: unknown[]) {
      this.on("lookup", (_error: Error | null, address: string) => {
        hosts.push(address);
        this.destroy(new Error("pin-probe"));
      });
      return original.apply(this, args as never);
    } as typeof original;
    try {
      await auditTarget("http://rebind.example/");
      expect(hosts).toContain("203.0.113.10");
      expect(hosts).not.toContain("127.0.0.1");
      hosts.length = 0;
      dnsState.impl = () => Promise.reject(new Error("dns down"));
      await auditTarget("https://example.com/");
      expect(hosts).toEqual([]);
    } finally {
      net.Socket.prototype.connect = original;
    }
  });
});
