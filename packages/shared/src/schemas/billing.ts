import { z } from "zod";

export const PlanIdSchema = z.enum(["free", "pro", "team"]);
export type PlanId = z.infer<typeof PlanIdSchema>;

export const BillingStatusSchema = z.enum([
  "active",
  "trialing",
  "past_due",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "unpaid",
  "paused",
]);
export type BillingStatus = z.infer<typeof BillingStatusSchema>;

export const EntitlementsSchema = z.object({
  aiTokensPerMonth: z.number().int().nonnegative(),
  members: z.number().int().positive(),
});
export type Entitlements = z.infer<typeof EntitlementsSchema>;

export const BillingInfoSchema = z
  .object({
    workspaceId: z.string(),
    plan: PlanIdSchema,
    status: BillingStatusSchema,
    customerId: z.string().nullable(),
    subscriptionId: z.string().nullable(),
    currentPeriodEnd: z.date().nullable(),
    cancelAtPeriodEnd: z.boolean(),
    entitlements: EntitlementsSchema,
    updatedAt: z.date(),
  })
  .refine(
    (v) =>
      v.plan === "free" || (v.customerId !== null && v.subscriptionId !== null),
    {
      message: "customerId + subscriptionId required on paid plans",
      path: ["customerId"],
    },
  );
export type BillingInfo = z.infer<typeof BillingInfoSchema>;

export const BillingEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  receivedAt: z.date(),
  appliedAt: z.date().nullable(),
  attempts: z.number().int().nonnegative().default(0),
  error: z.string().nullable().optional(),
});
export type BillingEvent = z.infer<typeof BillingEventSchema>;
