/**
 * Upgrade Dialog Component
 *
 * Plan-picker dialog used to gate features behind paid plans. Renders the
 * available paid plans (caller-supplied) and emits a callback when the user
 * picks one. The caller owns the actual POST to /api/v1/billing/checkout —
 * UI composites must not contain API logic.
 *
 * Usage:
 * ```tsx
 * <UpgradeDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   plans={[{ id: "pro", name: "Pro", price: "$20/mo" }, ...]}
 *   onSelectPlan={async (planId) => {
 *     const res = await fetch("/api/v1/billing/checkout", {...});
 *     const { url } = await res.json();
 *     window.location.href = url;
 *   }}
 * />
 * ```
 */

"use client";

import { useState } from "react";
import { Button } from "../primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../primitives/dialog";

export interface UpgradePlanOption {
  id: string;
  name: string;
  price: string;
  description?: string;
}

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  plans: UpgradePlanOption[];
  onSelectPlan: (planId: string) => void | Promise<void>;
}

export function UpgradeDialog({
  open,
  onOpenChange,
  title = "Upgrade your plan",
  description = "Pick a plan to unlock more capacity and features.",
  plans,
  onSelectPlan,
}: UpgradeDialogProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleSelect = async (planId: string) => {
    setPendingId(planId);
    try {
      await onSelectPlan(planId);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overscroll-contain">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between rounded-md border border-border p-4"
            >
              <div className="flex flex-col">
                <span className="font-medium">{plan.name}</span>
                <span className="text-sm text-muted-foreground">{plan.price}</span>
                {plan.description ? (
                  <span className="mt-1 text-xs text-muted-foreground">
                    {plan.description}
                  </span>
                ) : null}
              </div>
              <Button
                onClick={() => handleSelect(plan.id)}
                disabled={pendingId !== null}
              >
                {pendingId === plan.id ? "Redirecting..." : "Choose"}
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={pendingId !== null}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
