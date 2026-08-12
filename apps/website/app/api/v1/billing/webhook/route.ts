import { NextResponse } from "next/server";
import { recordBillingEvent } from "@/lib/billing/repository";

export const dynamic = "force-dynamic";

/** Stripe-compatible ingress — stores event for async reconcile. */
export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const type = (payload as { type?: string }).type ?? "unknown";
  const event = await recordBillingEvent(type, payload);
  return NextResponse.json({ received: true, id: event.id });
}
