import { z } from "zod";

/**
 * Transactional email templates supported by the platform.
 *
 * Each new template adds:
 *   - a literal here,
 *   - a discriminated-union variant in {@link EmailJobPayloadSchema},
 *   - a React component in `packages/email/src/templates/`,
 *   - a case in `renderEmailHtml` (`packages/email/src/render.ts`).
 */
export const EmailTemplateNameSchema = z.enum([
  "welcome",
  "password_reset",
  "billing_receipt",
]);
export type EmailTemplateName = z.infer<typeof EmailTemplateNameSchema>;

/**
 * Cloud Tasks payload for `sendEmailTask`. Each variant of the union pins the
 * exact `props` shape required by its template, so the worker can decode the
 * payload and pass typed props to the renderer without any `as` casts.
 *
 * Security note: there is intentionally no public API route that accepts this
 * payload from a browser. Callers are server-only:
 *   - signup → welcome
 *   - password reset → password_reset (with server-minted token)
 *   - billing webhook → billing_receipt (with Stripe-sourced address)
 * Allowing a workspace member to enqueue arbitrary `to`/`template` would be a
 * phishing + spam vector.
 */
// Optional metadata forwarded through the queue. Currently just a correlation
// ID for log stitching across web → Cloud Tasks → Resend; extend additively
// without breaking the discriminated-union schema below.
const MetaSchema = z
  .object({
    correlationId: z.string().min(1).max(128).optional(),
  })
  .optional();

export const EmailJobPayloadSchema = z.discriminatedUnion("template", [
  z.object({
    template: z.literal("welcome"),
    to: z.string().email(),
    props: z.object({
      workspaceName: z.string().min(1),
      ownerName: z.string().min(1).nullable(),
    }),
    meta: MetaSchema,
  }),
  z.object({
    template: z.literal("password_reset"),
    to: z.string().email(),
    props: z.object({
      resetUrl: z.string().url(),
    }),
    meta: MetaSchema,
  }),
  z.object({
    template: z.literal("billing_receipt"),
    to: z.string().email(),
    props: z.object({
      workspaceName: z.string().min(1),
      amountCents: z.number().int().nonnegative(),
      invoiceUrl: z.string().url(),
    }),
    meta: MetaSchema,
  }),
]);
export type EmailJobPayload = z.infer<typeof EmailJobPayloadSchema>;

export type EmailWelcomeProps = Extract<
  EmailJobPayload,
  { template: "welcome" }
>["props"];
export type EmailPasswordResetProps = Extract<
  EmailJobPayload,
  { template: "password_reset" }
>["props"];
export type EmailBillingReceiptProps = Extract<
  EmailJobPayload,
  { template: "billing_receipt" }
>["props"];
