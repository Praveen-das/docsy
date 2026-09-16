"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Document } from "@/types";

export interface ActiveDocumentBannerProps {
  document?: Document;
  documentName: string;
  isCollapsed: boolean;
  onOpenViewer?: () => void;
}

export function ActiveDocumentBanner({
  document,
  documentName,
  isCollapsed,
  onOpenViewer,
}: ActiveDocumentBannerProps) {
  const pageCount = document?.pageCount || 24;
  const fileSizeMb = document?.fileSize
    ? (document.fileSize / (1024 * 1024)).toFixed(1)
    : "3.2";

  if (isCollapsed) {
    return (
      <div className="flex justify-center py-2">
        <div
          title={documentName}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ef4444] text-white shadow-xs cursor-pointer"
          onClick={onOpenViewer}
        >
          <span className="text-[10px] font-black uppercase font-sans">PDF</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 select-none">
      {/* Section Header matching Image 2: "CURRENT DOCUMENT" */}
      <div className="px-1 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
        CURRENT DOCUMENT
      </div>

      {/* Elevated Card matching Image 2 */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0d0f17] p-3 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Red PDF Badge */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ef4444] text-white shadow-xs">
            <span className="text-[10px] font-black uppercase font-sans">PDF</span>
          </div>

          {/* Doc Title & Specs */}
          <div className="min-w-0 flex-1">
            <p
              className="text-xs font-semibold text-white truncate"
              title={documentName}
            >
              {documentName}
            </p>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5">
              {pageCount} pages • {fileSizeMb} MB
            </p>
          </div>
        </div>

        {/* Action Button: "Open in viewer" */}
        <button
          type="button"
          onClick={onOpenViewer}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/5 text-xs font-medium transition-colors cursor-pointer"
        >
          <span>Open in viewer</span>
          <ExternalLink className="h-3 w-3 text-zinc-400" />
        </button>
      </div>
    </div>
  );
}
