"use client";

import React, { useCallback, useMemo } from "react";
import { Share2, Pencil, Trash2, ExternalLink, Pin } from "lucide-react";
import { CompactMenu, CompactMenuSection, CompactMenuItem } from "@/components/ui/compact-menu";
import { useConversationStore } from "@/stores/conversation-store";

export interface ConversationOptionsMenuProps {
  /** The conversation this menu operates on. */
  conversationId: string;
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

  /**
   * Optional override callbacks.
   * When provided, these run INSTEAD of the default implementation.
   * Useful when the parent needs to coordinate local UI state (e.g. inline rename editor).
   */
  onOpenInNewWindow?: () => void;
  onShare?: () => void;
  onRename?: () => void;
  onPin?: () => void;
  onDelete?: () => void;

  className?: string;
}

export function ConversationOptionsMenu({
  conversationId,
  isOpen,
  onClose,
  showOpenInNewWindow = false,
  showShare = false,
  showRename = false,
  showPin = false,
  showDelete = false,
  isPinned,
  onOpenInNewWindow,
  onShare,
  onRename,
  onPin,
  onDelete,
  className,
}: ConversationOptionsMenuProps) {
  const renameConversation = useConversationStore((s) => s.renameConversation);
  const deleteConversation = useConversationStore((s) => s.deleteConversation);
  const togglePinConversation = useConversationStore((s) => s.togglePinConversation);

  // --- Default implementations ---

  const handleOpenInNewWindow = useCallback(() => {
    if (onOpenInNewWindow) return onOpenInNewWindow();
    window.open(`/conversation/${conversationId}`, "_blank");
  }, [conversationId, onOpenInNewWindow]);

  const handleShare = useCallback(() => {
    if (onShare) return onShare();
    // Default: copy link to clipboard
    navigator.clipboard.writeText(`${window.location.origin}/conversation/${conversationId}`);
  }, [conversationId, onShare]);

  const handleRename = useCallback(() => {
    if (onRename) return onRename();
    // Default: prompt-based rename
    const newTitle = window.prompt("Rename conversation");
    if (newTitle?.trim()) {
      renameConversation(conversationId, newTitle.trim());
    }
  }, [conversationId, onRename, renameConversation]);

  const handlePin = useCallback(() => {
    if (onPin) return onPin();
    togglePinConversation(conversationId);
  }, [onPin, togglePinConversation, conversationId]);

  const handleDelete = useCallback(() => {
    if (onDelete) return onDelete();
    deleteConversation(conversationId);
  }, [conversationId, onDelete, deleteConversation]);

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
