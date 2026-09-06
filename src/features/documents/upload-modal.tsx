"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Layers,
  Sparkles,
  ArrowRight,
  Check,
  X,
  ShieldCheck,
  Bookmark,
  FileUp,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocumentStore } from "@/stores/document-store";
import { Document } from "@/types";

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (filename: string) => void;
}

type UploadStep = "idle" | "uploading" | "extracting" | "chunking" | "embedding" | "indexing" | "ready" | "failed";

const STAGES = [
  { id: "uploading", label: "Upload", min: 15 },
  { id: "extracting", label: "Scan Pages", min: 40 },
  { id: "chunking", label: "Organize", min: 70 },
  { id: "embedding", label: "Index", min: 90 },
  { id: "ready", label: "Ready", min: 100 },
] as const;

export function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<UploadStep>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedDoc, setUploadedDoc] = useState<Document | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const resetState = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setSelectedFile(null);
    setUploadedDoc(null);
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

      setProgress(35);

      // Step 3: Confirm upload — server verifies file landed and triggers workflow
      const confirmRes = await fetch("/api/documents/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docId }),
      });

      if (!confirmRes.ok) {
        let errDetail = "Failed to confirm upload";
        try {
          const errData = await confirmRes.json();
          console.log("file uploaded failed");
          if (errData.error) errDetail = errData.error;
        } catch {}
        setErrorMessage(errDetail);
        setStep("failed");
        return;
      }

      console.log("file uploaded successfully");

      setStep("extracting");
      setProgress(40);

      // Start polling document status (existing logic)
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/documents/${docId}`);
          if (!pollRes.ok) return;

          const doc: Document = await pollRes.json();

          if (doc.status === "EXTRACTING") {
            setStep("extracting");
            setProgress(Math.max(40, doc.processingProgress || 40));
          } else if (doc.status === "CHUNKING") {
            setStep("chunking");
            setProgress(Math.max(65, doc.processingProgress || 65));
          } else if (doc.status === "EMBEDDING") {
            setStep("embedding");
            setProgress(Math.max(80, doc.processingProgress || 80));
          } else if (doc.status === "INDEXING") {
            setStep("indexing");
            setProgress(Math.max(90, doc.processingProgress || 90));
          } else if (doc.status === "READY") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setUploadedDoc(doc);
            setStep("ready");
            setProgress(100);
            useDocumentStore.getState().addDocument(doc);
            if (onUploadSuccess) {
              onUploadSuccess(doc as any);
            }
          } else if (doc.status === "FAILED") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setStep("failed");
            setErrorMessage(doc.error || "Document processing failed");
            useDocumentStore.getState().updateDocument(doc.id, {
              status: "FAILED",
              error: doc.error,
            });
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 1500);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Network error during upload");
      setStep("failed");
    }
  };

  const handleStartConversation = () => {
    handleClose();
    if (uploadedDoc) {
      router.push(`/conversation?doc=${uploadedDoc.id}`);
    } else {
      router.push("/conversation");
    }
  };

  const stepDetails: Record<UploadStep, { title: string; subtitle: string; icon: React.ReactNode }> = {
    idle: {
      title: "Upload Document",
      subtitle: "Select a PDF document to begin",
      icon: <UploadCloud className="h-5 w-5 text-blue-600" />,
    },
    uploading: {
      title: "Uploading Document...",
      subtitle: "Transferring file securely to your private workspace...",
      icon: <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />,
    },
    extracting: {
      title: "Scanning Pages & Text...",
      subtitle: "Extracting text and preserving coordinates for page citations...",
      icon: <FileText className="h-5 w-5 text-indigo-600 animate-pulse" />,
    },
    chunking: {
      title: "Organizing Searchable Sections...",
      subtitle: "Structuring content by paragraphs, tables, and sections...",
      icon: <Layers className="h-5 w-5 text-blue-600 animate-bounce" />,
    },
    embedding: {
      title: "Indexing Key Information...",
      subtitle: "Preparing question-answering references and direct links...",
      icon: <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />,
    },
    indexing: {
      title: "Finalizing Citations...",
      subtitle: "Connecting references to exact document pages...",
      icon: <Bookmark className="h-5 w-5 text-emerald-600 animate-pulse" />,
    },
    ready: {
      title: "Document Ready for Conversation!",
      subtitle: "Your document is fully analyzed and citation-verified.",
      icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
    },
    failed: {
      title: "Analysis Incomplete",
      subtitle: "Unable to read text from this document.",
      icon: <AlertCircle className="h-5 w-5 text-rose-600" />,
    },
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
                    ? "border-zinc-900 bg-zinc-100/80 dark:border-white/40 dark:bg-white/5 scale-[0.99] shadow-sm"
                    : "border-zinc-300 bg-zinc-50/50 hover:border-zinc-400 hover:bg-zinc-100/60 dark:border-zinc-700 dark:bg-[#16161b] dark:hover:border-zinc-600 dark:hover:bg-[#1a1a22]",
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
                <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-white text-zinc-800 border border-zinc-200 shadow-2xs group-hover:scale-105 group-hover:border-zinc-300 group-hover:bg-zinc-50 dark:bg-[#1c1c22] dark:text-white dark:border-white/10 dark:group-hover:border-white/20 dark:group-hover:bg-[#23232b] transition-all mb-3.5">
                  <UploadCloud className="h-6 w-6 stroke-[2.2]" />
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
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-zinc-700 border border-zinc-200 dark:bg-[#1c1c22] dark:text-zinc-300 dark:border-white/10 shadow-2xs">
                    <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    Private & Secure
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-zinc-700 border border-zinc-200 dark:bg-[#1c1c22] dark:text-zinc-300 dark:border-white/10 shadow-2xs">
                    <Bookmark className="h-3 w-3 text-zinc-500 dark:text-zinc-400" />
                    Page-Level Citations
                  </span>
                </div>
              </div>
            ) : (
              /* Selected Document Preview Card */
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 space-y-3.5 dark:border-white/10 dark:bg-[#16161b]">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <span>Selected Document</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-zinc-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="flex items-center gap-3.5 rounded-xl bg-white p-3.5 border border-zinc-200 dark:bg-[#1c1c22] dark:border-white/10 shadow-2xs">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 font-mono text-[11px] font-bold">
                    PDF
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate">
                      {selectedFile.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Check className="h-3 w-3" />
                        Verified format
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-transparent dark:text-zinc-300 dark:hover:bg-white/5 transition-colors shrink-0 cursor-pointer"
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
        ) : step === "ready" ? (
          /* Celebratory Ready State */
          <div className="py-5 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-sm animate-in zoom-in-95">
              <CheckCircle2 className="h-8 w-8 stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Document Ready for Conversation!</h4>
              <p className="max-w-sm mx-auto text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed truncate px-4">
                &ldquo;{selectedFile?.name}&rdquo; is ready for verified questioning.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 font-medium">
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Page citations linked and verified</span>
            </div>

            {/* Launch Action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-4 border-t border-zinc-100 dark:border-white/5">
              <Button variant="outline" size="sm" onClick={handleClose} className="w-full sm:w-auto">
                Done & View List
              </Button>
              <Button variant="accent" size="sm" onClick={handleStartConversation} className="w-full sm:w-auto">
                <span>Start Conversation Now</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        ) : step === "failed" ? (
          /* Failed Error State with Retry */
          <div className="py-5 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 shadow-sm">
              <AlertCircle className="h-8 w-8 stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Analysis Incomplete</h4>
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
        ) : (
          /* Live Dynamic Analysis Pipeline */
          <div className="py-3 space-y-5">
            {/* Active Stage Info */}
            <div className="flex items-center gap-3.5 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 dark:border-white/10 dark:bg-[#16161b]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-2xs border border-zinc-200 dark:bg-[#1c1c22] dark:text-blue-400 dark:border-white/10">
                {stepDetails[step].icon}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {stepDetails[step].title}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                  {stepDetails[step].subtitle}
                </p>
              </div>
            </div>

            {/* Continuous Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                  <span>Processing document</span>
                </span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{progress}%</span>
              </div>
              <Progress
                value={progress}
                indicatorColor="bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500"
              />
            </div>

            {/* Connected Stage Nodes */}
            <div className="pt-2">
              <div className="flex items-center justify-between relative">
                <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 z-0" />

                {STAGES.map((stage, idx) => {
                  const isPassed = progress >= stage.min;
                  const isCurrent = progress >= stage.min - 25 && progress < stage.min;

                  return (
                    <div
                      key={stage.id}
                      className="relative z-10 flex flex-col items-center gap-1.5 bg-white dark:bg-[#121216] px-1"
                    >
                      <div
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all shadow-2xs",
                          isPassed
                            ? "bg-emerald-600 text-white"
                            : isCurrent
                              ? "bg-blue-600 text-white ring-4 ring-blue-500/20 animate-pulse"
                              : "bg-zinc-100 text-zinc-400 border border-zinc-200 dark:bg-[#1c1c22] dark:text-zinc-500 dark:border-white/10",
                        )}
                      >
                        {isPassed ? <Check className="h-3 w-3 stroke-[2.5]" /> : <span>{idx + 1}</span>}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-medium transition-colors",
                          isPassed
                            ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                            : isCurrent
                              ? "text-blue-600 dark:text-blue-400 font-bold"
                              : "text-zinc-400 dark:text-zinc-500",
                        )}
                      >
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500 italic pt-1">
              Analyzing text and generating verified page reference index...
            </p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
