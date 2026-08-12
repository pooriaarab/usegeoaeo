import { NextResponse } from "next/server";
import { z } from "zod";
import { createApiHandler } from "@/lib/create-api-handler";
import { applyCheckoutMock, recordBillingEvent } from "@/lib/billing/repository";

export const dynamic = "force-dynamic";
const Schema = z.object({ plan: z.enum(["pro", "team"]) });

/** Mock checkout for CF template — real Stripe later. */
export const POST = createApiHandler({
  auth: "admin",
  input: Schema,
  handler: async ({ workspaceId, body }) => {
    const billing = await applyCheckoutMock(workspaceId, body.plan);
    await recordBillingEvent("checkout.mock", { workspaceId, plan: body.plan });
    return NextResponse.json({
      billing,
      checkoutUrl: null,
      note: "Mock checkout queued entitlements; wire Stripe Checkout in production.",
    });
  },
});
