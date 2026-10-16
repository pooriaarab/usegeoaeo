import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";

/** Per response. Larger bodies are cancelled instead of buffered. */
export const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
/** Shared by every fetch in one audit. */
export const MAX_AUDIT_BYTES = 8 * 1024 * 1024;
const DNS_TIMEOUT_MS = 1_000;

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
  /** True only when the operator asked to audit a local address directly. */
  allowPrivate: boolean;
  bytes: number;
  signal: AbortSignal;
  abort: () => void;
  dnsCache: Map<string, boolean>;
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

/** Dotted IP, IPv6, or a single decimal IPv4 (for example 2130706433). */
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

async function resolvesToBlocked(hostname: string, cache: Map<string, boolean>): Promise<boolean> {
  const key = hostname.toLowerCase();
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  let blockedAddress = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const records = await Promise.race([
      lookup(hostname, { all: true, verbatim: true }),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error("dns-timeout")), DNS_TIMEOUT_MS);
      }),
    ]);
    blockedAddress = records.length === 0 || records.some((record) => isBlockedIp(record.address));
  } catch {
    // A name that does not resolve cannot be connected. Leave the fetch to fail.
    blockedAddress = false;
  } finally {
    if (timer) clearTimeout(timer);
  }
  cache.set(key, blockedAddress);
  return blockedAddress;
}

/** True when this URL is http(s) on the audited host and not a private address. */
export async function destinationAllowed(url: URL, policy: AuditFetchPolicy): Promise<boolean> {
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  if (url.host !== policy.host) return false;
  if (policy.allowPrivate) return true;
  if (isLocalName(url.hostname)) return false;
  const ip = literalIp(url.hostname);
  if (ip) return !isBlockedIp(ip);
  return !(await resolvesToBlocked(url.hostname, policy.dnsCache));
}

/** Read at most the remaining byte budget. Undefined means the body was too large. */
export async function readLimited(
  response: Response,
  policy: AuditFetchPolicy,
): Promise<string | undefined> {
  const declared = response.headers.get("content-length");
  if (declared !== null) {
    const length = Number(declared);
    if (
      !Number.isFinite(length) ||
      length < 0 ||
      length > MAX_RESPONSE_BYTES ||
      policy.bytes + length > MAX_AUDIT_BYTES
    ) {
      await response.body?.cancel().catch(() => undefined);
      return undefined;
    }
  }
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value || value.byteLength === 0) continue;
    if (
      size + value.byteLength > MAX_RESPONSE_BYTES ||
      policy.bytes + size + value.byteLength > MAX_AUDIT_BYTES
    ) {
      await reader.cancel().catch(() => undefined);
      return undefined;
    }
    chunks.push(value);
    size += value.byteLength;
  }
  policy.bytes += size;
  const merged = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}
