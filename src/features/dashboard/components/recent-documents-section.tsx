import React from "react";
import { FileText } from "lucide-react";
import { DashboardSectionHeader } from "./dashboard-section-header";
import { RecentDocumentCard } from "./recent-document-card";
import { Document } from "@/types";

export interface DashboardDocumentItem {
  id: string;
  originalName: string;
  pageCount: number;
  fileSize: number;
  timeText: string;
  isReal: boolean;
}

export interface RecentDocumentsSectionProps {
  documents: (Document | (DashboardDocumentItem & Partial<Document>))[];
  onOpenDoc: (docId: string, isReal: boolean) => void;
}

export function RecentDocumentsSection({ documents, onOpenDoc }: RecentDocumentsSectionProps) {
  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
      <DashboardSectionHeader
        title="Recent Documents"
        href="/documents"
        icon={FileText}
        viewAllHref="/documents"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {documents.map((doc) => (
          <RecentDocumentCard key={doc.id} document={doc} onOpenDoc={onOpenDoc} />
        ))}
      </div>
    </div>
  );
}
