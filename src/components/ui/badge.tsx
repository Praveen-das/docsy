import React from "react";
import { cn } from "@/lib/utils";
import { ProcessingStatus } from "@/types";
import { Check, Loader2, Sparkles, UploadCloud, AlertCircle } from "lucide-react";

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
      "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/15",
    processing:
      "bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/15",
    failed:
      "bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/15",
    neutral:
      "bg-zinc-100 text-zinc-600 border border-zinc-200/80 dark:bg-white/5 dark:text-zinc-400 dark:border-white/5",
    citation:
      "bg-amber-50 text-amber-800 border border-amber-200/70 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
    ai:
      "bg-zinc-100 text-zinc-800 border border-zinc-200 dark:bg-white/5 dark:text-zinc-200 dark:border-white/10",
    accent:
      "bg-zinc-900 text-white font-medium shadow-2xs dark:bg-white/10 dark:text-zinc-100 dark:border dark:border-white/10",
  };

  const sizes = {
    sm: "text-[10px] font-mono px-1.5 py-0.5 gap-1 leading-none",
    md: "text-xs px-2 py-0.5 gap-1.5",
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
  error,
  className,
}: {
  status: ProcessingStatus;
  error?: string | null;
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

    case "FAILED": {
      const isUploadFailure =
        Boolean(error) &&
        (error!.toLowerCase().includes("upload") ||
          error!.toLowerCase().includes("storage") ||
          error!.toLowerCase().includes("file not found") ||
          error!.toLowerCase().includes("incomplete"));

      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 select-none",
            className
          )}
          title={error || undefined}
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{isUploadFailure ? "Upload Incomplete" : "Failed"}</span>
        </span>
      );
    }

    case "UPLOADING":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 border border-zinc-200/80 shadow-2xs select-none dark:bg-white/5 dark:text-zinc-200 dark:border-white/5",
            className
          )}
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-zinc-600 dark:bg-zinc-300" />
          </span>
          <UploadCloud className="h-3 w-3 text-zinc-700 dark:text-zinc-300 shrink-0" />
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
            "inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 border border-amber-500/20 shadow-2xs select-none dark:text-amber-400",
            className
          )}
        >
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
