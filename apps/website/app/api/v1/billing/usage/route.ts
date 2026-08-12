import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/create-api-handler";
import { getBilling } from "@/lib/billing/repository";

export const dynamic = "force-dynamic";
export const GET = createApiHandler({
  auth: "user",
  handler: async ({ workspaceId }) => {
    const billing = await getBilling(workspaceId);
    const entitlements = JSON.parse(billing.entitlementsJson || "{}");
    return NextResponse.json({
      usage: { aiTokens: 0, members: 1 },
      entitlements,
      periodEnd: billing.currentPeriodEnd,
    });
  },
});
