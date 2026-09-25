"use client";

import { useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { Document } from "@/types";
import { GlowCard } from "@/components/ui/glow-card";
import { RedPdfBadge } from "@/features/dashboard/components/red-pdf-badge";
import { DocumentActionButton } from "@/features/documents/components/document-action-button";
import { formatRelativeTime } from "@/lib/format-time";
import MenuButton from "@/components/ui/menu-button";
import { cn } from "@/lib/utils";
import { DocumentOptionsMenu } from "./document-options-menu";

export interface DocumentCardProps {
  document: Document;
  conversationCount: number;
  isChecking: boolean;
  onOpenConversations: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  onOpenDocument: (docId: string) => void;
}

export function DocumentCard({
  document: doc,
  conversationCount,
  isChecking,
  onOpenConversations,
  onDelete,
  onOpenDocument,
}: DocumentCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isProcessing = doc.status !== "READY" && doc.status !== "FAILED";
  const fileSizeMb = (doc.fileSize / (1024 * 1024)).toFixed(1);

  return (
    <GlowCard
      className={cn(
        "p-4 sm:p-5 rounded-[22px] sm:rounded-2xl flex-col justify-between items-stretch transition-all duration-200",
        isMenuOpen ? "z-20" : "z-10",
      )}
    >
      <div className="relative w-full">
        {/* Card Header: 3D Red PDF Badge + File Metadata + 3-Dots Options */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <RedPdfBadge className="shrink-0" />

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white text-[14px] truncate leading-snug group-hover:text-[#f8fafc] transition-colors">
                {doc.originalName}
              </h3>

              <div className="mt-1 text-[12px] text-[#818ea8] font-normal leading-tight">
                <span>{doc.pageCount || 1} pages</span>
                <span className="mx-1 text-[#525f7a]">•</span>
                <span>{fileSizeMb} MB</span>
              </div>

              <div className="mt-0.5 text-[11.5px] text-[#6b7794] font-normal">
                Uploaded {formatRelativeTime(doc.createdAt)}
              </div>
            </div>
          </div>

          <div className="relative shrink-0 z-10">
            <MenuButton onClick={() => setIsMenuOpen(!isMenuOpen)} />
            <DocumentOptionsMenu
              isOpen={isMenuOpen}
              document={doc}
              onOpenConversations={onOpenConversations}
              onDelete={onDelete}
              onClose={() => setIsMenuOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* Snippet / Status Description */}
      <div className="mt-3 text-[12px] text-[#818ea8] line-clamp-2 leading-relaxed min-h-[36px]">
        {isProcessing ? (
          <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
            <span>Analyzing document contents...</span>
          </span>
        ) : doc.status === "FAILED" ? (
          <span className="text-rose-400 font-normal leading-snug">
            {doc.error || (
              <>
                Upload failed: file not found in storage.
                <br />
                Please re-upload.
              </>
            )}
          </span>
        ) : (
          <span className="text-[#818ea8]">
            Architecture overview, reference sections, and conversation insights...
          </span>
        )}
      </div>

      {/* Card Bottom: Conversation Counter & Action Button */}
      <div className="mt-4 sm:mt-5 pt-3 sm:pt-3.5 border-t border-white/[0.06] flex items-center justify-between gap-2 relative z-10">
        <button
          type="button"
          onClick={() => onOpenConversations(doc)}
          className="flex items-center gap-2 text-[12px] text-[#818ea8] hover:text-white transition-colors cursor-pointer select-none"
          title="View conversations"
        >
          <MessageSquare className="h-3.5 w-3.5 stroke-[1.8]" />
          <span>
            {conversationCount} conversation{conversationCount === 1 ? "" : "s"}
          </span>
        </button>

        <DocumentActionButton document={doc} isChecking={isChecking} onOpen={onOpenDocument} size="sm" />
      </div>
    </GlowCard>
  );
}
