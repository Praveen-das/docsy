"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { addOptimisticDocument } from "@/features/documents/hooks/use-documents";

export type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

export function useDocumentUpload() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const resetState = useCallback(() => {
    setUploadState("idle");
    setProgress(0);
    setErrorMessage(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setErrorMessage("Only PDF documents are supported.");
        setUploadState("error");
        return;
      }

      const MAX_SIZE_BYTES = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE_BYTES) {
        setErrorMessage("File exceeds 10 MB limit.");
        setUploadState("error");
        return;
      }

      setFileName(file.name);
      setUploadState("uploading");
      setProgress(5);
      setErrorMessage(null);

      try {
        const urlRes = await fetch("/api/documents/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            fileSize: file.size,
          }),
        });

        if (!urlRes.ok) {
          let errDetail = "Failed to prepare upload";
          try {
            const errData = await urlRes.json();
            if (errData.error) errDetail = errData.error;
          } catch {
            // ignore
          }
          throw new Error(errDetail);
        }

        const { documentId: docId, signedUrl } = await urlRes.json();

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              setProgress(Math.min(percent, 98));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Storage error (${xhr.status})`));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.ontimeout = () => reject(new Error("Upload timed out"));

          xhr.open("PUT", signedUrl);
          xhr.setRequestHeader("Content-Type", "application/pdf");
          xhr.send(file);
        });

        setProgress(100);
        setUploadState("success");

        const now = new Date().toISOString();
        addOptimisticDocument({
          id: docId,
          userId: "",
          filename: "",
          originalName: file.name,
          fileUrl: "",
          fileSize: file.size,
          pageCount: 0,
          chunkCount: 0,
          status: "UPLOADING",
          processingProgress: 0,
          error: null,
          createdAt: now,
          updatedAt: now,
        });

        setTimeout(() => {
          router.push(`/conversation?doc=${docId}`);
        }, 1200);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : "Upload failed");
        setUploadState("error");
      }
    },
    [router]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        uploadFile(e.target.files[0]);
      }
    },
    [uploadFile]
  );

  const triggerUploadClick = useCallback(
    (e?: React.SyntheticEvent) => {
      e?.stopPropagation();
      if (uploadState === "uploading" || uploadState === "success") return;
      fileInputRef.current?.click();
    },
    [uploadState]
  );

  return {
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
  };
}
