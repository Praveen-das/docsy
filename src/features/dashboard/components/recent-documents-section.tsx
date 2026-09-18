import React from "react";
import { FileText, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { handleGlowMouseEnter, handleGlowMouseMove, handleGlowMouseLeave } from "@/lib/interactive-glow";
import { RedPdfBadge } from "./red-pdf-badge";
import { DashboardSectionHeader } from "./dashboard-section-header";

export interface DashboardDocumentItem {
  id: string;
  originalName: string;
  pageCount: number;
  fileSize: number;
  timeText: string;
  isReal: boolean;
}

export interface RecentDocumentsSectionProps {
  documents: DashboardDocumentItem[];
  onOpenDoc: (docId: string, isReal: boolean) => void;
}

export function RecentDocumentsSection({ documents, onOpenDoc }: RecentDocumentsSectionProps) {
  return (
    <div className="space-y-4 pt-2">
      <DashboardSectionHeader title="Recent Documents" href="/documents" icon={FileText} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onOpenDoc(doc.id, doc.isReal)}
            onMouseEnter={handleGlowMouseEnter}
            onMouseMove={handleGlowMouseMove}
            onMouseLeave={handleGlowMouseLeave}
            className={cn(
              "group relative isolate flex items-center justify-between rounded-[22px] border border-white/[0.07] bg-(--surface-card) px-5 py-4",
              "hover:active-card-glow hover:border-indigo-400/35 hover:bg-[#10141f]",
              "transition-[border-color,background-color,box-shadow] duration-200 cursor-pointer shadow-lg shadow-black/30",
            )}
          >
            <div className="flex items-center gap-4 min-w-0 flex-1 relative z-10">
              <RedPdfBadge />

              <div className="min-w-0 flex-1">
                <h4 className="text-[14px] font-medium text-[#f1f5f9] truncate transition-colors leading-tight">
                  {doc.originalName}
                </h4>
                <p className="text-[13px] text-[#818ea8] mt-1.5 truncate font-normal tracking-tight">
                  {doc.pageCount} pages{" "}
                  <span className="inline-block mx-1.5 text-[#525f7a] text-[10px] align-middle">•</span>{" "}
                  {(doc.fileSize / (1024 * 1024)).toFixed(1)} MB
                </p>
                <p className="text-[12.5px] text-[#6b7794] mt-1 font-normal tracking-tight">{doc.timeText}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDoc(doc.id, doc.isReal);
              }}
              className="rounded-lg p-1.5 text-[#818ea8] hover:text-[#e2e8f0] hover:bg-white/5 transition-colors cursor-pointer shrink-0 ml-2 relative z-10"
              aria-label="Document options"
            >
              <MoreVertical className="h-4 w-4 stroke-[2]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
