"use client";

import React, { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PurgeDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  warningText: string;
  confirmButtonText: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function PurgeDialog({
  isOpen,
  title,
  description,
  warningText,
  confirmButtonText,
  onClose,
  onConfirm,
}: PurgeDialogProps) {
  const [confirmationInput, setConfirmationInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const resetAndClose = () => {
    if (!isProcessing) {
      setConfirmationInput("");
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (confirmationInput.trim().toLowerCase() !== "delete") return;

    try {
      setIsProcessing(true);
      await onConfirm();
      setConfirmationInput("");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={resetAndClose} title={title} description={description}>
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <p className="leading-relaxed">{warningText}</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm-purge-input" className="text-xs font-medium text-zinc-300 block">
            Type <span className="font-semibold text-rose-400 font-mono">delete</span> to confirm:
          </label>
          <input
            id="confirm-purge-input"
            type="text"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            placeholder="delete"
            disabled={isProcessing}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-rose-500/40 focus:ring-1 focus:ring-rose-500/40 transition-all font-mono"
          />
        </div>

        <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={isProcessing} onClick={resetAndClose} className="w-full xs:w-auto">
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={confirmationInput.trim().toLowerCase() !== "delete" || isProcessing}
            onClick={handleConfirm}
            className="gap-1.5 w-full xs:w-auto"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>{confirmButtonText}</span>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
