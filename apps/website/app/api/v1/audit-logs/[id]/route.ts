import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/create-api-handler";
import * as repo from "@/lib/audit_logs/repository";

export const dynamic = "force-dynamic";

export const GET = createApiHandler({
  auth: "user",
  handler: async ({ workspaceId, params }) => {
    const id = (params as { id: string }).id;
    const item = await repo.getById(workspaceId, id);
    return NextResponse.json({ item });
  },
});
