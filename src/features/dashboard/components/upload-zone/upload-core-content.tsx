"use client";

import React from "react";
import { Plus, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { UploadDocIcon } from "./upload-doc-icon";

export type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

export interface UploadCoreContentProps {
  uploadState: UploadState;
  isHovered: boolean;
  isDragging: boolean;
  fileName: string;
  progress: number;
  errorMessage: string | null;
  onTriggerUpload: (e?: React.SyntheticEvent) => void;
  onReset: () => void;
}

export function UploadCoreContent({
  uploadState,
  isHovered,
  isDragging,
  fileName,
  progress,
  errorMessage,
  onTriggerUpload,
  onReset,
}: UploadCoreContentProps) {
  const isUploading = uploadState === "uploading";
  const isSuccess = uploadState === "success";
  const isError = uploadState === "error";

  return (
    <div className="relative z-20 flex flex-col items-center justify-center text-center px-3 sm:px-6 py-4 sm:py-8 max-w-[340px]">
      {/* State 1: IDLE or DRAGGING */}
      {!isUploading && !isSuccess && !isError && (
        <>
          {/* 1. Minimal Glowing Document Icon */}
          <UploadDocIcon isHovered={isHovered} isDragging={isDragging} />

          {/* 2. Primary Heading */}
          <h2 className="mt-2.5 sm:mt-3.5 text-lg sm:text-[21px] font-bold tracking-tight text-white leading-tight">
            {isDragging ? "Drop your PDF here" : "Add a document"}
          </h2>

          {/* 3. Supporting Text */}
          <p className="mt-1 text-xs sm:text-[13px] text-zinc-400 font-normal leading-normal">
            {isDragging ? "Release to start processing" : "Drop a PDF here, or click to upload"}
          </p>

          {/* 4. Prominent "Upload PDF" Button */}
          <div className="mt-3 sm:mt-5">
            <button
              type="button"
              onClick={onTriggerUpload}
              className={`group/btn relative inline-flex items-center justify-center px-6 py-2.5 sm:px-7 sm:py-2.5 rounded-full font-medium text-xs sm:text-sm text-white transition-all duration-200 cursor-pointer active:scale-95 ${
                isDragging
                  ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 shadow-[0_4px_24px_rgba(168,85,247,0.7)]"
                  : "bg-gradient-to-r from-[#4f46e5] via-[#4338ca] to-[#3b82f6] shadow-[0_4px_20px_rgba(79,70,229,0.55)] hover:shadow-[0_6px_28px_rgba(99,102,241,0.8)] hover:brightness-110"
              }`}
            >
              <Plus className="w-4 h-4 mr-1.5 shrink-0 stroke-[2.5]" />
              <span className="font-semibold tracking-wide">Upload PDF</span>
            </button>
          </div>

          {/* 5. Small Supporting Metadata */}
          <p className="mt-2 sm:mt-3 text-[11px] sm:text-xs text-zinc-400/80 font-normal tracking-wide">
            Supports PDF · Max 10MB
          </p>
        </>
      )}

      {/* State 2: UPLOADING */}
      {isUploading && (
        <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>

          <h2 className="mt-3 text-base sm:text-lg font-bold text-white tracking-tight">Uploading document...</h2>
          <p className="mt-1 text-xs text-zinc-400 truncate max-w-[240px]">{fileName}</p>

          {/* Progress Bar */}
          <div className="w-48 sm:w-56 h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-zinc-400 mt-1.5">{progress}%</span>
        </div>
      )}

      {/* State 3: SUCCESS */}
      {isSuccess && (
        <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 drop-shadow-[0_0_16px_rgba(52,211,153,0.5)]">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <h2 className="mt-3 text-base sm:text-lg font-bold text-white tracking-tight">Upload Complete!</h2>
          <p className="mt-1 text-xs text-zinc-400">Preparing conversation...</p>
        </div>
      )}

      {/* State 4: ERROR */}
      {isError && (
        <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 drop-shadow-[0_0_16px_rgba(244,63,94,0.5)]">
            <AlertCircle className="w-7 h-7" />
          </div>

          <h2 className="mt-3 text-base sm:text-lg font-bold text-rose-300 tracking-tight">Upload failed</h2>
          <p className="mt-1 text-xs text-zinc-400 max-w-[240px]">
            {errorMessage || "Unable to upload document. Please try again."}
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try again</span>
          </button>
        </div>
      )}
    </div>
  );
}
