"use client";

import React, { useEffect, useMemo } from "react";
import { Sparkles, HardDrive, FileText, Clock } from "lucide-react";
import { useDocumentStore } from "@/stores/document-store";
import { cn } from "@/lib/utils";

interface BillingUsageDashboardProps {
  queriesUsed: number;
  queriesLimit: number;
  maxDocuments: number;
  storageLimitBytes: number;
  isPro: boolean;
  isLoading?: boolean;
}

export function formatStorageSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 MB";
  const kb = bytes / 1024;
  const mb = kb / 1024;
  const gb = mb / 1024;

  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  if (kb >= 1) return `${kb.toFixed(0)} KB`;
  return `${bytes} B`;
}

export function BillingUsageDashboard({
  queriesUsed,
  queriesLimit,
  maxDocuments,
  storageLimitBytes,
  isPro,
  isLoading = false,
}: BillingUsageDashboardProps) {
  const documents = useDocumentStore((state) => state.documents);
  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments);
  const isDocsLoading = useDocumentStore((state) => state.isLoading);

  useEffect(() => {
    if (documents.length === 0 && !isDocsLoading) {
      void fetchDocuments();
    }
  }, [documents.length, isDocsLoading, fetchDocuments]);

  const totalBytesUsed = useMemo(
    () => documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0),
    [documents]
  );

  const queryPercent = Math.min(100, Math.round((queriesUsed / (queriesLimit || 1)) * 100));
  const queriesRemaining = Math.max(0, queriesLimit - queriesUsed);

  const docCount = documents.length;
  const docPercent = maxDocuments > 0 ? Math.min(100, Math.round((docCount / maxDocuments) * 100)) : 0;
  const docsRemaining = Math.max(0, maxDocuments - docCount);

  const storagePercent = Math.min(
    100,
    Math.round((totalBytesUsed / (storageLimitBytes || 1)) * 100)
  );

  return (
    <div className="rounded-2xl border interactive-tile p-5 sm:p-6 shadow-xl shadow-black/20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">Resource Quotas & Usage</h3>
          <p className="text-[12px] text-zinc-400">
            Real-time consumption across AI queries, document storage, and capacity.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-mono text-zinc-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {isPro ? "Pro Tier Limits" : "Free Tier Limits"}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-4 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="h-3 w-1/3 rounded bg-white/10" />
              <div className="h-2 w-full rounded bg-white/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Daily AI Queries */}
          <div className="space-y-2.5 rounded-xl border border-white/[0.04] bg-white/[0.015] p-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="h-3 w-3" />
                </div>
                <span className="font-medium text-zinc-200">Daily Queries</span>
              </div>
              <span className="font-mono text-zinc-400">
                <span className="text-white font-semibold">{queriesUsed}</span> / {queriesLimit}
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden p-0.5">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  queryPercent >= 90
                    ? "bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                    : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_8px_rgba(99,102,241,0.35)]"
                )}
                style={{ width: `${Math.max(4, queryPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5">
              <span className="text-indigo-300 font-medium">{queriesRemaining} left today</span>
              <span className="inline-flex items-center gap-1 font-mono text-[10.5px]">
                <Clock className="h-3 w-3" />
                00:00 UTC reset
              </span>
            </div>
          </div>

          {/* 2. Document Library Quota */}
          <div className="space-y-2.5 rounded-xl border border-white/[0.04] bg-white/[0.015] p-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <FileText className="h-3 w-3" />
                </div>
                <span className="font-medium text-zinc-200">Documents</span>
              </div>
              <span className="font-mono text-zinc-400">
                <span className="text-white font-semibold">{docCount}</span> / {maxDocuments}
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden p-0.5">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  docPercent >= 90
                    ? "bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.35)]"
                )}
                style={{ width: `${Math.max(4, docPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5">
              <span className="text-cyan-300 font-medium">{docsRemaining} slots available</span>
              <span className="font-mono text-[10.5px]">{docPercent}% capacity</span>
            </div>
          </div>

          {/* 3. Storage Usage */}
          <div className="space-y-2.5 rounded-xl border border-white/[0.04] bg-white/[0.015] p-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <HardDrive className="h-3 w-3" />
                </div>
                <span className="font-medium text-zinc-200">Storage</span>
              </div>
              <span className="font-mono text-zinc-400">
                <span className="text-white font-semibold">{formatStorageSize(totalBytesUsed)}</span> /{" "}
                {formatStorageSize(storageLimitBytes)}
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden p-0.5">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  storagePercent >= 90
                    ? "bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                    : "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.35)]"
                )}
                style={{ width: `${totalBytesUsed > 0 ? Math.max(4, storagePercent) : 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-0.5">
              <span className="text-emerald-300 font-medium">
                {formatStorageSize(Math.max(0, storageLimitBytes - totalBytesUsed))} available
              </span>
              <span className="font-mono text-[10.5px]">{storagePercent}% used</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
