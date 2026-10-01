"use client";

import React from "react";
import { FileText, MessageSquare, ArrowRight } from "lucide-react";
import type { Document, Conversation } from "@/types";
import { GlowCard } from "@/components/ui/glow-card";
import { formatRelativeTime } from "@/lib/format-time";
import { formatFileSize } from "@/lib/utils";

export function SearchDocumentResultItem({
  doc,
  convCount,
  onSelect,
}: {
  doc: Document;
  convCount: number;
  onSelect: (doc: Document) => void;
}) {
  const isReady = doc.status === "READY" || !doc.status;

  return (
    <GlowCard
      onClick={() => onSelect(doc)}
      hasHoverEffect={false}
      className="group relative flex items-center justify-between rounded-xl sm:rounded-2xl p-2.5 sm:p-3 transition-all duration-150 cursor-pointer active:scale-[0.99]"
    >
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 pr-2 flex-1">
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#171b2e] border border-white/[0.08] text-[#a3b8fc] group-hover:scale-105 transition-transform shadow-inner">
          <FileText className="h-4 w-4 stroke-[1.8]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="truncate text-xs sm:text-[13.5px] font-semibold text-[#f1f3f9] group-hover:text-white transition-colors">
              {doc.originalName}
            </span>
            {!isReady && (
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[9.5px] sm:text-[10px] font-medium text-amber-400 shrink-0">
                {doc.status}
              </span>
            )}
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-1 sm:gap-2 text-[10.5px] sm:text-[11.5px] text-[#7d879d]">
            <span>{doc.pageCount || 1} pgs</span>
            <span>•</span>
            <span>{formatFileSize(doc.fileSize)}</span>
            <span>•</span>
            <span>{formatRelativeTime(doc.createdAt || doc.updatedAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {convCount > 0 && (
          <div className="hidden xs:flex items-center gap-1 text-[11px] text-[#7d879d] bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded-lg">
            <MessageSquare className="h-3 w-3 text-[#8b95a8]" />
            <span>{convCount}</span>
          </div>
        )}
        <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white/[0.04] text-[#7d879d] border border-white/[0.06] group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">
          <ArrowRight className="h-3 w-3 sm:h-3.5 w-3.5" />
        </div>
      </div>
    </GlowCard>
  );
}

export function SearchConversationResultItem({
  conv,
  linkedDoc,
  onSelect,
}: {
  conv: Conversation;
  linkedDoc?: Document;
  onSelect: (conv: Conversation) => void;
}) {
  return (
    <GlowCard
      onClick={() => onSelect(conv)}
      hasHoverEffect={false}
      className="group relative flex items-center justify-between rounded-xl sm:rounded-2xl p-2.5 sm:p-3 transition-all duration-150 cursor-pointer active:scale-[0.99]"
    >
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 pr-2 flex-1">
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform shadow-inner">
          <MessageSquare className="h-4 w-4 stroke-[1.8]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="truncate text-xs sm:text-[13.5px] font-semibold text-[#f1f3f9] group-hover:text-white transition-colors">
              {conv.title}
            </span>
          </div>

          {conv.lastMessageSnippet && (
            <p className="truncate text-[11px] sm:text-[12px] text-[#818ea8] mt-0.5">
              {conv.lastMessageSnippet}
            </p>
          )}

          <div className="mt-0.5 flex flex-wrap items-center gap-1 sm:gap-2 text-[10.5px] sm:text-[11.5px] text-[#7d879d]">
            {linkedDoc && (
              <>
                <span className="text-indigo-400/90 truncate max-w-[150px]">
                  {linkedDoc.originalName}
                </span>
                <span>•</span>
              </>
            )}
            <span>{formatRelativeTime(conv.updatedAt)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white/[0.04] text-[#7d879d] border border-white/[0.06] group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all">
          <ArrowRight className="h-3 w-3 sm:h-3.5 w-3.5" />
        </div>
      </div>
    </GlowCard>
  );
}
