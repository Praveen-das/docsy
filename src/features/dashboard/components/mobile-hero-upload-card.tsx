"use client";

import React from "react";
import { Plus, ChevronRight, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useDocumentUpload } from "../hooks/use-document-upload";

export function MobileHeroUploadCard() {
  const {
    fileInputRef,
    uploadState,
    setUploadState,
    progress,
    errorMessage,
    fileName,
    uploadFile,
    resetState,
    handleFileInputChange,
    triggerUploadClick,
  } = useDocumentUpload();

  const isUploading = uploadState === "uploading";
  const isSuccess = uploadState === "success";
  const isError = uploadState === "error";
  const isDragging = uploadState === "dragging";

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isUploading && !isSuccess) {
      setUploadState("dragging");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (isDragging) {
      setUploadState("idle");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isUploading || isSuccess) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    } else {
      setUploadState("idle");
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group/card relative w-full rounded-[22px] border transition-all duration-300 overflow-hidden p-4 xs:p-5 select-none ${"border-white/[0.08] bg-(--tile-bg) hover:border-white/[0.14] shadow-lg shadow-black/40"}`}
    >
      {/* Specular hairline light reflection along top border */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.16] to-transparent opacity-80"
      />

      {/* Atmospheric subtle top-center specular bloom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-24 bg-gradient-to-b from-indigo-500/12 via-purple-500/6 to-transparent blur-2xl rounded-full"
      />

      {/* Hidden native file input for instant file selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* State 1: IDLE or DRAGGING (Matching reference design with Docsy tokens) */}
      {!isUploading && !isSuccess && !isError && (
        <>
          {/* Top Row: Clickable document banner */}
          <div
            role="button"
            tabIndex={0}
            onClick={triggerUploadClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                triggerUploadClick(e);
              }
            }}
            className="flex items-center gap-3.5 mb-4 cursor-pointer group/row text-left select-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50 rounded-xl active:scale-[0.99] transition-transform duration-150"
          >
            {/* Document Icon Container with glowing aura */}
            <div className="relative h-12 w-12 xs:h-13 xs:w-13 rounded-2xl bg-indigo-500/[0.07] border border-white/[0.09] flex items-center justify-center shrink-0 shadow-inner group-hover/row:border-indigo-400/40 group-hover/row:bg-indigo-500/[0.12] group-hover/row:shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all duration-200">
              <svg
                width="22"
                height="26"
                viewBox="0 0 24 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-indigo-400 drop-shadow-[0_0_10px_rgba(167,139,250,0.55)] transition-transform duration-200 group-hover/row:scale-105"
              >
                <path
                  d="M 4 2 L 15 2 L 21 8 L 21 24 C 21 25.1 20.1 26 19 26 L 4 26 C 2.9 26 2 25.1 2 24 L 2 4 C 2 2.9 2.9 2 4 2 Z"
                  fill="rgba(168, 85, 247, 0.08)"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 14 2 L 14 8 L 20 8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Text labels */}
            <div className="flex flex-col min-w-0 flex-1">
              <h2 className="text-[14.5px] xs:text-[15px] font-semibold text-white tracking-tight group-hover/row:text-indigo-200 transition-colors leading-snug">
                {isDragging ? "Drop your PDF here" : "Add a document"}
              </h2>
              <p className="text-[12px] text-slate-400 mt-0.5 leading-snug truncate">
                {isDragging ? "Release to start uploading" : "Click to upload a PDF from your device."}
              </p>
            </div>

            {/* Chevron Right with subtle hover translation */}
            <ChevronRight className="h-4 w-4 xs:h-4.5 xs:w-4.5 text-slate-500 group-hover/row:text-slate-300 group-hover/row:translate-x-0.5 transition-all ml-auto shrink-0" />
          </div>

          {/* Action Button: Full-width vibrant pill with specular edge and shadow */}
          <button
            type="button"
            onClick={triggerUploadClick}
            className="group/btn relative w-full h-11 xs:h-11.5 rounded-full bg-gradient-to-r from-[#4f46e5] via-[#4338ca] to-[#3b82f6] text-white font-semibold text-[13.5px] flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(79,70,229,0.5)] hover:shadow-[0_6px_28px_rgba(99,102,241,0.7)] hover:brightness-110 active:scale-[0.98] transition-all duration-150 cursor-pointer overflow-hidden border border-white/[0.12]"
          >
            {/* Top specular glow inside button */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent"
            />
            <Plus className="h-4 w-4 stroke-[2.5] text-white/90 group-hover/btn:scale-110 transition-transform duration-150" />
            <span className="tracking-wide">Upload PDF</span>
          </button>

          {/* Supporting Metadata */}
          <p className="text-center text-[11px] text-slate-500 mt-2.5 font-normal tracking-wide">
            Supports PDF · Max 10MB
          </p>
        </>
      )}

      {/* State 2: UPLOADING */}
      {isUploading && (
        <div className="py-2 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-indigo-500/10 border border-indigo-500/30">
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          </div>
          <h2 className="mt-2.5 text-sm font-bold text-white tracking-tight">Uploading document...</h2>
          <p className="mt-0.5 text-xs text-slate-400 truncate max-w-[240px]">{fileName}</p>

          <div className="w-full max-w-[240px] h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-1.5">{progress}%</span>
        </div>
      )}

      {/* State 3: SUCCESS */}
      {isSuccess && (
        <div className="py-2 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="mt-2.5 text-sm font-bold text-white tracking-tight">Upload complete!</h2>
          <p className="mt-0.5 text-xs text-emerald-400/90">Redirecting to conversation...</p>
        </div>
      )}

      {/* State 4: ERROR */}
      {isError && (
        <div className="py-2 flex flex-col items-center justify-center text-center animate-in fade-in duration-200">
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="mt-2.5 text-sm font-bold text-white tracking-tight">Upload failed</h2>
          <p className="mt-0.5 text-xs text-rose-300 max-w-[260px]">{errorMessage || "An unexpected error occurred"}</p>
          <button
            type="button"
            onClick={resetState}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium text-slate-200 bg-white/[0.08] hover:bg-white/[0.12] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
