"use client";

import React, { useCallback, useMemo } from "react";
import { Share2, Pencil, Trash2, ExternalLink, Pin } from "lucide-react";
import { CompactMenu, CompactMenuSection, CompactMenuItem } from "@/components/ui/compact-menu";
import {
  useRenameConversation,
  useDeleteConversation,
  useTogglePinConversation,
} from "@/features/conversations/hooks/use-conversations";
import { getConversationPath } from "@/features/conversations/utils/conversation-url";

export interface ConversationOptionsMenuProps {
  /** The conversation this menu operates on. */
  conversationId: string;
  documentId?: string;
  isOpen: boolean;
  onClose: () => void;

  /** Toggle visibility of each option. Omit or set false to hide. */
  showOpenInNewWindow?: boolean;
  showShare?: boolean;
  showRename?: boolean;
  showPin?: boolean;
  showDelete?: boolean;

  /** Pin state — required when showPin is true. */
  isPinned?: boolean;

  className?: string;
}

export function ConversationOptionsMenu({
  conversationId,
  documentId,
  isOpen,
  onClose,
  showOpenInNewWindow = false,
  showShare = false,
  showRename = false,
  showPin = false,
  showDelete = false,
  isPinned,
  className,
}: ConversationOptionsMenuProps) {
  const { mutate: renameConversation } = useRenameConversation();
  const { mutate: deleteConversation } = useDeleteConversation();
  const { mutate: togglePinConversation } = useTogglePinConversation();

  const handleOpenInNewWindow = useCallback(() => {
    const url = getConversationPath(conversationId, documentId);
    // fallow-ignore-next-line security-sink
    window.open(url, "_blank", "noopener,noreferrer");
  }, [conversationId, documentId]);

  const handleShare = useCallback(() => {
    const path = getConversationPath(conversationId, documentId);
    navigator.clipboard.writeText(`${window.location.origin}${path}`);
  }, [conversationId, documentId]);

  const handleRename = useCallback(() => {
    const newTitle = window.prompt("Rename conversation");
    if (newTitle?.trim()) {
      renameConversation({ convId: conversationId, newTitle: newTitle.trim() });
    }
  }, [conversationId, renameConversation]);

  const handlePin = useCallback(() => {
    togglePinConversation(conversationId);
  }, [togglePinConversation, conversationId]);

  const handleDelete = useCallback(() => {
    deleteConversation(conversationId);
  }, [conversationId, deleteConversation]);

  // --- Build menu sections ---

  const sections = useMemo<CompactMenuSection[]>(() => {
    const items: CompactMenuItem[] = [];

    if (showOpenInNewWindow) {
      items.push({
        label: "Open in new window",
        icon: ExternalLink,
        onClick: handleOpenInNewWindow,
      });
    }

    if (showShare) {
      items.push({
        label: "Share chat",
        icon: Share2,
        onClick: handleShare,
      });
    }

    if (showRename) {
      items.push({
        label: "Rename",
        icon: Pencil,
        onClick: handleRename,
      });
    }

    if (showPin) {
      items.push({
        label: isPinned ? "Unpin conversation" : "Pin conversation",
        icon: Pin,
        onClick: handlePin,
      });
    }

    return items.length > 0 ? [{ items }] : [];
  }, [showOpenInNewWindow, showShare, showRename, showPin, isPinned, handleOpenInNewWindow, handleShare, handleRename, handlePin]);

  const destructiveAction: CompactMenuItem | undefined = useMemo(() => {
    if (!showDelete) return undefined;
    return {
      label: "Delete chat",
      icon: Trash2,
      onClick: handleDelete,
    };
  }, [showDelete, handleDelete]);

  return (
    <CompactMenu
      isOpen={isOpen}
      onClose={onClose}
      sections={sections}
      destructiveAction={destructiveAction}
      className={className}
      width="w-44"
      align="right"
    />
  );
}
