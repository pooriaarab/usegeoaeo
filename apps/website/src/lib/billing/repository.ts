import { eq } from "drizzle-orm";
import "server-only";
import { getDB } from "@/db";
import { billingEventTable, billingTable } from "@/db/schema/domain";
import { createId } from "@paralleldrive/cuid2";

export async function getBilling(workspaceId: string) {
  const db = await getDB();
  const rows = await db.select().from(billingTable).where(eq(billingTable.workspaceId, workspaceId)).limit(1);
  if (rows[0]) return rows[0];
  const [created] = await db
    .insert(billingTable)
    .values({
      workspaceId,
      plan: "free",
      status: "active",
      entitlementsJson: JSON.stringify({ aiTokensPerMonth: 10000, members: 3 }),
    })
    .returning();
  return created;
}

export async function recordBillingEvent(type: string, payload: unknown) {
  const db = await getDB();
  const [row] = await db
    .insert(billingEventTable)
    .values({
      id: `bev_${createId()}`,
      type,
      payloadJson: JSON.stringify(payload ?? {}),
      receivedAt: new Date(),
    })
    .returning();
  return row;
}

export async function applyCheckoutMock(workspaceId: string, plan: "pro" | "team") {
  const db = await getDB();
  await getBilling(workspaceId);
  const [row] = await db
    .update(billingTable)
    .set({
      plan,
      status: "active",
      customerId: `cus_mock_${createId().slice(0, 8)}`,
      subscriptionId: `sub_mock_${createId().slice(0, 8)}`,
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
      entitlementsJson: JSON.stringify({
        aiTokensPerMonth: plan === "team" ? 1_000_000 : 100_000,
        members: plan === "team" ? 25 : 10,
      }),
    })
    .where(eq(billingTable.workspaceId, workspaceId))
    .returning();
  return row;
}
