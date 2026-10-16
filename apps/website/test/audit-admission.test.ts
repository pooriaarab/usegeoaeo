import { afterEach, describe, expect, it } from "vitest";
import { auditUrl } from "../app/tools/actions";

const originalFetch = globalThis.fetch;
const target = "https://public.example";

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("hosted audit admission", () => {
  it("refuses another audit while two are already running", async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    globalThis.fetch = async () => {
      await gate;
      return new Response("", { status: 404 });
    };

    const pending = [auditUrl(target), auditUrl(target), auditUrl(target)];
    await new Promise((resolve) => setTimeout(resolve, 50));
    release();
    const results = await Promise.all(pending);

    expect(results.filter((result) => result.ok).length).toBe(2);
    expect(
      results.some((result) => result.error === "Too many audits are running. Try again shortly."),
    ).toBe(true);
  });
});
