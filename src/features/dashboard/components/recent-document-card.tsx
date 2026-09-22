"use client";

import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import { GlowCard } from "@/components/ui/glow-card";
import { RedPdfBadge } from "./red-pdf-badge";
import MenuButton from "@/components/ui/menu-button";
import { DocumentOptions } from "@/features/documents/components/document-options-button";
import { Document } from "@/types";
import { DocumentOptionsMenu } from "@/features/documents/components/document-options-menu";

export interface RecentDocumentCardProps {
  document: Document;
  onOpenDoc: (docId: string, isReal: boolean) => void;
  className?: string;
}

/**
 * Reusable Recent Document Card matching Docsy Design System:
 * Features dynamic mouse spotlight, specular highlights, photorealistic 3D Red PDF Badge,
 * and responsive tactile interaction.
 */
export function RecentDocumentCard({ document: doc, onOpenDoc, className }: RecentDocumentCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <GlowCard onClick={() => onOpenDoc(doc.id, doc.status === "READY")} className={className}>
      <div className="flex items-center gap-4 min-w-0 flex-1 relative z-10">
        <RedPdfBadge />

        <div className="min-w-0 flex-1">
          <h4 className="text-[14px] font-medium text-[#f1f5f9] truncate transition-colors leading-tight">
            {doc.originalName}
          </h4>
          <p className="text-[13px] text-[#818ea8] mt-1.5 truncate font-normal tracking-tight">
            {doc.pageCount} pages <span className="inline-block mx-1.5 text-[#525f7a] text-[10px] align-middle">•</span>{" "}
            {(doc.fileSize / (1024 * 1024)).toFixed(1)} MB
          </p>
          <p className="text-[12.5px] text-[#6b7794] mt-1 font-normal tracking-tight">{doc.updatedAt}</p>
        </div>
      </div>

      <div className="relative shrink-0 z-10">
        <MenuButton onClick={() => setIsMenuOpen(!isMenuOpen)} />
        <DocumentOptionsMenu
          isOpen={isMenuOpen}
          document={doc}
          onOpenConversations={() => onOpenDoc(doc.id, doc.status === "READY")}
          onClose={() => setIsMenuOpen(false)}
        />
      </div>
    </GlowCard>
  );
}
