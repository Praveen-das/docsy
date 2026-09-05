"use client";

import React from "react";
import { FileText } from "lucide-react";

export interface ActiveDocumentBannerProps {
  documentName: string;
  isCollapsed: boolean;
}

export function ActiveDocumentBanner({
  documentName,
  isCollapsed,
}: ActiveDocumentBannerProps) {
  return (
    <div className="space-y-0.5">
      {!isCollapsed && (
        <div className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Active Document
        </div>
      )}

      <div
        className="group relative flex h-9 items-center rounded-md text-[13px] font-medium p-0 w-full overflow-hidden text-zinc-700 dark:text-zinc-300"
        title={isCollapsed ? documentName : undefined}
      >
        <div className="w-10 h-9 flex items-center justify-center shrink-0">
          <FileText className="h-[17px] w-[17px] text-zinc-500 dark:text-zinc-400" />
        </div>
        {!isCollapsed && (
          <div className="flex items-center justify-between min-w-0 flex-1 pr-3">
            <span className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              {documentName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
