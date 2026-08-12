import { describe, it, expect } from "vitest";
import {
  EmailJobPayloadSchema,
  EmailTemplateNameSchema,
} from "../schemas/email";

describe("EmailTemplateNameSchema", () => {
  it("accepts known template names", () => {
    expect(EmailTemplateNameSchema.safeParse("welcome").success).toBe(true);
    expect(EmailTemplateNameSchema.safeParse("password_reset").success).toBe(
      true,
    );
    expect(EmailTemplateNameSchema.safeParse("billing_receipt").success).toBe(
      true,
    );
  });

  it("rejects unknown templates", () => {
    expect(EmailTemplateNameSchema.safeParse("marketing_blast").success).toBe(
      false,
    );
  });
});

describe("EmailJobPayloadSchema", () => {
  it("accepts a welcome payload", () => {
    const r = EmailJobPayloadSchema.safeParse({
      template: "welcome",
      to: "owner@example.com",
      props: { workspaceName: "Acme", ownerName: "Alice" },
    });
    expect(r.success).toBe(true);
  });

  it("accepts a welcome payload with null ownerName", () => {
    const r = EmailJobPayloadSchema.safeParse({
      template: "welcome",
      to: "owner@example.com",
      props: { workspaceName: "Acme", ownerName: null },
    });
    expect(r.success).toBe(true);
  });

  it("accepts a password_reset payload", () => {
    const r = EmailJobPayloadSchema.safeParse({
      template: "password_reset",
      to: "owner@example.com",
      props: { resetUrl: "https://example.com/reset?token=abc" },
    });
    expect(r.success).toBe(true);
  });

  it("accepts a billing_receipt payload", () => {
    const r = EmailJobPayloadSchema.safeParse({
      template: "billing_receipt",
      to: "owner@example.com",
      props: {
        workspaceName: "Acme",
        amountCents: 1999,
        invoiceUrl: "https://example.com/i/1",
      },
    });
    expect(r.success).toBe(true);
  });

  it("rejects mismatched props for the chosen template", () => {
    const r = EmailJobPayloadSchema.safeParse({
      template: "password_reset",
      to: "owner@example.com",
      props: { workspaceName: "Acme", ownerName: "Alice" },
    });
    expect(r.success).toBe(false);
  });

  it("rejects an invalid email address", () => {
    const r = EmailJobPayloadSchema.safeParse({
      template: "welcome",
      to: "not-an-email",
      props: { workspaceName: "Acme", ownerName: null },
    });
    expect(r.success).toBe(false);
  });

  it("rejects a non-https reset URL of the wrong shape", () => {
    const r = EmailJobPayloadSchema.safeParse({
      template: "password_reset",
      to: "owner@example.com",
      props: { resetUrl: "not-a-url" },
    });
    expect(r.success).toBe(false);
  });
});
