import { describe, expect, it } from "vitest";
import { submitBatches, submitIndexNow } from "../src/submit.js";

const host = "public.example";
const key = "06626485515dfd3425d8166046126bbb";

function recorder(status = 200) {
  const calls: Array<{ url: string; body: { host: string; key: string; keyLocation: string; urlList: string[] } }> = [];
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), body: JSON.parse(String(init?.body)) });
    return new Response(null, { status });
  }) as typeof fetch;
  return { calls, fetchImpl };
}

describe("submit to IndexNow", () => {
  it("posts one batch with the key location the site serves", async () => {
    const { calls, fetchImpl } = recorder();
    const result = await submitIndexNow({
      host,
      key,
      urls: [`https://${host}/`, `https://${host}/docs`],
      fetchImpl,
    });
    expect(result).toEqual({ status: 200, sent: 2, batches: 1 });
    expect(calls[0].body).toEqual({
      host,
      key,
      keyLocation: `https://${host}/${key}.txt`,
      urlList: [`https://${host}/`, `https://${host}/docs`],
    });
  });

  it("refuses a URL off the host before it sends anything", async () => {
    const { calls, fetchImpl } = recorder();
    await expect(
      submitIndexNow({
        host,
        key,
        urls: [`https://${host}/`, "https://elsewhere.example/"],
        fetchImpl,
      }),
    ).rejects.toThrow("not on public.example");
    expect(calls).toHaveLength(0);
  });

  it("refuses a URL that carries credentials", async () => {
    const { calls, fetchImpl } = recorder();
    await expect(
      submitIndexNow({
        host,
        key,
        urls: [`https://user:secret@${host}/`],
        fetchImpl,
      }),
    ).rejects.toThrow("not on public.example");
    expect(calls).toHaveLength(0);
  });

  it("accepts a punycode host and a compressed IPv6 literal", async () => {
    const { fetchImpl } = recorder();
    await expect(
      submitIndexNow({
        host: "bücher.example",
        key,
        urls: ["https://xn--bcher-kva.example/"],
        fetchImpl,
      }),
    ).resolves.toMatchObject({ sent: 1 });
    await expect(
      submitIndexNow({
        host: "[::1]",
        key,
        urls: ["http://[0:0:0:0:0:0:0:1]/"],
        fetchImpl,
      }),
    ).resolves.toMatchObject({ sent: 1 });
  });

  it("refuses a key that is not 8 to 128 hex characters", async () => {
    const { fetchImpl } = recorder();
    await expect(
      submitIndexNow({ host, key: "short", urls: [`https://${host}/`], fetchImpl }),
    ).rejects.toThrow("8 to 128 hex characters");
  });

  it("stops when IndexNow answers with an error or a redirect", async () => {
    for (const status of [422, 301, 304]) {
      const { fetchImpl } = recorder(status);
      await expect(
        submitIndexNow({ host, key, urls: [`https://${host}/`], fetchImpl }),
      ).rejects.toThrow(`answered ${status}`);
    }
  });

  it("splits a large list into batches of ten thousand", () => {
    expect(submitBatches([1, 2, 3], 2)).toEqual([[1, 2], [3]]);
    expect(submitBatches(Array.from({ length: 10_001 }, (_, i) => i))).toHaveLength(2);
  });
});
