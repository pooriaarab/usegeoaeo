import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/create-api-handler";
import { getBilling } from "@/lib/billing/repository";

export const dynamic = "force-dynamic";
export const POST = createApiHandler({
  auth: "admin",
  handler: async ({ workspaceId }) => {
    const billing = await getBilling(workspaceId);
    return NextResponse.json({
      url: null,
      customerId: billing.customerId,
      note: "Stripe customer portal not configured in template mock.",
    });
  },
});
