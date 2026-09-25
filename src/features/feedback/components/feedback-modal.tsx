"use client";

import React, { useState, useRef } from "react";
import { X, Upload, Loader2, CheckCircle2, ChevronDown, AlertCircle, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowContainer } from "@/components/ui/glow-container";
import { useSubmitFeedback } from "@/features/feedback/hooks/use-feedback";
import type { FeedbackCategory } from "@/features/feedback/types";

interface FeedbackModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

interface ReasonOption {
  id: FeedbackCategory;
  label: string;
}

const REASONS: ReasonOption[] = [
  { id: "idea", label: "Feature or capability suggestion" },
  { id: "bug", label: "Something is broken or behaving unexpectedly" },
  { id: "parsing", label: "Document parsing or citation accuracy issue" },
  { id: "performance", label: "Performance or slow loading" },
  { id: "general", label: "General feedback or question" },
];

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FeedbackModal({ isOpen = true, onClose }: FeedbackModalProps) {
  const submitMutation = useSubmitFeedback();

  const [category, setCategory] = useState<FeedbackCategory>("idea");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentReason = REASONS.find((r) => r.id === category) ?? REASONS[0];

  const handleSelectFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const availableSlots = MAX_ATTACHMENTS - files.length;
    if (availableSlots <= 0) {
      setErrorMessage(`Maximum of ${MAX_ATTACHMENTS} attachments reached.`);
      return;
    }

    const newFiles: File[] = [];
    for (let i = 0; i < Math.min(fileList.length, availableSlots); i++) {
      const file = fileList[i];
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(`File "${file.name}" exceeds 10MB limit.`);
        continue;
      }
      newFiles.push(file);
    }

    setFiles((prev) => [...prev, ...newFiles]);
    setErrorMessage(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage("Please tell us what is wrong, or what you'd like improved.");
      return;
    }
    setErrorMessage(null);

    try {
      await submitMutation.mutateAsync({
        category,
        message: message.trim(),
        files,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setMessage("");
        setFiles([]);
        onClose();
      }, 1300);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to submit feedback.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-4 sm:p-6 select-none">
      {/* Obsidian Backdrop matching SettingsModal */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-sm transition-opacity duration-150 animate-in fade-in will-change-[opacity]"
      />

      {/* Docsy Cosmic Obsidian Modal Card matching SettingsModal */}
      <GlowContainer
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
        className="relative z-10 w-full max-w-[560px] rounded-[20px] xs:rounded-[24px] text-white shadow-2xl transition-all duration-150 ease-out transform animate-in fade-in zoom-in-95 will-change-transform flex flex-col overflow-hidden p-0 max-h-[calc(100dvh-1.25rem)] sm:max-h-[calc(100dvh-3rem)]"
      >
        {/* Header Bar matching SettingsModal */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-white/[0.05] shrink-0">
          <div className="flex items-center gap-2">
            <h2 id="feedback-modal-title" className="text-sm sm:text-base font-semibold text-white tracking-tight">
              Report & Feedback
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-white/[0.06] hover:border-white/10 transition-colors cursor-pointer active:scale-[0.98] will-change-transform"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-3.5 xs:p-5 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          {isSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in duration-200">
              <div className="h-11 w-11 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.15)]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-white">Feedback received</h3>
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                Thank you for helping us improve Docsy. Your note has been routed directly to our engineering team.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-2.5 rounded-xl border border-rose-500/20 bg-rose-950/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 1. Reason Selection Field */}
              <div className="space-y-1.5 relative">
                <label className="text-[12.5px] font-medium text-zinc-300 block">Reason</label>

                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className={cn(
                    "w-full h-10 px-3.5 rounded-xl border bg-white/[0.03] text-left text-xs sm:text-[13px] transition-all flex items-center justify-between cursor-pointer active:scale-[0.99] will-change-transform",
                    isDropdownOpen
                      ? "border-indigo-400/40 bg-white/[0.05] text-white ring-1 ring-indigo-400/20"
                      : "border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.05] text-zinc-200",
                  )}
                >
                  <span className="truncate">{currentReason.label}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-zinc-400 transition-transform duration-150 shrink-0",
                      isDropdownOpen && "rotate-180",
                    )}
                  />
                </button>

                {/* Custom Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1.5 z-30 rounded-xl border border-white/[0.09] bg-(--tile-bg) p-1.5 shadow-2xl shadow-black/90 space-y-0.5 animate-in fade-in duration-100">
                      {REASONS.map((r) => {
                        const isSelected = r.id === category;
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              setCategory(r.id);
                              setIsDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg text-xs sm:text-[12.5px] transition-colors cursor-pointer",
                              isSelected
                                ? "bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30"
                                : "text-zinc-300 hover:text-white hover:bg-white/[0.05]",
                            )}
                          >
                            {r.label}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* 2. Message / Details Textarea */}
              <div className="space-y-1.5">
                <label className="text-[12.5px] font-medium text-zinc-300 block">Description</label>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 transition-colors focus-within:border-indigo-400/40 focus-within:bg-white/[0.05] focus-within:ring-1 focus-within:ring-indigo-400/20">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Tell us what is wrong, or what you'd like improved..."
                    className="w-full bg-transparent text-xs sm:text-[13px] text-zinc-100 placeholder-zinc-500 focus:outline-none custom-scrollbar resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* 3. Attachments Section (0/5) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12.5px] font-medium text-zinc-300">
                    Attachments{" "}
                    <span className="text-zinc-500 font-normal">
                      ({files.length}/{MAX_ATTACHMENTS})
                    </span>
                  </label>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.txt,.log,.json"
                  className="hidden"
                  onChange={(e) => {
                    handleSelectFiles(e.target.files);
                    if (e.target) e.target.value = "";
                  }}
                />

                {/* Drag & Drop Surface matching Docsy tile styling */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleSelectFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "w-full py-3 sm:py-4 px-3 sm:px-4 rounded-xl border border-dashed transition-all duration-150 flex flex-col items-center justify-center gap-1.5 cursor-pointer select-none",
                    "active:scale-[0.99] will-change-transform",
                    isDragging
                      ? "border-indigo-500 bg-indigo-500/10 text-white"
                      : "border-white/[0.10] bg-white/[0.02] hover:border-white/[0.18] hover:bg-white/[0.04] text-zinc-400 hover:text-zinc-300",
                  )}
                >
                  <Upload className="h-4 w-4 text-zinc-400 stroke-[1.8]" />
                  <span className="text-xs font-medium text-zinc-300 text-center">Drag and drop or click to select</span>
                  <span className="text-[11px] text-zinc-500 text-center">Images, PDFs, or logs up to 10MB</span>
                </div>

                {/* Attached Files List */}
                {files.length > 0 && (
                  <div className="space-y-1.5 pt-1 max-h-28 overflow-y-auto custom-scrollbar">
                    {files.map((file, idx) => (
                      <div
                        key={`${file.name}-${file.size}-${idx}`}
                        className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] text-xs text-zinc-300"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{file.name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="text-zinc-500 hover:text-rose-400 transition-colors p-1 cursor-pointer active:scale-95"
                          title="Remove attachment"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Send Action Row */}
              <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2 xs:gap-2.5 pt-3 border-t border-white/[0.05] shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer active:scale-[0.98] will-change-transform text-center"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitMutation.isPending || !message.trim()}
                  className={cn(
                    "h-9 px-5 rounded-xl text-xs font-medium transition-all duration-120 flex items-center justify-center gap-2 cursor-pointer select-none active:scale-[0.98] will-change-transform",
                    message.trim()
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30"
                      : "bg-white/[0.06] text-zinc-500 border border-white/[0.06] cursor-not-allowed",
                  )}
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </GlowContainer>
    </div>
  );
}
