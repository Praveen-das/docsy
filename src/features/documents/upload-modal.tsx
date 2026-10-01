"use client";

import React from "react";
import { GlowContainer } from "@/components/ui/glow-container";
import { AlertCircle, X, FileUp } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { ModalBackdrop, useModalDismiss } from "@/components/ui/modal-backdrop";
import { useNetworkStatus } from "@/features/offline/hooks/use-network-status";
import { useDocumentUploadModal } from "./hooks/use-document-upload-modal";
import { UploadIdleView } from "./components/upload-idle-view";
import { UploadProgressView, UploadFailedView } from "./components/upload-status-views";

export interface UploadModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onUploadSuccess?: (filename: string) => void;
}

export function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps = {}) {
  const { isOffline } = useNetworkStatus();
  const storeIsOpen = useUIStore((state) => state.isUploadOpen);
  const storeClose = useUIStore((state) => state.closeUpload);

  const effectiveIsOpen = isOpen ?? storeIsOpen;
  const effectiveOnClose = onClose ?? storeClose;

  const {
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
  } = useDocumentUploadModal({
    onClose: effectiveOnClose,
    onUploadSuccess,
  });

  useModalDismiss(effectiveIsOpen, handleClose);

  if (!effectiveIsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 xs:p-4 sm:p-6 select-none">
      <ModalBackdrop onClose={handleClose} />

      <GlowContainer
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
        className="relative z-10 w-full max-w-lg rounded-[24px] sm:rounded-[28px] p-4 xs:p-5 sm:p-6 max-h-[calc(100dvh-1.5rem)] overflow-y-auto custom-scrollbar transition-all duration-150 ease-out transform animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3.5 sm:pb-4 border-b border-white/[0.06] relative z-10">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-[#b8c3ee] border border-white/[0.08] shadow-sm">
              <FileUp className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="upload-modal-title"
                  className="text-base sm:text-lg font-semibold tracking-tight text-[#f1f3f9]"
                >
                  Upload Document
                </h2>
                <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-[#818ea8] border border-white/[0.08]">
                  PDF up to 10 MB
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-[#7d879d] mt-0.5 sm:mt-1 font-normal leading-relaxed">
                Add a document to explore and ask questions with verified citations.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#7d879d] hover:text-white hover:bg-white/5 transition-colors cursor-pointer active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-3.5 sm:mt-4 space-y-3.5 sm:space-y-4 relative z-10">
          {isOffline && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
              <span>You are currently offline. Connect to the internet to upload and parse documents.</span>
            </div>
          )}

          {step === "idle" && (
            <UploadIdleView
              selectedFile={selectedFile}
              isOffline={isOffline}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              fileInputRef={fileInputRef}
              errorMessage={errorMessage}
              onDrop={handleDrop}
              onFileChange={handleFileChange}
              onRemoveFile={() => setSelectedFile(null)}
              onClose={handleClose}
              onStartUpload={handleStartUpload}
            />
          )}

          {step === "uploading" && <UploadProgressView progress={progress} />}

          {step === "failed" && (
            <UploadFailedView
              errorMessage={errorMessage}
              onReset={resetState}
              onRetry={handleStartUpload}
            />
          )}
        </div>
      </GlowContainer>
    </div>
  );
}
