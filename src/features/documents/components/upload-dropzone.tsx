"use client";

import React from "react";
import { UploadCloud, ShieldCheck, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowCard } from "@/components/ui/glow-card";

interface UploadDropzoneProps {
  isOffline: boolean;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadDropzone({
  isOffline,
  isDragging,
  setIsDragging,
  fileInputRef,
  onDrop,
  onFileChange,
}: UploadDropzoneProps) {
  return (
    <GlowCard
      onDragOver={(e) => {
        if (isOffline) return;
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        if (isOffline) return;
        onDrop(e);
      }}
      onClick={() => {
        if (isOffline) return;
        fileInputRef.current?.click();
      }}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-[20px] sm:rounded-[22px] p-6 sm:p-10 text-center transition-all cursor-pointer group select-none",
        isOffline && "opacity-60 cursor-not-allowed",
        isDragging
          ? "border-indigo-400/80 bg-indigo-950/25 scale-[0.99] shadow-[0_0_35px_rgba(99,102,241,0.25)]"
          : "border-white/[0.09] bg-[#0c1017]/60 hover:border-indigo-400/35 hover:bg-[#10141f]/80 active:scale-[0.995]",
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={onFileChange}
      />

      <div className="mx-auto flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)] group-hover:scale-105 group-hover:border-indigo-400/40 group-hover:bg-indigo-500/15 transition-all mb-3">
        <UploadCloud className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xs sm:text-sm font-semibold text-[#f1f3f9]">
          Drop your PDF here, or{" "}
          <span className="text-indigo-400 underline underline-offset-2 group-hover:text-indigo-300 font-semibold transition-colors">
            browse files
          </span>
        </h3>
        <p className="text-[11px] sm:text-xs text-[#818ea8]">
          Searchable PDF documents up to 10 MB
        </p>
      </div>

      <div className="mt-3.5 sm:mt-4.5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[10.5px] sm:text-[11px] text-[#818ea8] font-medium">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.03] px-2.5 py-1 text-[#8fa2d4] border border-white/[0.08]">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          Private & Secure
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.03] px-2.5 py-1 text-[#8fa2d4] border border-white/[0.08]">
          <Bookmark className="h-3 w-3 text-indigo-400" />
          Page-Level Citations
        </span>
      </div>
    </GlowCard>
  );
}
