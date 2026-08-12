/**
 * HMAC-SHA256 webhook signing.
 *
 * Mirrors the GitHub webhook convention: the signature is the lowercase
 * hex digest of HMAC-SHA256(secret, body), prefixed with `sha256=` and sent
 * in the `X-Hub-Signature-256` request header.
 *
 * Both helpers are framework-agnostic so they can run in:
 *   - the dispatcher Cloud Function (signing outbound payloads)
 *   - the Next.js app (verifying inbound third-party webhooks if added later)
 *   - tenant-side handlers using the same `@repo/shared` package
 */
import { createHmac, timingSafeEqual } from "node:crypto";

const SIGNATURE_PREFIX = "sha256=";

/**
 * Compute the signature for a webhook payload.
 *
 * @param secret - the shared HMAC secret (the `secret` field on the Webhook doc)
 * @param body   - the exact request body that will be sent (raw JSON string)
 * @returns      a `sha256=<hex>` string suitable for the X-Hub-Signature-256 header
 */
export function signWebhookPayload(secret: string, body: string): string {
  const digest = createHmac("sha256", secret).update(body).digest("hex");
  return `${SIGNATURE_PREFIX}${digest}`;
}

/**
 * Verify a webhook signature in constant time.
 *
 * Returns false (not throws) for any invalid header so callers can return a
 * bare 401 without leaking the failure mode.
 */
export function verifyWebhookSignature(
  secret: string,
  body: string,
  header: string | null | undefined,
): boolean {
  if (!header || !header.startsWith(SIGNATURE_PREFIX)) return false;

  const expected = signWebhookPayload(secret, body);
  // Both sides include the `sha256=` prefix so length matches when valid.
  if (header.length !== expected.length) return false;

  try {
    return timingSafeEqual(Buffer.from(header), Buffer.from(expected));
  } catch {
    // timingSafeEqual throws if buffers are different lengths or contain
    // non-buffer-coercible characters; treat any error as a mismatch.
    return false;
  }
}
