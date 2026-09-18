import React from "react";
import { MessageSquare, FileText, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { handleGlowMouseEnter, handleGlowMouseMove, handleGlowMouseLeave } from "@/lib/interactive-glow";
import { DashboardSectionHeader } from "./dashboard-section-header";

export interface DashboardConversationItem {
  id: string;
  title: string;
  docName: string;
  docId: string;
  preview: string;
  timeText: string;
  isActive: boolean;
  isReal: boolean;
}

export interface RecentConversationsSectionProps {
  conversations: DashboardConversationItem[];
  onOpenConv: (convId: string, docId: string, isReal: boolean) => void;
}

export function RecentConversationsSection({ conversations, onOpenConv }: RecentConversationsSectionProps) {
  return (
    <div className="space-y-4 pt-2">
      <DashboardSectionHeader
        title="Recent Conversations"
        href="/conversations"
        icon={MessageSquare}
        viewAllHref="/conversations"
      />

      <div className="space-y-3">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onOpenConv(conv.id, conv.docId, conv.isReal)}
            onMouseEnter={handleGlowMouseEnter}
            onMouseMove={handleGlowMouseMove}
            onMouseLeave={handleGlowMouseLeave}
            className={cn(
              "group relative flex items-center justify-between gap-4 rounded-2xl p-2.5 transition-[border-color,background-color] duration-200 cursor-pointer",
              "border border-white/[0.06] hover:active-row-glow hover:border-indigo-400/35",
            )}
          >
            {/* Left: Chat Icon & Title */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1 relative z-10">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  "bg-indigo-300/4  text-[#b8c3ee]",
                )}
              >
                <MessageSquare className="h-4 w-4" />
              </div>

              {/* Title */}
              <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[220px] shrink-0 transition-colors">
                {conv.title}
              </span>

              {/* Linked Document Pill Badge matching reference image */}
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-300/4 text-[11px] text-[#8fa2d4] shrink-0">
                <FileText className="h-3 w-3 text-[#728bd6]" />
                <span className="truncate max-w-[150px]">{conv.docName}</span>
              </div>

              {/* Snippet preview matching reference image */}
              <span className="hidden lg:inline text-xs text-(--sidebar-nav-muted) truncate flex-1 min-w-0 font-normal">
                {conv.preview}
              </span>
            </div>

            {/* Right: Relative Timestamp & Menu */}
            <div className="flex items-center gap-3 shrink-0 relative z-10">
              <span className="text-xs text-zinc-500">{conv.timeText}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenConv(conv.id, conv.docId, conv.isReal);
                }}
                className="rounded-lg p-1 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
