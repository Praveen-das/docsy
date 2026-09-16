"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface ConversationLayoutProps {
  chatPanel: React.ReactNode;
  pdfViewer?: React.ReactNode;
  isViewerOpen?: boolean;
  onToggleViewer?: () => void;
}

export function ConversationLayout({
  chatPanel,
  pdfViewer,
  isViewerOpen = true,
}: ConversationLayoutProps) {
  return (
    <div className="flex h-full w-full overflow-hidden bg-[#08090d]">
      {/* Center Chat Panel */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {chatPanel}
      </div>

      {/* Right Document Viewer Panel matching Image 2 */}
      {pdfViewer && isViewerOpen && (
        <div className="hidden lg:flex w-[460px] xl:w-[520px] 2xl:w-[580px] shrink-0 h-full overflow-hidden animate-in slide-in-from-right duration-200">
          {pdfViewer}
        </div>
      )}
    </div>
  );
}
