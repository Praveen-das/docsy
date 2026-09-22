"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Document } from "@/types";

export interface DeleteDocumentDialogProps {
  document: Document | null;
  isOpen: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteDocumentDialog({
  document: doc,
  isOpen,
  isDeleting = false,
  onClose,
  onConfirm,
}: DeleteDocumentDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Document?"
      description="This will permanently remove this document and all its saved questions and answers from your account."
    >
      <div className="space-y-4 pt-2">
        <div className="rounded-xl bg-rose-500/10 p-3.5 text-xs text-rose-300 border border-rose-500/20 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">Irreversible Action</p>
            <p className="mt-0.5 text-rose-300/90 leading-relaxed">
              Deleting &ldquo;{doc?.originalName}&rdquo; will decouple it from all active conversations.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Confirm Deletion"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
