"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { addOptimisticDocument } from "./use-documents";
import { documentApiService } from "../services/document-api.service";

export type UploadStep = "idle" | "uploading" | "failed";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit

export function useDocumentUploadModal({
  onClose,
  onUploadSuccess,
}: {
  onClose: () => void;
  onUploadSuccess?: (filename: string) => void;
}) {
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

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setErrorMessage("Only PDF documents are supported. Please select a .pdf file.");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setErrorMessage(
        `File exceeds the 10 MB maximum limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
      );
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
      const { documentId: docId } = await documentApiService.uploadFile(
        selectedFile,
        (e) => {
          if (e.lengthComputable) {
            const uploadPercent = Math.round((e.loaded / e.total) * 30);
            setProgress(uploadPercent);
          }
        },
      );

      setProgress(100);

      const now = new Date().toISOString();
      addOptimisticDocument({
        id: docId,
        userId: "",
        filename: "",
        originalName: selectedFile.name,
        fileUrl: "",
        fileSize: selectedFile.size,
        pageCount: 0,
        chunkCount: 0,
        status: "UPLOADING",
        processingProgress: 0,
        error: null,
        createdAt: now,
        updatedAt: now,
      });

      onUploadSuccess?.(selectedFile.name);

      resetState();
      onClose();
      router.push("/documents");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Network error during upload",
      );
      setStep("failed");
    }
  };

  return {
    selectedFile,
    setSelectedFile,
    isDragging,
    setIsDragging,
    step,
    progress,
    errorMessage,
    fileInputRef,
    resetState,
    handleClose,
    handleDrop,
    handleFileChange,
    handleStartUpload,
  };
}
