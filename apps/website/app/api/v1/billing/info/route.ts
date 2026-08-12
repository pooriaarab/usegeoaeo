import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/create-api-handler";
import { getBilling } from "@/lib/billing/repository";

export const dynamic = "force-dynamic";
export const GET = createApiHandler({
  auth: "user",
  handler: async ({ workspaceId }) => {
    const billing = await getBilling(workspaceId);
    return NextResponse.json({ billing });
  },
});
