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

export default ModalBackdrop;
