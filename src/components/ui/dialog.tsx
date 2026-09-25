"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { ModalBackdrop } from "./modal-backdrop";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ isOpen, onClose, title, description, children, className }: DialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 sm:p-6">
      <ModalBackdrop onClose={onClose} />

      {/* Modal Dialog Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "dialog-title" : undefined}
        aria-describedby={description ? "dialog-description" : undefined}
        className={cn(
          "relative z-50 w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-4.5 xs:p-5 sm:p-6 shadow-2xl text-zinc-900 dark:border-white/10 dark:bg-[#10121a] dark:text-zinc-100 transition-all duration-150 ease-out transform",
          "max-h-[calc(100dvh-2rem)] overflow-y-auto custom-scrollbar scale-100 opacity-100 animate-in fade-in zoom-in-95",
          className,
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 rounded-xl p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer active:scale-95"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {title && (
          <h2 id="dialog-title" className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-white pr-8">
            {title}
          </h2>
        )}

        {description && (
          <p id="dialog-description" className="mt-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {description}
          </p>
        )}

        <div className="mt-3.5 sm:mt-4">{children}</div>
      </div>
    </div>
  );
}
