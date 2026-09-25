"use client";

import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ClearCacheDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ClearCacheDialog({ isOpen, onClose, onConfirm }: ClearCacheDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Clear Cache & Reload?"
      description="This will clear your locally stored browser settings, draft chat messages, and cached preferences, then reload the page."
    >
      <div className="space-y-4 pt-1">
        <p className="text-xs text-zinc-400 leading-relaxed">
          Your documents, conversations, and account data in the database will NOT be affected.
        </p>

        <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="w-full xs:w-auto">
            Cancel
          </Button>
          <Button variant="accent" size="sm" onClick={onConfirm} className="w-full xs:w-auto">
            Clear & Reload
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
