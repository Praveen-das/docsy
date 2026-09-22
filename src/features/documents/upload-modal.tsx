"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlowContainer } from "@/components/ui/glow-container";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  AlertCircle,
  Loader2,
  ArrowRight,
  Check,
  X,
  ShieldCheck,
  FileUp,
  RefreshCw,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocumentStore } from "@/stores/document-store";
import { useUIStore } from "@/stores/ui-store";
import { GlowCard } from "@/components/ui/glow-card";

export interface UploadModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onUploadSuccess?: (filename: string) => void;
}

type UploadStep = "idle" | "uploading" | "failed";

export function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps = {}) {
  const router = useRouter();
  const storeIsOpen = useUIStore((state) => state.isUploadOpen);
  const storeClose = useUIStore((state) => state.closeUpload);

  const effectiveIsOpen = isOpen ?? storeIsOpen;
  const effectiveOnClose = onClose ?? storeClose;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<UploadStep>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSelectedFile(null);
    setStep("idle");
    setProgress(0);
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetState();
    effectiveOnClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && effectiveIsOpen) {
        handleClose();
      }
    };

    if (effectiveIsOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [effectiveIsOpen]);

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);

    // Validate MIME type / extension
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setErrorMessage("Only PDF documents are supported. Please select a .pdf file.");
      return;
    }

    // Validate size (10 MB limit)
    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage(`File exceeds the 10 MB maximum limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;

    setStep("uploading");
    setProgress(0);
    setErrorMessage(null);

    try {
      // Step 1: Get signed upload URL from server (lightweight JSON, no file bytes)
      const urlRes = await fetch("/api/documents/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedFile.name,
          fileSize: selectedFile.size,
        }),
      });

      if (!urlRes.ok) {
        let errDetail = "Failed to prepare upload";
        try {
          const errData = await urlRes.json();
          if (errData.error) errDetail = errData.error;
        } catch {}
        setErrorMessage(errDetail);
        setStep("failed");
        return;
      }

      const { documentId: docId, signedUrl } = await urlRes.json();

      // Step 2: Upload file directly to Supabase Storage via signed URL
      // Uses XMLHttpRequest for real byte-level progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            // Map upload progress to 0–30% of total progress
            const uploadPercent = Math.round((e.loaded / e.total) * 30);
            setProgress(uploadPercent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Storage upload failed (${xhr.status})`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.ontimeout = () => reject(new Error("Upload timed out"));

        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", "application/pdf");
        xhr.send(selectedFile);
      });

      setProgress(100);

      // Optimistically add the document to the store so it appears
      // at the top of the /documents list with "Analyzing..." status
      const now = new Date().toISOString();
      useDocumentStore.getState().addDocument({
        id: docId,
        userId: "", // filled on next fetchDocuments()
        filename: "", // filled on next fetchDocuments()
        originalName: selectedFile.name,
        fileUrl: "", // filled on next fetchDocuments()
        fileSize: selectedFile.size,
        pageCount: 0,
        chunkCount: 0,
        status: "UPLOADING",
        processingProgress: 0,
        error: null,
        createdAt: now,
        updatedAt: now,
      });

      // Call onUploadSuccess callback if provided (e.g. to re-fetch)
      onUploadSuccess?.(selectedFile.name);

      // Close modal and navigate to the documents list
      resetState();
      effectiveOnClose();
      router.push("/documents");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Network error during upload");
      setStep("failed");
    }
  };

  if (!effectiveIsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      {/* Obsidian Backdrop with subtle blur */}
      <div
        aria-hidden="true"
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm transition-opacity duration-150 animate-in fade-in"
      />

      {/* Modal Container: Cosmic glassmorphic card with ambient glow & specular horizon */}
      <GlowContainer
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
        className="relative z-10 w-full max-w-lg rounded-[28px] p-5 sm:p-6 transition-all duration-150 ease-out transform animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.06] relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-[#b8c3ee] border border-white/[0.08] shadow-sm">
              <FileUp className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="upload-modal-title"
                  className="text-[17px] sm:text-lg font-semibold tracking-tight text-[#f1f3f9]"
                >
                  Upload Document
                </h2>
                <span className="rounded-full bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-medium text-[#818ea8] border border-white/[0.08]">
                  PDF up to 10 MB
                </span>
              </div>
              <p className="text-[13px] text-[#7d879d] mt-1 font-normal leading-relaxed">
                Add a document to explore and ask questions with verified page citations.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#7d879d] hover:text-white hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10 active:scale-[0.98]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-4 space-y-4 relative z-10">
          {step === "idle" ? (
            <>
              {/* Dropzone Container */}
              {!selectedFile ? (
                <GlowCard
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-[22px] p-10 text-center transition-all cursor-pointer group select-none",
                    isDragging
                      ? "border-indigo-400/80 bg-indigo-950/25 scale-[0.99] shadow-[0_0_35px_rgba(99,102,241,0.25)]"
                      : "border-white/[0.09] bg-[#0c1017]/60 hover:border-indigo-400/35 hover:bg-[#10141f]/80 active:scale-[0.995]",
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {/* Icon with subtle halo */}
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)] group-hover:scale-105 group-hover:border-indigo-400/40 group-hover:bg-indigo-500/15 transition-all mb-3.5">
                    <UploadCloud className="h-6 w-6 stroke-[2]" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-[#f1f3f9]">
                      Drop your PDF here, or{" "}
                      <span className="text-indigo-400 underline underline-offset-2 group-hover:text-indigo-300 font-semibold transition-colors">
                        browse files
                      </span>
                    </h3>
                    <p className="text-xs text-[#818ea8]">Searchable PDF documents up to 10 MB</p>
                  </div>

                  {/* Feature Tags */}
                  <div className="mt-4.5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#818ea8] font-medium">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.03] px-2.5 py-1 text-[#8fa2d4] border border-white/[0.08]">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      Private & Secure
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.03] px-2.5 py-1 text-[#8fa2d4] border border-white/[0.08]">
                      <Bookmark className="h-3 w-3 text-indigo-400" />
                      Page-Level Citations
                    </span>
                  </div>
                </GlowCard>
              ) : (
                /* Selected Document Preview Card */
                <GlowCard className="rounded-[22px] border border-white/[0.08] bg-[#0c1017]/80 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-medium text-[#818ea8]">
                    <span>Selected Document</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-[#7d879d] hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer active:scale-[0.98]"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3.5 rounded-xl bg-white/[0.03] p-3 border border-white/[0.06]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-mono text-[10px] font-bold tracking-wider">
                      PDF
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#f1f3f9] text-xs sm:text-sm truncate">{selectedFile.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-[#818ea8]">
                        <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                        <span className="text-white/20">•</span>
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <Check className="h-3 w-3" />
                          Verified format
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-[#c4cbdd] hover:text-white hover:bg-white/[0.08] transition-colors shrink-0 cursor-pointer active:scale-[0.98]"
                    >
                      Replace
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#7d879d] pt-0.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Your document is confidential and accessible only inside your account.</span>
                  </div>
                </GlowCard>
              )}

              {/* Error Message Notice */}
              {errorMessage && (
                <div className="flex items-start gap-2.5 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-300 border border-rose-500/20 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-rose-200">Unable to accept file</p>
                    <p className="text-rose-400 mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
                <Button variant="outline" size="sm" onClick={handleClose}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" disabled={!selectedFile} onClick={handleStartUpload}>
                  <span>Analyze Document</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </>
          ) : step === "uploading" ? (
            /* Brief uploading state — shown only during XHR transfer */
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_25px_rgba(99,102,241,0.2)]">
                <Loader2 className="h-7 w-7 stroke-[2.2] animate-spin text-indigo-400" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#f1f3f9]">Uploading Document...</h3>
                <p className="max-w-sm mx-auto text-xs text-[#818ea8] leading-relaxed">
                  Transferring file securely to your private workspace.
                </p>
              </div>

              <div className="w-full max-w-xs mx-auto bg-white/[0.06] rounded-full h-1.5 overflow-hidden border border-white/[0.05]">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs font-mono text-indigo-400">{progress}%</p>
            </div>
          ) : (
            /* Failed Error State with Retry */
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                <AlertCircle className="h-7 w-7 stroke-[2.2]" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#f1f3f9]">Upload Failed</h3>
                <p className="max-w-sm mx-auto text-xs text-rose-400 leading-relaxed px-4">
                  {errorMessage || "Unable to process this document. Please check the file and try again."}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2.5 pt-3 border-t border-white/[0.06]">
                <Button variant="outline" size="sm" onClick={resetState}>
                  Select Another File
                </Button>
                <Button variant="accent" size="sm" onClick={handleStartUpload}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  <span>Retry Upload</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </GlowContainer>
    </div>
  );
}
