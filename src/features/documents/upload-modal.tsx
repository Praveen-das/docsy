"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  FileText,
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

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (filename: string) => void;
}

type UploadStep = "idle" | "uploading" | "failed";

export function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const router = useRouter();
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
    onClose();
  };

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
      onClose();
      router.push("/documents");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Network error during upload");
      setStep("failed");
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#121216] transition-all"
    >
      {/* Modern Clean Header */}
      <div className="flex items-start justify-between border-b border-zinc-200 dark:border-white/5 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200 dark:bg-[#1c1c22] dark:text-white dark:border-white/10 shadow-2xs">
            <FileUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base tracking-tight">Upload Document</h3>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 border border-zinc-200 dark:bg-[#1c1c22] dark:text-zinc-400 dark:border-white/10">
                PDF up to 10 MB
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Add a document to explore and ask questions with verified page citations.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {step === "idle" ? (
          <>
            {/* Dropzone Container */}
            {!selectedFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer group select-none",
                  isDragging
                    ? "border-indigo-400 bg-indigo-950/20 scale-[0.99] shadow-[0_0_30px_rgba(99,102,241,0.25)]"
                    : "border-zinc-300 bg-zinc-50/50 hover:border-zinc-400 hover:bg-zinc-100/60 dark:border-white/10 dark:bg-[#0c0e18]/80 dark:hover:border-indigo-500/30 dark:hover:bg-[#101322]",
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Minimalist Floating Icon */}
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-zinc-800 border border-zinc-200 shadow-2xs group-hover:scale-105 group-hover:border-zinc-300 group-hover:bg-zinc-50 dark:bg-[#141829] dark:text-zinc-200 dark:border-[#2e375e] dark:shadow-md dark:group-hover:border-indigo-500/40 transition-all mb-3.5">
                  <UploadCloud className="h-6 w-6 stroke-[2]" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Drop your PDF here, or{" "}
                    <span className="text-zinc-900 dark:text-white underline underline-offset-2 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 font-semibold">
                      browse files
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Searchable PDF documents up to 10 MB</p>
                </div>

                {/* Feature Tags */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-zinc-700 border border-zinc-200 dark:bg-white/5 dark:text-zinc-300 dark:border-white/10 shadow-2xs">
                    <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    Private & Secure
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-zinc-700 border border-zinc-200 dark:bg-white/5 dark:text-zinc-300 dark:border-white/10 shadow-2xs">
                    <Bookmark className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
                    Page-Level Citations
                  </span>
                </div>
              </div>
            ) : (
              /* Selected Document Preview Card */
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 space-y-3.5 dark:border-white/5 dark:bg-[#16161b]">
                <div className="flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  <span>Selected Document</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-zinc-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="flex items-center gap-3.5 rounded-lg bg-white p-3 border border-zinc-200 dark:bg-[#121216] dark:border-white/5 shadow-2xs">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-white/5 dark:text-zinc-300 dark:border-white/5 font-mono text-[10px] font-semibold">
                    PDF
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900 dark:text-white text-xs sm:text-sm truncate">
                      {selectedFile.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <Check className="h-3 w-3" />
                        Verified format
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-transparent dark:text-zinc-300 dark:hover:bg-white/5 transition-colors shrink-0 cursor-pointer"
                  >
                    Replace
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Your document is confidential and accessible only inside your account.</span>
                </div>
              </div>
            )}

            {/* Error Message Notice */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Unable to accept file</p>
                  <p className="text-rose-600 dark:text-rose-400 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100 dark:border-white/5">
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
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 shadow-sm">
              <Loader2 className="h-8 w-8 stroke-[2.2] animate-spin" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Uploading Document...</h4>
              <p className="max-w-sm mx-auto text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Transferring file securely to your private workspace.
              </p>
            </div>

            <div className="w-full max-w-xs mx-auto bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs font-mono text-blue-600 dark:text-blue-400">{progress}%</p>
          </div>
        ) : (
          /* Failed Error State with Retry */
          <div className="py-5 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 shadow-sm">
              <AlertCircle className="h-8 w-8 stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Upload Failed</h4>
              <p className="max-w-sm mx-auto text-xs text-rose-600 dark:text-rose-400 leading-relaxed px-4">
                {errorMessage || "Unable to process this document. Please check the file and try again."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-4 border-t border-zinc-100 dark:border-white/5">
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
    </Dialog>
  );
}
