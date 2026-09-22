"use client";

import React from "react";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Document } from "@/types";

export interface ActiveDocumentBannerProps {
  document?: Document;
  documentName: string;
  isCollapsed: boolean;
}

export function ActiveDocumentBanner({ document, documentName, isCollapsed }: ActiveDocumentBannerProps) {
  const pageCount = document?.pageCount || 24;
  const fileSizeMb = document?.fileSize ? (document.fileSize / (1024 * 1024)).toFixed(1) : "3.2";

  if (isCollapsed) {
    return (
      <div className="flex justify-center py-2">
        <div
          title={documentName}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ef4444] text-white shadow-xs cursor-pointer"
        >
          <span className="text-[10px] font-black uppercase font-sans">PDF</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 select-none">
      {/* Section Header matching Image 2: "CURRENT DOCUMENT" */}
      <div className=" px-4 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">CURRENT DOCUMENT</div>

      {/* Elevated Card matching Image 2 */}
      <div className="gap-2 rounded-2xl py-2 px-4 space-y-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Red PDF Badge */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ef4444] text-white shadow-xs">
            <span className="text-[10px] font-black uppercase font-sans">PDF</span>
          </div>

          {/* Doc Title & Specs */}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate" title={documentName}>
              {documentName}
            </p>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5">{pageCount} pages</p>
          </div>
        </div>
      </div>
    </div>
  );
}
