import { describe, expect, test } from "bun:test";

import { renderEmail } from "./render";

describe("renderEmail (Cloudflare-ready HTML, no react-email)", () => {
  test("welcome includes workspace name", () => {
    const out = renderEmail({
      template: "welcome",
      to: "a@example.com",
      props: { workspaceName: "Acme", ownerName: "Ada" },
    });
    expect(out.subject).toContain("Acme");
    expect(out.html).toContain("Acme");
    expect(out.html).toContain("Ada");
    expect(out.text).toContain("Acme");
  });

  test("welcome works without owner name", () => {
    const out = renderEmail({
      template: "welcome",
      to: "a@example.com",
      props: { workspaceName: "Acme", ownerName: null },
    });
    expect(out.html).toContain("there");
  });

  test("password reset includes url", () => {
    const out = renderEmail({
      template: "password_reset",
      to: "a@example.com",
      props: { resetUrl: "https://example.com/reset?token=abc" },
    });
    expect(out.html).toContain("https://example.com/reset?token=abc");
    expect(out.subject.toLowerCase()).toContain("reset");
  });

  test("billing receipt formats cents", () => {
    const out = renderEmail({
      template: "billing_receipt",
      to: "a@example.com",
      props: {
        workspaceName: "Acme",
        amountCents: 2599,
        invoiceUrl: "https://example.com/inv/1",
      },
    });
    expect(out.html).toContain("$25.99");
    expect(out.html).toContain("https://example.com/inv/1");
  });

  test("escapes html in workspace name", () => {
    const out = renderEmail({
      template: "welcome",
      to: "a@example.com",
      props: { workspaceName: "<script>x</script>", ownerName: "Ada" },
    });
    expect(out.html).not.toContain("<script>");
    expect(out.html).toContain("&" + "lt;script&" + "gt;");
  });
});
