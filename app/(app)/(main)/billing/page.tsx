"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, CreditCard, Sparkles, ArrowRight, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/features/billing/use-subscription";
import { useInvoices } from "@/features/billing/use-invoices";
import { SubscriptionStatus } from "@/features/billing/subscription-status";
import { BillingUsageDashboard } from "@/features/billing/billing-usage-dashboard";
import { InvoicesTable } from "@/features/billing/invoices-table";
import { PaymentMethodCard } from "@/features/billing/payment-method-card";
import { PLANS } from "@/lib/stripe-plans";

const STORAGE_LIMIT_FREE_BYTES = 50 * 1024 * 1024; // 50 MB
const STORAGE_LIMIT_PRO_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

/**
 * /billing — Production-ready subscription, usage, and invoices center.
 *
 * Provides:
 * - Current plan overview and status
 * - Live multi-resource consumption dashboard (Queries, Documents, Storage)
 * - Pro subscription management (in-app cancel / reactivate)
 * - Payment method card with Stripe Customer Portal access
 * - Past invoices & receipts table with direct PDF download
 */
export default function BillingPage() {
  const { data: subscription, isLoading: isSubLoading } = useSubscription();
  const { data: invoicesData, isLoading: isInvoicesLoading } = useInvoices();
  const searchParams = useSearchParams();

  const checkoutResult = searchParams.get("checkout");

  const isPro = subscription?.plan === "pro";
  const planDef = isPro ? PLANS.pro : PLANS.free;

  const storageLimit = isPro ? STORAGE_LIMIT_PRO_BYTES : STORAGE_LIMIT_FREE_BYTES;
  const maxDocuments = planDef.maxDocuments ?? 5;
  const queriesLimit = subscription?.dailyQueriesLimit ?? planDef.dailyQueryLimit;
  const queriesUsed = subscription?.dailyQueriesUsed ?? 0;

  return (
    <div className="px-4 sm:px-8 py-7 max-w-7xl mt-8 lg:mt-8 mb-4 mx-auto space-y-7">
      {/* Checkout Success / Cancel Banners */}
      {checkoutResult === "success" && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-4 text-xs sm:text-sm text-emerald-300 shadow-lg shadow-emerald-950/20 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <span className="font-semibold text-white">Upgrade successful!</span> Your Pro subscription is now active.
            Your 200 daily queries and 2 GB storage are ready to use.
          </div>
        </div>
      )}

      {checkoutResult === "cancelled" && (
        <div className="flex items-center gap-3 rounded-2xl border interactive-tile p-4 text-xs sm:text-sm text-zinc-300">
          <CreditCard className="h-4 w-4 shrink-0 text-zinc-400" />
          <span>Checkout was cancelled. Your current plan remains unchanged.</span>
        </div>
      )}

      {/* Current Plan Card (Free Tier Banner when not Pro) */}
      {!isSubLoading && !isPro && (
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 via-[#0c1017] to-purple-950/20 p-5 sm:p-6 shadow-[0_0_24px_rgba(99,102,241,0.12)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/15 blur-2xl"
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold text-white tracking-tight">Free Tier Account</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-white/10 text-zinc-300 border border-white/10">
                  Standard Access
                </span>
              </div>
              <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                You are currently on the complimentary plan with 25 daily queries and 5 documents. Upgrade to Pro for
                200 daily queries, 200 documents, 2 GB storage, and priority queue processing.
              </p>
            </div>

            <Link href="/pricing">
              <Button
                variant="accent"
                size="sm"
                className="shrink-0 gap-2 text-xs font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-transform"
              >
                <Sparkles className="h-3.5 w-3.5 fill-current" />
                <span>Upgrade to Pro ($19/mo)</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Pro Subscription Status Card (for Pro Users) */}
      {!isSubLoading && isPro && subscription && <SubscriptionStatus subscription={subscription} />}

      {/* Live Resource Usage Dashboard (Queries, Docs, Storage) */}
      <BillingUsageDashboard
        queriesUsed={queriesUsed}
        queriesLimit={queriesLimit}
        maxDocuments={maxDocuments}
        storageLimitBytes={storageLimit}
        isPro={isPro}
        isLoading={isSubLoading}
      />

      {/* Payment Method & Invoices Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Method Card */}
        <PaymentMethodCard
          paymentMethod={invoicesData?.paymentMethod ?? null}
          isLoading={isInvoicesLoading}
          isPro={isPro}
        />

        {/* Invoices & Receipts Table */}
        <InvoicesTable invoices={invoicesData?.invoices ?? []} isLoading={isInvoicesLoading} isPro={isPro} />
      </div>
    </div>
  );
}
