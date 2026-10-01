"use client";

import React from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadDropzone } from "./upload-dropzone";
import { UploadFilePreview } from "./upload-file-preview";

interface UploadIdleViewProps {
  selectedFile: File | null;
  isOffline: boolean;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  errorMessage: string | null;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onClose: () => void;
  onStartUpload: () => void;
}

export function UploadIdleView({
  selectedFile,
  isOffline,
  isDragging,
  setIsDragging,
  fileInputRef,
  errorMessage,
  onDrop,
  onFileChange,
  onRemoveFile,
  onClose,
  onStartUpload,
}: UploadIdleViewProps) {
  return (
    <>
      {!selectedFile ? (
        <UploadDropzone
          isOffline={isOffline}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          fileInputRef={fileInputRef}
          onDrop={onDrop}
          onFileChange={onFileChange}
        />
      ) : (
        <UploadFilePreview
          selectedFile={selectedFile}
          onRemove={onRemoveFile}
          onReplace={() => fileInputRef.current?.click()}
        />
      )}

      {errorMessage && (
        <div className="flex items-start gap-2.5 rounded-xl bg-rose-500/10 p-3 text-xs text-rose-300 border border-rose-500/20 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-200">Unable to accept file</p>
            <p className="text-rose-400 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="accent"
          size="sm"
          disabled={!selectedFile || isOffline}
          onClick={onStartUpload}
        >
          <span>Analyze Document</span>
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </>
  );
}
