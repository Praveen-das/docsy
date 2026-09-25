"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { extractClerkErrorMessage } from "../../utils/clerk-error";

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountDeleted?: () => void;
}

export function DeleteAccountDialog({
  isOpen,
  onClose,
  onAccountDeleted,
}: DeleteAccountDialogProps) {
  const { user } = useUser();
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const resetForm = () => {
    setDeleteConfirmationInput("");
    setDeleteError(null);
  };

  const handleClose = () => {
    if (!isDeleting) {
      resetForm();
      onClose();
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationInput.trim().toLowerCase() !== "delete") return;

    try {
      setIsDeleting(true);
      setDeleteError(null);

      if (user) {
        await user.delete();
      }

      onAccountDeleted?.();
      window.location.href = "/";
    } catch (err: unknown) {
      console.error("Failed to delete account:", err);
      setDeleteError(
        extractClerkErrorMessage(
          err,
          "Failed to delete account. Please try again or contact support."
        )
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Account?"
      description="This action is irreversible. All your documents, questions, conversations, and account data will be permanently removed."
    >
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <p className="leading-relaxed">
            If you have an active subscription, please cancel it before deleting your account to avoid future charges.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm-delete-input" className="text-xs font-medium text-zinc-300 block">
            Type <span className="font-semibold text-rose-400 font-mono">delete</span> to confirm:
          </label>
          <input
            id="confirm-delete-input"
            type="text"
            value={deleteConfirmationInput}
            onChange={(e) => setDeleteConfirmationInput(e.target.value)}
            placeholder="delete"
            disabled={isDeleting}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-rose-500/40 focus:ring-1 focus:ring-rose-500/40 transition-all font-mono"
          />
        </div>

        {deleteError && <p className="text-xs text-rose-400 leading-relaxed">{deleteError}</p>}

        <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={isDeleting} onClick={handleClose} className="w-full xs:w-auto">
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={deleteConfirmationInput.trim().toLowerCase() !== "delete" || isDeleting}
            onClick={handleDeleteAccount}
            className="gap-1.5 w-full xs:w-auto"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Permanently Delete</span>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
