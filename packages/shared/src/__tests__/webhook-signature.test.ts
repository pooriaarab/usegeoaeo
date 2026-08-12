import { describe, it, expect } from "vitest";
import {
  signWebhookPayload,
  verifyWebhookSignature,
} from "../webhook-signature";

describe("signWebhookPayload", () => {
  it("returns a sha256= prefixed hex digest", () => {
    const sig = signWebhookPayload("shh", '{"a":1}');
    expect(sig).toMatch(/^sha256=[a-f0-9]{64}$/);
  });

  it("is deterministic for the same secret + body", () => {
    const a = signWebhookPayload("shh", "body");
    const b = signWebhookPayload("shh", "body");
    expect(a).toBe(b);
  });

  it("produces different signatures for different secrets", () => {
    expect(signWebhookPayload("a", "body")).not.toBe(
      signWebhookPayload("b", "body"),
    );
  });

  it("produces different signatures for different bodies", () => {
    expect(signWebhookPayload("shh", "a")).not.toBe(
      signWebhookPayload("shh", "b"),
    );
  });
});

describe("verifyWebhookSignature", () => {
  const secret = "shh";
  const body = '{"event":"thread.message.created"}';
  const sig = signWebhookPayload(secret, body);

  it("returns true for a valid signature", () => {
    expect(verifyWebhookSignature(secret, body, sig)).toBe(true);
  });

  it("returns false for a tampered body", () => {
    expect(verifyWebhookSignature(secret, body + "x", sig)).toBe(false);
  });

  it("returns false for the wrong secret", () => {
    expect(verifyWebhookSignature("other", body, sig)).toBe(false);
  });

  it("returns false for a malformed header", () => {
    expect(verifyWebhookSignature(secret, body, "not-a-sig")).toBe(false);
    expect(verifyWebhookSignature(secret, body, "sha256=zzz")).toBe(false);
    expect(verifyWebhookSignature(secret, body, "")).toBe(false);
  });

  it("returns false when the header omits the sha256= prefix", () => {
    const bare = sig.replace(/^sha256=/, "");
    expect(verifyWebhookSignature(secret, body, bare)).toBe(false);
  });

  it("returns false on length mismatch (would otherwise crash timingSafeEqual)", () => {
    expect(verifyWebhookSignature(secret, body, "sha256=abcd")).toBe(false);
  });
});
