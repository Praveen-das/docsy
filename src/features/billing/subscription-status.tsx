"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw, Crown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SubscriptionData } from "./use-subscription";

interface SubscriptionStatusProps {
  subscription: SubscriptionData;
}

/**
 * Custom subscription management UI for Pro users.
 * Shows subscription status, period end, and cancel/reactivate controls.
 * No Stripe Billing Portal redirect — all actions handled in-app.
 */
export function SubscriptionStatus({ subscription }: SubscriptionStatusProps) {
  const queryClient = useQueryClient();
  const [isCanceling, setIsCanceling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isPendingCancel = !!subscription.planCancelAt;
  const periodEndDate = subscription.planPeriodEnd
    ? new Date(subscription.planPeriodEnd).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const cancelAtDate = subscription.planCancelAt
    ? new Date(subscription.planCancelAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const handleCancel = async () => {
    setIsCanceling(true);
    setActionError(null);
    try {
      const res = await fetch("/api/stripe/cancel", { method: "POST" });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ["subscription"] });
        setShowCancelConfirm(false);
      } else {
        setActionError(data.error ?? "Failed to cancel subscription");
      }
    } catch {
      setActionError("Network error — please try again");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleReactivate = async () => {
    setIsReactivating(true);
    setActionError(null);
    try {
      const res = await fetch("/api/stripe/reactivate", { method: "POST" });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (data.success) {
        await queryClient.invalidateQueries({ queryKey: ["subscription"] });
      } else {
        setActionError(data.error ?? "Failed to reactivate subscription");
      }
    } catch {
      setActionError("Network error — please try again");
    } finally {
      setIsReactivating(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-2xs space-y-5 dark:border-white/5 dark:bg-[#121216]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-600/10 dark:border-blue-500/20">
            <Crown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Pro Plan</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              {isPendingCancel ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  Cancels {cancelAtDate}
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={cn(
            "text-[11px] font-semibold px-2.5 py-1 rounded-full border",
            isPendingCancel
              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-500/20"
              : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-500/20",
          )}
        >
          {isPendingCancel ? "Canceling" : "Active"}
        </span>
      </div>

      {/* Billing period info */}
      {periodEndDate && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {isPendingCancel ? "Access ends:" : "Next renewal:"}
          </span>
          <span className="ml-2">{isPendingCancel ? cancelAtDate : periodEndDate}</span>
        </div>
      )}

      {/* Error notice */}
      {actionError && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 dark:bg-rose-950/30 dark:border-rose-500/20 dark:text-rose-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {actionError}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && !isPendingCancel && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-3 dark:border-amber-500/20 dark:bg-amber-950/20">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                Cancel Pro subscription?
              </p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                You'll keep Pro access until {periodEndDate ?? "the end of your billing period"}.
                After that, your account downgrades to Free (25 queries/day, 5 documents).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancel}
              disabled={isCanceling}
              id="confirm-cancel-subscription-btn"
              className="text-xs"
            >
              {isCanceling ? "Canceling…" : "Yes, cancel"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCancelConfirm(false)}
              className="text-xs text-zinc-600 dark:text-zinc-400"
            >
              Keep Pro
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        {isPendingCancel ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReactivate}
            disabled={isReactivating}
            id="reactivate-subscription-btn"
            className="text-xs gap-1.5"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isReactivating && "animate-spin")} />
            {isReactivating ? "Reactivating…" : "Reactivate Subscription"}
          </Button>
        ) : (
          !showCancelConfirm && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              id="cancel-subscription-btn"
              className="text-xs text-zinc-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 transition-colors underline underline-offset-2"
            >
              Cancel subscription
            </button>
          )
        )}
      </div>
    </div>
  );
}
