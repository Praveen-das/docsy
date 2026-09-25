"use client";

import React, { useState } from "react";
import { GlowCard } from "@/components/ui/glow-card";
import { RedPdfBadge } from "./red-pdf-badge";
import MenuButton from "@/components/ui/menu-button";
import { Document } from "@/types";
import { DocumentOptionsMenu } from "@/features/documents/components/document-options-menu";
import { formatRelativeTime } from "@/lib/format-time";
import { DashboardDocumentItem } from "./recent-documents-section";

export interface RecentDocumentCardProps {
  document: Document | (DashboardDocumentItem & Partial<Document>);
  onOpenDoc: (docId: string, isReal: boolean) => void;
  className?: string;
}

/**
 * Reusable Recent Document Card matching Docsy Design System:
 * Features dynamic mouse spotlight, specular highlights, photorealistic 3D Red PDF Badge,
 * formatted relative time, and responsive tactile mobile interaction.
 */
export function RecentDocumentCard({ document: doc, onOpenDoc, className }: RecentDocumentCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isReal = "isReal" in doc ? Boolean(doc.isReal) : doc.status === "READY";
  const isReady = ("status" in doc && doc.status === "READY") || isReal;

  const timeDisplay =
    ("timeText" in doc && doc.timeText)
      ? doc.timeText
      : formatRelativeTime(doc.updatedAt || doc.createdAt || "");

  const fileSizeMb = (doc.fileSize / (1024 * 1024)).toFixed(1);

  return (
    <GlowCard
      onClick={() => onOpenDoc(doc.id, isReady)}
      className={`p-3.5 sm:p-4 rounded-2xl flex-row items-center justify-between gap-3 transition-all duration-150 cursor-pointer active:scale-[0.98] ${className || ""}`}
    >
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1 relative z-10">
        <RedPdfBadge className="shrink-0 h-[44px] w-[36px] sm:h-[48px] sm:w-[38px]" />

        <div className="min-w-0 flex-1">
          <h4 className="text-[13.5px] sm:text-[14px] font-semibold text-[#f1f5f9] truncate transition-colors leading-tight group-hover:text-white">
            {doc.originalName}
          </h4>
          <p className="text-[12px] sm:text-[12.5px] text-[#818ea8] mt-1 truncate font-normal tracking-tight">
            {doc.pageCount || 1} pages <span className="inline-block mx-1 text-[#525f7a] text-[10px] align-middle">•</span>{" "}
            {fileSizeMb} MB
          </p>
          <p className="text-[11px] sm:text-[11.5px] text-[#6b7794] mt-0.5 font-normal tracking-tight">
            {timeDisplay}
          </p>
        </div>
      </div>

      {"status" in doc && (
        <div className="relative shrink-0 z-10">
          <MenuButton onClick={() => setIsMenuOpen(!isMenuOpen)} />
          <DocumentOptionsMenu
            isOpen={isMenuOpen}
            document={doc as Document}
            onOpenConversations={() => onOpenDoc(doc.id, isReady)}
            onClose={() => setIsMenuOpen(false)}
          />
        </div>
      )}
    </GlowCard>
  );
}
