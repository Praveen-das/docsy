"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import { useDocumentStore } from "@/stores/document-store";
import { DocumentOptionsMenu } from "@/features/documents/components/document-options-menu";
import { cn } from "@/lib/utils";
import type { Document } from "@/types";

export interface DocumentOptionsProps {
  document: Document;
  /** Triggered when user selects "Conversations" — opens a dialog managed by the parent page. */
  onOpenConversations: (doc: Document) => void;
  /** Triggered when user selects "Delete" — opens a confirmation dialog managed by the parent page. */
  onDelete?: (doc: Document) => void;
  onClose?: () => void;
  className?: string;
  isMenuOpen?: boolean;
}

/**
 * Self-contained 3-dot options trigger + dropdown menu for documents.
 *
 * Owns its own open/close state and reads store actions directly
 * (favorite, reprocess, check status) — no prop drilling needed.
 *
 * Only page-level dialog triggers (conversations, delete) are passed as optional callbacks.
 */
export function DocumentOptions({
  document: doc,
  onOpenConversations,
  onDelete,
  className,
  isMenuOpen = false,
  onClose,
}: DocumentOptionsProps) {
  return (
    <DocumentOptionsMenu
      document={doc}
      isOpen={isMenuOpen}
      onClose={() => onClose?.()}
      onOpenConversations={onOpenConversations}
      onDelete={onDelete}
    />
  );
}
