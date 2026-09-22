"use client";

import React from "react";
import { FileText } from "lucide-react";

export function DocumentsEmptyState() {
  return (
    <div className="rounded-[22px] border border-dashed border-white/10 bg-[#0c1017]/60 p-12 text-center backdrop-blur-md will-change-transform">
      <FileText className="mx-auto h-8 w-8 text-[#818ea8] mb-2" />
      <p className="text-sm font-semibold text-white">No matching documents found</p>
      <p className="text-xs text-[#818ea8] mt-1">Try adjusting your search query or filter settings.</p>
    </div>
  );
}
