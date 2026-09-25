"use client";

import React from "react";
import { FileText } from "lucide-react";

export function DocumentsEmptyState() {
  return (
    <div className="rounded-[22px] border border-dashed border-white/10 bg-[#0c1017]/60 p-8 sm:p-12 text-center backdrop-blur-md will-change-transform">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06] mb-2 text-[#818ea8]">
        <FileText className="h-5 w-5 stroke-[1.8]" />
      </div>
      <p className="text-[13.5px] sm:text-sm font-semibold text-white">No matching documents found</p>
      <p className="text-[11.5px] sm:text-xs text-[#818ea8] mt-1 max-w-xs mx-auto">Try adjusting your search query or filter settings.</p>
    </div>
  );
}
