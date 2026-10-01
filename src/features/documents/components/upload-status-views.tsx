"use client";

import React from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadProgressViewProps {
  progress: number;
}

export function UploadProgressView({ progress }: UploadProgressViewProps) {
  return (
    <div className="py-8 text-center space-y-4">
      <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_25px_rgba(99,102,241,0.2)]">
        <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.2] animate-spin text-indigo-400" />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-semibold text-[#f1f3f9]">Uploading Document...</h3>
        <p className="max-w-sm mx-auto text-xs text-[#818ea8] leading-relaxed">
          Transferring file securely to your private workspace.
        </p>
      </div>

      <div className="w-full max-w-xs mx-auto bg-white/[0.06] rounded-full h-1.5 overflow-hidden border border-white/[0.05]">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs font-mono text-indigo-400">{progress}%</p>
    </div>
  );
}

interface UploadFailedViewProps {
  errorMessage: string | null;
  onReset: () => void;
  onRetry: () => void;
}

export function UploadFailedView({
  errorMessage,
  onReset,
  onRetry,
}: UploadFailedViewProps) {
  return (
    <div className="py-6 text-center space-y-4">
      <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
        <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.2]" />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-semibold text-[#f1f3f9]">Upload Failed</h3>
        <p className="max-w-sm mx-auto text-xs text-rose-400 leading-relaxed px-4">
          {errorMessage || "Unable to process this document. Please check the file and try again."}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2.5 pt-3 border-t border-white/[0.06]">
        <Button variant="outline" size="sm" onClick={onReset}>
          Select Another File
        </Button>
        <Button variant="accent" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          <span>Retry Upload</span>
        </Button>
      </div>
    </div>
  );
}
