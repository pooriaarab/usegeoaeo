/**
 * IndexNow is the one submission protocol that needs no per-engine account.
 * One POST reaches Bing, Yandex, Naver, Seznam, and Yep. The site proves it
 * owns the key by serving `<key>.txt` at its root.
 */
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const INDEXNOW_BATCH_SIZE = 10_000;

export interface SubmitIndexNowOptions {
  /** Host that owns the URLs, without a scheme. For example `usegeoaeo.com`. */
  host: string;
  /** Key the site serves at `<keyLocation>`. 8 to 128 hex characters. */
  key: string;
  /** Absolute URL of the key file. Defaults to `https://<host>/<key>.txt`. */
  keyLocation?: string;
  /** URLs to announce. Every one must sit on `host`. */
  urls: readonly string[];
  /** Override for tests. Defaults to the IndexNow API. */
  endpoint?: string;
  /** Override for tests. Defaults to `globalThis.fetch`. */
  fetchImpl?: typeof fetch;
}

export interface SubmitIndexNowResult {
  /** Status of the last accepted batch. */
  status: number;
  /** URLs accepted across every batch. */
  sent: number;
  /** Number of requests made. */
  batches: number;
}

const KEY_PATTERN = /^[a-f0-9]{8,128}$/i;

function bareHost(host: string): string {
  const text = host.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  try {
    // URL normalizes a name to punycode and an IPv6 literal to its compressed
    // form, so a host typed either way compares equal.
    return new URL(`https://${text}`).hostname;
  } catch {
    return "";
  }
}

function onHost(url: string, host: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.username || parsed.password) return false;
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      parsed.hostname.toLowerCase() === host
    );
  } catch {
    return false;
  }
}

export function submitBatches<T>(items: readonly T[], size = INDEXNOW_BATCH_SIZE): T[][] {
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += size) batches.push(items.slice(index, index + size));
  return batches;
}

/**
 * Announce URLs to IndexNow. Refuses a key of the wrong shape, a URL off the
 * host, and an empty list, so a typo fails here rather than at the engine.
 */
export async function submitIndexNow(
  options: SubmitIndexNowOptions,
): Promise<SubmitIndexNowResult> {
  const host = bareHost(options.host);
  if (!host) throw new Error("submit: a host is required");
  if (!KEY_PATTERN.test(options.key))
    throw new Error("submit: the key must be 8 to 128 hex characters");
  if (options.urls.length === 0) throw new Error("submit: at least one URL is required");
  const offHost = options.urls.filter((url) => !onHost(url, host));
  if (offHost.length > 0)
    throw new Error(`submit: ${offHost.length} URL(s) are not on ${host}, starting with ${offHost[0]}`);
  const keyLocation = options.keyLocation ?? `https://${host}/${options.key}.txt`;
  const endpoint = options.endpoint ?? INDEXNOW_ENDPOINT;
  const send = options.fetchImpl ?? globalThis.fetch;
  let status = 0;
  let sent = 0;
  const batches = submitBatches(options.urls);
  for (const urlList of batches) {
    const response = await send(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key: options.key, keyLocation, urlList }),
    });
    if (!response.ok)
      throw new Error(`submit: IndexNow answered ${response.status} for ${urlList.length} URL(s)`);
    status = response.status;
    sent += urlList.length;
  }
  return { status, sent, batches: batches.length };
}
