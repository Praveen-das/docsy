"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { CreditCard, Receipt, ExternalLink } from "lucide-react";
import { currentUser } from "@/lib/mock-data";
import { useSubscription } from "@/features/billing/use-subscription";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import { PLANS } from "@/lib/stripe-plans";
import { PlanHeroCard } from "./billing/plan-hero-card";
import { UsageMeter } from "./billing/usage-meter";

export interface TabBillingProps {
  onClose?: () => void;
}

const STORAGE_LIMIT_FREE_BYTES = 50 * 1024 * 1024; // 50 MB
const STORAGE_LIMIT_PRO_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

export function TabBilling({ onClose }: TabBillingProps) {
  const { data: subscription } = useSubscription();
  const { data: documents = [] } = useDocuments();

  const isPro = subscription?.plan === "pro";
  const planDef = isPro ? PLANS.pro : PLANS.free;

  const queriesUsed = subscription?.dailyQueriesUsed ?? currentUser.dailyQueriesUsed;
  const queriesLimit = subscription?.dailyQueriesLimit ?? planDef.dailyQueryLimit;

  // Actual storage calculation aggregated across all indexed documents
  const totalBytesUsed = useMemo(() => documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0), [documents]);

  const storageLimitBytes = isPro ? STORAGE_LIMIT_PRO_BYTES : STORAGE_LIMIT_FREE_BYTES;

  const renewalDate = subscription?.planPeriodEnd
    ? new Date(subscription.planPeriodEnd).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-4 pt-2">
      {/* 1. Primary Plan Hero Card */}
      <PlanHeroCard subscription={subscription} onClose={onClose} />

      {/* 2. Daily Query Allowance */}
      <UsageMeter
        queriesUsed={queriesUsed}
        queriesLimit={queriesLimit}
      />

      {/* 3. Account Billing Meta & Invoices */}
      <div className="divide-y divide-white/[0.06]">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
              <CreditCard className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[13px] font-medium text-zinc-200 block">Billing Period</span>
              <span className="text-[11.5px] text-zinc-500">
                {isPro
                  ? renewalDate
                    ? `Renews on ${renewalDate}`
                    : "Active monthly subscription"
                  : "No renewal required • Free tier"}
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-zinc-400">{isPro ? "Monthly" : "Free"}</span>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
              <Receipt className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[13px] font-medium text-zinc-200 block">Invoices & Receipts</span>
              <span className="text-[11.5px] text-zinc-500">
                Download past tax invoices, view billing history, or update payment method
              </span>
            </div>
          </div>
          <Link
            href="/billing"
            onClick={onClose}
            className="rounded-full bg-white/[0.05] hover:bg-white/[0.10] text-zinc-300 border border-white/10 px-3 py-1 text-xs font-medium transition-colors active:scale-[0.98] inline-flex items-center gap-1.5 shrink-0"
          >
            <span>View</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
