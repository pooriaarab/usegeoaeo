import { describe, it, expect } from "vitest";
import {
  BillingInfoSchema,
  BillingEventSchema,
  PlanIdSchema,
} from "../schemas/billing";

describe("BillingInfoSchema", () => {
  it("accepts a free workspace with no Stripe relationship", () => {
    const r = BillingInfoSchema.safeParse({
      workspaceId: "ws_1",
      plan: "free",
      status: "active",
      customerId: null,
      subscriptionId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      entitlements: { aiTokensPerMonth: 0, members: 1 },
      updatedAt: new Date(),
    });
    expect(r.success).toBe(true);
  });

  it("requires customerId + subscriptionId on paid plans", () => {
    const r = BillingInfoSchema.safeParse({
      workspaceId: "ws_1",
      plan: "pro",
      status: "active",
      customerId: null,
      subscriptionId: null,
      currentPeriodEnd: new Date(),
      cancelAtPeriodEnd: false,
      entitlements: { aiTokensPerMonth: 100000, members: 5 },
      updatedAt: new Date(),
    });
    expect(r.success).toBe(false);
  });

  it("rejects unknown plan IDs", () => {
    const r = PlanIdSchema.safeParse("enterprise-plus-elite");
    expect(r.success).toBe(false);
  });
});

describe("BillingEventSchema", () => {
  it("captures Stripe event id, type, payload digest", () => {
    const r = BillingEventSchema.safeParse({
      id: "evt_123",
      type: "checkout.session.completed",
      receivedAt: new Date(),
      appliedAt: null,
    });
    expect(r.success).toBe(true);
  });
});
