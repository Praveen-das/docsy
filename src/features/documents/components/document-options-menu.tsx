"use client";

import React, { useMemo } from "react";
import { MessageSquare, RefreshCw, Trash2, Star } from "lucide-react";
import { CompactMenu, CompactMenuSection, CompactMenuItem } from "@/components/ui/compact-menu";
import { Document } from "@/types";
import {
  useToggleFavoriteDocument,
  useReprocessDocument,
  useCheckDocumentStatus,
} from "../hooks/use-documents";

export interface DocumentOptionsMenuProps {
  document: Document;
  isOpen: boolean;
  onOpenConversations: (doc: Document) => void;
  onClose: () => void;
  onDelete?: (doc: Document) => void;
  className?: string;
}

export function DocumentOptionsMenu({
  document: doc,
  isOpen,
  onOpenConversations,
  onClose,
  onDelete,
  className,
}: DocumentOptionsMenuProps) {
  const isFavorite = Boolean(doc.isFavorite);
  const { mutate: toggleFavorite } = useToggleFavoriteDocument();
  const { mutate: reprocessDocument } = useReprocessDocument();
  const { mutate: checkDocumentStatus } = useCheckDocumentStatus();
  const sections = useMemo<CompactMenuSection[]>(() => {
    const items: CompactMenuItem[] = [
      {
        label: isFavorite ? "Remove from Favorites" : "Add to Favorites",
        icon: Star,
        onClick: () => toggleFavorite(doc.id),
        variant: isFavorite ? "warning" : "default",
      },
    ];

    if (doc.status === "READY") {
      items.push({
        label: "Conversations",
        icon: MessageSquare,
        onClick: () => onOpenConversations(doc),
        variant: "default",
      });
    }

    if (doc.status !== "READY" && doc.status !== "FAILED") {
      items.push({
        label: "Check Status",
        icon: RefreshCw,
        onClick: () => checkDocumentStatus(doc.id),
        variant: "warning",
      });
    }

    if (doc.status === "FAILED") {
      items.push({
        label: "Retry Processing",
        icon: RefreshCw,
        onClick: () => reprocessDocument(doc.id),
        variant: "accent",
      });
    }

    return items.length > 0 ? [{ items }] : [];
  }, [doc, isFavorite]);

  const destructiveAction: CompactMenuItem | undefined = useMemo(() => {
    if (!onDelete) return undefined;
    return {
      label: "Delete PDF",
      icon: Trash2,
      onClick: () => onDelete(doc),
    };
  }, [doc, onDelete]);

  return (
    <CompactMenu
      isOpen={isOpen}
      onClose={onClose}
      sections={sections}
      destructiveAction={destructiveAction}
      className={className}
      width="w-48"
      align="right"
    />
  );
}
