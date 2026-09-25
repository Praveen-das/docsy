"use client";

import React from "react";
import { Download, ExternalLink, Receipt, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { InvoiceItem } from "./use-invoices";

interface InvoicesTableProps {
  invoices: InvoiceItem[];
  isLoading: boolean;
  isPro: boolean;
}

export function InvoicesTable({ invoices, isLoading, isPro }: InvoicesTableProps) {
  const formatDate = (unixSeconds: number) => {
    return new Date(unixSeconds * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAmount = (cents: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  return (
    <div className="rounded-2xl border interactive-tile p-5 sm:p-6 shadow-xl shadow-black/20 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">Invoices & Receipts</h3>
            <p className="text-[12px] text-zinc-400">
              Official tax invoices and past payment history for your account.
            </p>
          </div>
        </div>

        {invoices.length > 0 && (
          <span className="text-[11px] font-mono text-zinc-400">
            {invoices.length} {invoices.length === 1 ? "record" : "records"}
          </span>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-3 py-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.04] bg-white/[0.02] animate-pulse"
            >
              <div className="space-y-2">
                <div className="h-3.5 w-28 rounded bg-white/10" />
                <div className="h-2.5 w-20 rounded bg-white/5" />
              </div>
              <div className="h-7 w-24 rounded bg-white/10" />
            </div>
          ))}
        </div>
      ) : invoices.length === 0 ? (
        /* Empty State */
        <div className="py-8 text-center space-y-3">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-500">
            <Receipt className="h-5 w-5 stroke-[1.5]" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-xs font-semibold text-zinc-300">No invoices yet</p>
            <p className="text-[11.5px] text-zinc-500 leading-relaxed">
              {isPro
                ? "Your first invoice will appear here once your billing cycle completes or upon renewal."
                : "You are currently on the Free tier. When you upgrade to Pro, receipts will be archived here."}
            </p>
          </div>
        </div>
      ) : (
        /* Invoices List */
        <div className="divide-y divide-white/[0.04] overflow-x-auto">
          {invoices.map((inv) => {
            const isPaid = inv.status === "paid";
            return (
              <div
                key={inv.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 first:pt-1 last:pb-1 group transition-colors"
              >
                {/* Left: Info */}
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs",
                      isPaid
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    )}
                  >
                    {isPaid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-white font-mono">
                        {inv.number ?? inv.id.slice(0, 14)}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border tracking-wider",
                          isPaid
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        )}
                      >
                        {inv.status ?? "Processed"}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-zinc-500">
                      Billed on {formatDate(inv.created)}
                    </p>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-10 sm:pl-0">
                  <span className="text-sm font-semibold font-mono text-zinc-200">
                    {formatAmount(inv.amountPaid, inv.currency)}
                  </span>

                  <div className="flex items-center gap-2">
                    {inv.pdfUrl && (
                      <a
                        href={inv.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-[11px] gap-1.5 border-white/10 hover:bg-white/[0.08] text-zinc-300 active:scale-[0.98]"
                        >
                          <Download className="h-3 w-3" />
                          <span>PDF</span>
                        </Button>
                      </a>
                    )}

                    {inv.hostedInvoiceUrl && (
                      <a
                        href={inv.hostedInvoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[11px] gap-1 text-zinc-400 hover:text-white active:scale-[0.98]"
                        >
                          <span>Receipt</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
