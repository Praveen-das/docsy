"use client";

import React, { useState } from "react";
import { CreditCard, ExternalLink, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaymentMethodInfo } from "./use-invoices";

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethodInfo | null;
  isLoading: boolean;
  isPro: boolean;
}

export function PaymentMethodCard({ paymentMethod, isLoading, isPro }: PaymentMethodCardProps) {
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const handleOpenPortal = async () => {
    setIsOpeningPortal(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };

      if (data.url) {
        window.location.href = data.url;
      } else {
        setPortalError(
          data.error ?? "Customer portal is currently unavailable. Please contact support."
        );
        setIsOpeningPortal(false);
      }
    } catch {
      setPortalError("Network error while connecting to Stripe. Please try again.");
      setIsOpeningPortal(false);
    }
  };

  const cardBrand = paymentMethod?.brand ? paymentMethod.brand.toUpperCase() : "Card";
  const last4 = paymentMethod?.last4 ? `•••• ${paymentMethod.last4}` : "No card on file";
  const expDate =
    paymentMethod?.expMonth && paymentMethod?.expYear
      ? `Expires ${String(paymentMethod.expMonth).padStart(2, "0")}/${String(paymentMethod.expYear).slice(-2)}`
      : null;

  return (
    <div className="rounded-2xl border interactive-tile p-5 sm:p-6 shadow-xl shadow-black/20 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">Payment Method</h3>
            <p className="text-[12px] text-zinc-400">
              Manage your default payment card and billing credentials.
            </p>
          </div>
        </div>

        {isPro && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenPortal}
            disabled={isOpeningPortal}
            className="h-8 px-3 text-xs gap-1.5 border-white/10 hover:bg-white/[0.08] text-zinc-200 active:scale-[0.98] self-start sm:self-auto shrink-0"
          >
            {isOpeningPortal ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Redirecting…</span>
              </>
            ) : (
              <>
                <span>Manage in Stripe</span>
                <ExternalLink className="h-3 w-3" />
              </>
            )}
          </Button>
        )}
      </div>

      {portalError && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>{portalError}</span>
        </div>
      )}

      {/* Body */}
      {isLoading ? (
        <div className="h-14 animate-pulse rounded-xl bg-white/[0.03] border border-white/[0.05]" />
      ) : isPro ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-12 items-center justify-center rounded-lg bg-white/[0.05] border border-white/10 font-mono text-[11px] font-bold text-white tracking-wider">
              {cardBrand.slice(0, 4)}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-white font-mono">{last4}</span>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-3 w-3" />
                  Primary
                </span>
              </div>
              <p className="text-[11.5px] text-zinc-500">
                {expDate ? expDate : "Stored securely via Stripe PCI-DSS Level 1"}
                {paymentMethod?.email ? ` • ${paymentMethod.email}` : ""}
              </p>
            </div>
          </div>

          <span className="text-[11px] text-zinc-500">
            Encrypted end-to-end
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-zinc-300">Free Tier Account</p>
            <p className="text-[11.5px] text-zinc-500">
              No credit card required for standard document intelligence features.
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">Zero charges</span>
        </div>
      )}
    </div>
  );
}
