import React from "react";
import { cn } from "@/lib/utils";
import { ProcessingStatus } from "@/types";
import { Check, Loader2, Sparkles, UploadCloud } from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "ready"
    | "processing"
    | "failed"
    | "neutral"
    | "citation"
    | "ai"
    | "accent";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium rounded-full transition-all duration-150 select-none shadow-2xs";

  const variants = {
    ready:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    processing:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    failed:
      "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    neutral:
      "bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-white/10",
    citation:
      "bg-amber-100/80 text-amber-900 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
    ai:
      "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20",
    accent:
      "bg-[#0071e3] text-white font-semibold shadow-xs hover:bg-[#0077ed]",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 gap-1.5",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: ProcessingStatus;
  className?: string;
}) {
  switch (status) {
    case "READY":
      return (
        <span
          className={cn(
            "inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 select-none",
            className
          )}
        >
          <span>Ready</span>
        </span>
      );

    case "FAILED":
      return (
        <span
          className={cn(
            "inline-flex items-center text-xs font-medium text-rose-600 dark:text-rose-400 select-none",
            className
          )}
        >
          <span>Failed</span>
        </span>
      );

    case "UPLOADING":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200 shadow-2xs select-none dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
            className
          )}
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.7)]" />
          </span>
          <UploadCloud className="h-3 w-3 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Uploading...</span>
        </span>
      );

    case "EXTRACTING":
    case "CHUNKING":
    case "EMBEDDING":
    case "INDEXING":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200 shadow-2xs select-none dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
            className
          )}
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.85)]" />
          </span>
          <Loader2 className="h-3 w-3 text-amber-600 dark:text-amber-400 animate-spin shrink-0" />
          <span>Analyzing...</span>
        </span>
      );

    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 border border-zinc-200 select-none dark:bg-zinc-800 dark:text-zinc-300 dark:border-white/10",
            className
          )}
        >
          <span>{status}</span>
        </span>
      );
  }
}

export function AiModelBadge({
  modelName = "AI Assistant",
  className,
}: {
  modelName?: string;
  className?: string;
}) {
  return (
    <Badge variant="ai" size="sm" className={cn("font-medium tracking-wide", className)}>
      <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400 animate-pulse" />
      <span>{modelName}</span>
    </Badge>
  );
}
