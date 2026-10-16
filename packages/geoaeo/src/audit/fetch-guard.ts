import http from "node:http";
import https from "node:https";
import * as dns from "node:dns/promises";
import { Readable } from "node:stream";
import { BlockList, isIP } from "node:net";
export const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
export const MAX_AUDIT_BYTES = 8 * 1024 * 1024;
const DNS_TIMEOUT_MS = 1_000;
const nativeFetch = globalThis.fetch;
interface PinnedAddress {
  address: string;
  family: number;
}
const blocked = new BlockList();
blocked.addSubnet("0.0.0.0", 8, "ipv4");
blocked.addSubnet("10.0.0.0", 8, "ipv4");
blocked.addSubnet("100.64.0.0", 10, "ipv4");
blocked.addSubnet("127.0.0.0", 8, "ipv4");
blocked.addSubnet("169.254.0.0", 16, "ipv4");
blocked.addSubnet("172.16.0.0", 12, "ipv4");
blocked.addSubnet("192.168.0.0", 16, "ipv4");
blocked.addSubnet("224.0.0.0", 4, "ipv4");
blocked.addSubnet("::", 128, "ipv6");
blocked.addSubnet("::1", 128, "ipv6");
blocked.addSubnet("fc00::", 7, "ipv6");
blocked.addSubnet("fe80::", 10, "ipv6");
export interface AuditFetchPolicy {
  host: string;
  allowPrivate: boolean;
  bytes: number;
  signal: AbortSignal;
  abort: () => void;
  dnsCache: Map<string, PinnedAddress[] | false>;
}
export function createFetchPolicy(target: URL): AuditFetchPolicy {
  const controller = new AbortController();
  return {
    host: target.host,
    allowPrivate: isOperatorLocalHost(target.hostname),
    bytes: 0,
    signal: controller.signal,
    abort: () => controller.abort(),
    dnsCache: new Map(),
  };
}
function isOperatorLocalHost(hostname: string): boolean {
  if (isLocalName(hostname)) return true;
  const ip = literalIp(hostname);
  return ip !== undefined && isBlockedIp(ip);
}
function isLocalName(hostname: string): boolean {
  const name = hostname.toLowerCase().replace(/\.+$/, "");
  return (
    name === "localhost" ||
    name.endsWith(".localhost") ||
    name.endsWith(".local") ||
    name === "metadata.google.internal" ||
    name === "metadata.internal"
  );
}
function literalIp(hostname: string): string | undefined {
  if (isIP(hostname)) return hostname;
  if (!/^\d+$/.test(hostname)) return undefined;
  const value = Number(hostname);
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) return undefined;
  return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255].join(".");
}
function isBlockedIp(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) return blocked.check(ip, "ipv4");
  if (family === 6) return blocked.check(ip, "ipv6");
  return false;
}
function hostKey(hostname: string): string {
  return hostname.toLowerCase().replace(/\.+$/, "");
}
function onWorkers(): boolean {
  return typeof navigator !== "undefined" && navigator.userAgent.includes("Cloudflare-Workers");
}
async function resolvePinned(
  hostname: string,
  cache: Map<string, PinnedAddress[] | false>,
  allowBlocked: boolean,
): Promise<PinnedAddress[] | false> {
  const key = hostKey(hostname);
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  let resolved: PinnedAddress[] | false = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const records = await Promise.race([
      dns.lookup(hostname, { all: true, verbatim: true }),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error("dns-timeout")), DNS_TIMEOUT_MS);
      }),
    ]);
    const addresses = records.map((record) => ({ address: record.address, family: record.family }));
    const blockedAddress =
      addresses.length === 0 || addresses.some((item) => isBlockedIp(item.address));
    resolved = addresses.length > 0 && (allowBlocked || !blockedAddress) ? addresses : false;
  } catch {
    resolved = false;
  } finally {
    if (timer) clearTimeout(timer);
  }
  cache.set(key, resolved);
  return resolved;
}
function stubDestinationAllowed(url: URL, policy: AuditFetchPolicy): boolean {
  if (policy.allowPrivate || !isLocalName(url.hostname)) {
    const ip = literalIp(url.hostname);
    return !ip || policy.allowPrivate || !isBlockedIp(ip);
  }
  return false;
}
function rememberLiteral(url: URL, policy: AuditFetchPolicy): boolean {
  const ip = literalIp(url.hostname);
  if (!ip) return false;
  if (!policy.allowPrivate && isBlockedIp(ip)) return false;
  policy.dnsCache.set(hostKey(url.hostname), [{ address: ip, family: isIP(ip) }]);
  return true;
}
export async function destinationAllowed(url: URL, policy: AuditFetchPolicy): Promise<boolean> {
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  if (url.host !== policy.host) return false;
  if (globalThis.fetch !== nativeFetch) return stubDestinationAllowed(url, policy);
  if (!policy.allowPrivate && isLocalName(url.hostname)) return false;
  if (rememberLiteral(url, policy)) return true;
  if (literalIp(url.hostname)) return false;
  return (await resolvePinned(url.hostname, policy.dnsCache, policy.allowPrivate)) !== false;
}
function lookupPinned(
  addresses: PinnedAddress[],
  options: object | null | undefined,
  callback: (err: null, address: string | PinnedAddress[], family?: number) => void,
): void {
  const all = Boolean(options && "all" in options && options.all);
  if (all) callback(null, addresses);
  else callback(null, addresses[0].address, addresses[0].family);
}
function responseFrom(incoming: http.IncomingMessage): Response {
  const headers = new Headers();
  for (const [key, value] of Object.entries(incoming.headers)) {
    if (typeof value === "string") headers.set(key, value);
    else if (Array.isArray(value)) for (const item of value) headers.append(key, item);
  }
  const body = Readable.toWeb(incoming) as ReadableStream<Uint8Array>;
  return new Response(body, { status: incoming.statusCode ?? 0, headers });
}
function pinnedRequest(
  current: URL,
  addresses: PinnedAddress[],
  signal: AbortSignal,
): Promise<Response> {
  const lib = current.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const req = lib.request(
      {
        hostname: current.hostname,
        port: current.port || undefined,
        path: `${current.pathname}${current.search}`,
        method: "GET",
        headers: { host: current.host },
        servername: current.hostname,
        signal,
        lookup: (_hostname, options, callback) => lookupPinned(addresses, options, callback),
      },
      (incoming) => resolve(responseFrom(incoming)),
    );
    req.on("error", reject);
    req.end();
  });
}
export async function openAudit(
  requestUrl: string,
  current: URL,
  policy: AuditFetchPolicy,
): Promise<Response> {
  const signal = AbortSignal.any([policy.signal, AbortSignal.timeout(8000)]);
  if (globalThis.fetch !== nativeFetch || onWorkers()) {
    return fetch(requestUrl, { redirect: "manual", signal });
  }
  const pinned = policy.dnsCache.get(hostKey(current.hostname));
  if (!pinned || pinned.length === 0) throw new Error("unpinned");
  return pinnedRequest(current, pinned, signal);
}
function chunkFits(size: number, value: Uint8Array, policy: AuditFetchPolicy): boolean {
  policy.bytes += value.byteLength;
  return size + value.byteLength <= MAX_RESPONSE_BYTES && policy.bytes <= MAX_AUDIT_BYTES;
}
async function readChunks(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  policy: AuditFetchPolicy,
): Promise<Uint8Array[] | undefined> {
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return chunks;
    if (!value || value.byteLength === 0) continue;
    if (!chunkFits(size, value, policy)) {
      await reader.cancel().catch(() => undefined);
      return undefined;
    }
    chunks.push(value);
    size += value.byteLength;
  }
}
export async function readLimited(
  response: Response,
  policy: AuditFetchPolicy,
): Promise<string | undefined> {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks = await readChunks(reader, policy);
  return chunks ? Buffer.concat(chunks).toString("utf8") : undefined;
}
