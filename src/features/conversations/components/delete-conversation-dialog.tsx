"use client";

import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/types";

export interface DeleteConversationDialogProps {
  conversation: Conversation | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function DeleteConversationDialog({
  conversation,
  onClose,
  onConfirm,
}: DeleteConversationDialogProps) {
  if (!conversation) return null;

  return (
    <Dialog
      isOpen={!!conversation}
      onClose={onClose}
      title="Delete Conversation?"
      description="This will permanently delete this conversation and its question history. Your document will NOT be deleted."
    >
      <div className="space-y-4 pt-2">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Are you sure you want to delete &ldquo;{conversation.title}&rdquo;?
        </p>
        <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="w-full xs:w-auto">
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onConfirm(conversation.id);
              onClose();
            }}
            className="w-full xs:w-auto"
          >
            Delete Conversation
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
