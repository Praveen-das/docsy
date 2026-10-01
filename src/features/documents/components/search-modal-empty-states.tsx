"use client";

import React from "react";
import { Search, AlertCircle, Loader2 } from "lucide-react";

interface SearchModalEmptyStatesProps {
  isLoading: boolean;
  query: string;
  searchQuery: string;
}

export function SearchModalEmptyStates({
  isLoading,
  query,
  searchQuery,
}: SearchModalEmptyStatesProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-[#8b95a8]">
        <Loader2 className="h-7 w-7 animate-spin text-indigo-400 mb-2" />
        <p className="text-xs sm:text-[13.5px] font-medium">Loading...</p>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="py-12 sm:py-16 text-center select-none">
        <div className="mx-auto flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06] text-[#727f9d] mb-3 shadow-inner">
          <Search className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <h3 className="text-xs sm:text-sm font-semibold text-[#f1f3f9]">Search Docsy</h3>
        <p className="text-[11px] sm:text-xs text-[#7d879d] mt-1 max-w-xs mx-auto leading-relaxed px-4">
          Type to search across all uploaded documents and past conversations.
        </p>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 text-center select-none">
      <AlertCircle className="mx-auto h-7 w-7 sm:h-8 sm:w-8 text-[#727f9d] mb-2" />
      <p className="text-xs sm:text-sm font-medium text-[#f1f3f9]">No results found</p>
      <p className="text-[11px] sm:text-xs text-[#7d879d] mt-1 px-4">
        No documents or conversations match &ldquo;{searchQuery}&rdquo;.
      </p>
    </div>
  );
}
