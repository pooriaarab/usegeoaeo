import { NextResponse } from "next/server";

import { createApiHandler } from "@/lib/create-api-handler";

export const dynamic = "force-dynamic";

export const GET = createApiHandler({
  auth: "user",
  handler: async ({ workspaceId, role }) => {
    return NextResponse.json({ workspaceId, role });
  },
});
