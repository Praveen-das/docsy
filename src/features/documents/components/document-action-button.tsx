"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, Loader2 } from "lucide-react";
import { Document } from "@/types";
import { cn } from "@/lib/utils";

export interface DocumentActionButtonProps {
  document: Document;
  isChecking?: boolean;
  onCheckStatus?: (docId: string) => void;
  onReprocess?: (docId: string) => void;
  onOpen?: (docId: string) => void;
  size?: "sm" | "md";
}

export function DocumentActionButton({
  document: doc,
  isChecking = false,
  onCheckStatus,
  onReprocess,
  onOpen,
  size = "md",
}: DocumentActionButtonProps) {
  const isSm = size === "sm";

  if (doc.status === "READY") {
    return (
      <Link href={`/conversation?doc=${doc.id}`} onClick={() => onOpen?.(doc.id)}>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#151928] hover:bg-[#1d2338] text-white hover:border-indigo-500/40 text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-[0.98]",
            isSm ? "px-3.5 py-1" : "px-3.5 py-1.5"
          )}
        >
          <span>Open</span>
          <ArrowRight className="h-3 w-3 text-[#a5b4fc]" />
        </button>
      </Link>
    );
  }

  if (doc.status === "FAILED") {
    return (
      <button
        type="button"
        onClick={() => onReprocess?.(doc.id)}
        className={cn(
          "inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition-all cursor-pointer",
          isSm ? "px-3.5 py-1" : "px-3.5 py-1.5"
        )}
      >
        <RefreshCw className="h-3 w-3" />
        <span>Retry</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onCheckStatus?.(doc.id)}
      disabled={isChecking}
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-medium transition-all cursor-pointer",
        isSm ? "px-3.5 py-1" : "px-3.5 py-1.5"
      )}
    >
      <Loader2 className="h-3 w-3 animate-spin" />
      <span>Checking</span>
    </button>
  );
}
