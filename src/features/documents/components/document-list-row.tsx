"use client";

import React from "react";
import { MessageSquare, Trash2, Loader2, Star } from "lucide-react";
import { Document } from "@/types";
import { GlowRow } from "@/components/ui/glow-row";
import { RedPdfBadge } from "@/features/dashboard/components/red-pdf-badge";
import { StatusBadge } from "@/components/ui/badge";
import { DocumentActionButton } from "@/features/documents/components/document-action-button";
import { formatDate } from "@/lib/format-time";
import { cn } from "@/lib/utils";

export interface DocumentListRowProps {
  document: Document;
  conversationCount: number;
  isOpened: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (docId: string) => void;
  isChecking: boolean;
  onOpenConversations: (doc: Document) => void;
  onCheckStatus: (docId: string) => void;
  onReprocess: (docId: string) => void;
  onDelete: (doc: Document) => void;
  onOpenDocument: (docId: string) => void;
}

export function DocumentListRow({
  document: doc,
  conversationCount,
  isOpened,
  isFavorite = false,
  onToggleFavorite,
  isChecking,
  onOpenConversations,
  onCheckStatus,
  onReprocess,
  onDelete,
  onOpenDocument,
}: DocumentListRowProps) {
  const isProcessing = doc.status !== "READY" && doc.status !== "FAILED";
  const fileSizeMb = (doc.fileSize / (1024 * 1024)).toFixed(1);

  return (
    <GlowRow className="p-3.5 sm:px-5 sm:py-4 flex-col sm:flex-row sm:items-center bg-(--surface-card)! justify-between gap-3 sm:gap-4 rounded-2xl active:scale-[0.99] transition-all">
      {/* Top / Left: Badge + Title + Status Badges + Metadata */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1 relative z-10 w-full sm:w-auto">
        <RedPdfBadge className="shrink-0 h-[44px] w-[36px] sm:h-[48px] sm:w-[38px]" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-white text-[13.5px] sm:text-sm truncate max-w-[200px] xs:max-w-[260px] sm:max-w-none">
              {doc.originalName}
            </span>

            {isProcessing && (
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-amber-400 font-medium select-none">
                <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin text-amber-400 shrink-0" />
                <span>Analyzing...</span>
              </span>
            )}

            {doc.status === "READY" && !isOpened && <StatusBadge status="READY" />}

            {doc.status === "FAILED" && <StatusBadge status="FAILED" error={doc.error} />}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11.5px] sm:text-xs text-[#818ea8]">
            <span>{doc.pageCount || 1} pages</span>
            <span className="text-[#525f7a]">•</span>
            <span>{fileSizeMb} MB</span>
            <span className="text-[#525f7a]">•</span>
            <span>{formatDate(doc.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Bottom / Right: Favorite, Conversations Counter, Action Button, Delete Button */}
      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto shrink-0 relative z-10 pt-2 sm:pt-0 border-t border-white/[0.04] sm:border-t-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(doc.id)}
              className={cn(
                "flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl border border-white/[0.08] transition-all cursor-pointer active:scale-90",
                isFavorite
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-400 hover:text-amber-300 hover:bg-amber-500/25"
                  : "bg-[#141824] text-[#818ea8] hover:text-white hover:border-white/15"
              )}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star
                className={cn(
                  "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform",
                  isFavorite ? "fill-amber-400 text-amber-400" : ""
                )}
              />
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenConversations(doc)}
            className="flex items-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl border border-white/[0.08] bg-[#141824] text-[11px] sm:text-xs text-[#818ea8] hover:text-white hover:border-white/15 transition-all cursor-pointer active:scale-95"
          >
            <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>
              {conversationCount} <span className="hidden xs:inline">conversations</span>
            </span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <DocumentActionButton
            document={doc}
            isChecking={isChecking}
            onCheckStatus={onCheckStatus}
            onReprocess={onReprocess}
            onOpen={onOpenDocument}
            size="sm"
          />

          <button
            type="button"
            onClick={() => onDelete(doc)}
            className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 text-[#818ea8] hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer active:scale-90"
            title="Delete Document"
            aria-label="Delete Document"
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </GlowRow>
  );
}
