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
    <GlowRow className="p-3.5 sm:px-5 sm:py-4 flex-col sm:flex-row sm:items-center bg-(--surface-card)! justify-between gap-4">
      {/* Left: Badge + Title + Badges + Metadata */}
      <div className="flex items-center gap-4 min-w-0 flex-1 relative z-10">
        <RedPdfBadge className="shrink-0" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-white text-sm truncate">{doc.originalName}</span>

            {isProcessing && (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium select-none">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400 shrink-0" />
                <span>Analyzing...</span>
              </span>
            )}

            {doc.status === "READY" && !isOpened && <StatusBadge status="READY" />}

            {doc.status === "FAILED" && <StatusBadge status="FAILED" error={doc.error} />}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#818ea8]">
            <span>{doc.pageCount || 1} pages</span>
            <span className="text-[#525f7a]">•</span>
            <span>{fileSizeMb} MB</span>
            <span className="text-[#525f7a]">•</span>
            <span>{formatDate(doc.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Right: Favorite Button, Conversations Button, Action Button, Delete Button */}
      <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-center shrink-0 relative z-10">
        {onToggleFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(doc.id)}
            className={cn(
              "p-1.5 rounded-xl border border-white/[0.08] transition-all cursor-pointer",
              isFavorite
                ? "bg-amber-500/15 border-amber-500/30 text-amber-400 hover:text-amber-300 hover:bg-amber-500/25"
                : "bg-[#141824] text-[#818ea8] hover:text-white hover:border-white/15"
            )}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star
              className={cn(
                "h-4 w-4 transition-transform active:scale-90",
                isFavorite ? "fill-amber-400 text-amber-400" : ""
              )}
            />
          </button>
        )}

        <button
          type="button"
          onClick={() => onOpenConversations(doc)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-[#141824] text-xs text-[#818ea8] hover:text-white hover:border-white/15 transition-all cursor-pointer"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{conversationCount} conversations</span>
        </button>

        <DocumentActionButton
          document={doc}
          isChecking={isChecking}
          onCheckStatus={onCheckStatus}
          onReprocess={onReprocess}
          onOpen={onOpenDocument}
          size="md"
        />

        <button
          type="button"
          onClick={() => onDelete(doc)}
          className="p-1.5 text-[#818ea8] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
          title="Delete Document"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </GlowRow>
  );
}
