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
            "inline-flex items-center gap-1.5 rounded-full border border-indigo-500/35 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-200 hover:text-white text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-[0.98]",
            isSm ? "px-3.5 py-1" : "px-4 py-1.5"
          )}
        >
          <span>Open</span>
          <ArrowRight className="h-3 w-3 text-indigo-400 stroke-[2]" />
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
          "inline-flex items-center gap-1.5 rounded-full border border-rose-500/35 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition-all cursor-pointer active:scale-[0.98]",
          isSm ? "px-3.5 py-1" : "px-4 py-1.5"
        )}
      >
        <RefreshCw className="h-3 w-3 stroke-[2]" />
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
        "inline-flex items-center gap-1.5 rounded-full border border-amber-500/35 bg-amber-500/10 text-amber-300 text-xs font-medium transition-all cursor-pointer active:scale-[0.98]",
        isSm ? "px-3.5 py-1" : "px-4 py-1.5"
      )}
    >
      <Loader2 className="h-3 w-3 animate-spin stroke-[2]" />
      <span>Checking</span>
    </button>
  );
}
