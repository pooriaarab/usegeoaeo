import { NextResponse } from "next/server";
import { z } from "zod";
import { createApiHandler } from "@/lib/create-api-handler";
import * as repo from "@/lib/audit_logs/repository";

export const dynamic = "force-dynamic";

export const GET = createApiHandler({
  auth: "user",
  handler: async ({ workspaceId }) => {
    const rows = await repo.listByWorkspace(workspaceId);
    return NextResponse.json({ items: rows });
  },
});
