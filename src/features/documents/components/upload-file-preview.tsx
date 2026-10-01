"use client";

import React from "react";
import { Check, X, ShieldCheck } from "lucide-react";
import { GlowCard } from "@/components/ui/glow-card";

interface UploadFilePreviewProps {
  selectedFile: File;
  onRemove: () => void;
  onReplace: () => void;
}

export function UploadFilePreview({
  selectedFile,
  onRemove,
  onReplace,
}: UploadFilePreviewProps) {
  return (
    <GlowCard className="rounded-[20px] border border-white/[0.08] bg-[#0c1017]/80 p-3.5 sm:p-4 space-y-3">
      <div className="flex items-center justify-between text-xs font-medium text-[#818ea8]">
        <span>Selected Document</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-[#7d879d] hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer active:scale-[0.98]"
        >
          <X className="h-3.5 w-3.5" />
          <span>Remove</span>
        </button>
      </div>

      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 rounded-xl bg-white/[0.03] p-3 border border-white/[0.06]">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-mono text-[10px] font-bold tracking-wider">
            PDF
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[#f1f3f9] text-xs sm:text-sm truncate">
              {selectedFile.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] sm:text-xs text-[#818ea8]">
              <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
              <span className="text-white/20">•</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <Check className="h-3 w-3" />
                Verified format
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onReplace}
          className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[#c4cbdd] hover:text-white hover:bg-white/[0.08] transition-colors shrink-0 cursor-pointer active:scale-[0.98] self-end xs:self-center"
        >
          Replace
        </button>
      </div>

      <div className="flex items-center gap-2 text-[11.5px] text-[#7d879d] pt-0.5">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
        <span>Your document is confidential and accessible only inside your account.</span>
      </div>
    </GlowCard>
  );
}
