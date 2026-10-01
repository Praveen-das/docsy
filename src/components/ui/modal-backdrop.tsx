import React from "react";
import { cn } from "@/lib/utils";

export interface ModalBackdropProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

/**
 * Standard reusable backdrop for all modals, dialogs, and slide-over drawers.
 * Centralizes backdrop color, dark mode opacity, blur filter, and fade animation.
 */
export function ModalBackdrop({ className, onClose, onClick, ...props }: ModalBackdropProps) {
  return (
    <div
      aria-hidden="true"
      onClick={onClose || onClick}
      className={cn(
        "fixed inset-0 bg-black/50 dark:bg-black/50 backdrop-blur-sm transition-opacity duration-150 animate-in fade-in will-change-[opacity]",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Hook to manage modal dismissal on Escape key press and prevent background scrolling.
 */
export function useModalDismiss(isOpen: boolean, onClose: () => void) {
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const prevOverflow = typeof document !== "undefined" ? document.body.style.overflow : "";
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = prevOverflow;
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);
}
