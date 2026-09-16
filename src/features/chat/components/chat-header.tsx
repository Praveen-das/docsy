"use client";

import React, { useState } from "react";
import {
  MoreHorizontal,
  Share2,
  Trash2,
  Pencil,
  FileText,
  Check,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatHeaderProps {
  conversationTitle: string;
  documentName?: string;
  pageCount?: number;
  lastUpdated?: string;
  isViewerOpen?: boolean;
  onToggleViewer?: () => void;
  onShareChat?: () => void;
  onDeleteChat?: () => void;
  onRenameTitle?: (newTitle: string) => void;
}

export function ChatHeader({
  conversationTitle,
  documentName = "System Design Notes.pdf",
  pageCount = 24,
  lastUpdated = "2 hours ago",
  isViewerOpen = true,
  onToggleViewer,
  onShareChat,
  onDeleteChat,
  onRenameTitle,
}: ChatHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(conversationTitle);

  const handleSaveTitle = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = editedTitle.trim();
    if (trimmed && trimmed !== conversationTitle) {
      onRenameTitle?.(trimmed);
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="border-b border-white/[0.06] bg-[#08090d]/90 backdrop-blur-md px-6 py-3.5 select-none shrink-0 space-y-2.5">
      {/* Top Bar matching Image 2: Red PDF badge, doc title, Opened status, View PDF, ... */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Document Info & Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Red PDF Badge */}
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#ef4444] text-white shadow-xs">
            <span className="text-[9px] font-black uppercase font-sans">PDF</span>
          </div>

          <span
            className="text-xs sm:text-sm font-semibold text-white truncate max-w-[240px] sm:max-w-md"
            title={documentName}
          >
            {documentName}
          </span>

          {/* Status Indicator: Opened · 24 pages */}
          <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="font-medium text-emerald-400">Opened</span>
            <span>•</span>
            <span>{pageCount} pages</span>
          </div>
        </div>

        {/* Right: View PDF Toggle Button & More Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {onToggleViewer && (
            <button
              type="button"
              onClick={onToggleViewer}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer",
                isViewerOpen
                  ? "bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                  : "bg-white/[0.04] border border-white/8 text-zinc-300 hover:text-white hover:bg-white/8"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{isViewerOpen ? "Hide PDF" : "View PDF"}</span>
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] border border-white/8 text-zinc-400 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 z-50 w-44 rounded-xl border border-white/10 bg-[#12141e] p-1.5 shadow-xl shadow-black/40 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onShareChat?.();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                  >
                    <Share2 className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Share chat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsEditingTitle(true);
                      setEditedTitle(conversationTitle);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Rename</span>
                  </button>

                  <div className="my-1 border-t border-white/5" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDeleteChat?.();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete chat</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Conversation Title & Subtitle matching Image 2 */}
      <div className="pt-0.5">
        {isEditingTitle ? (
          <form onSubmit={handleSaveTitle} className="flex items-center gap-2">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              autoFocus
              className="text-base sm:text-lg font-bold text-white bg-[#141624] border border-indigo-500/40 rounded-lg px-2 py-0.5 focus:outline-none"
            />
            <button
              type="submit"
              className="p-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-500"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2 group/title">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
              {conversationTitle || "Summarize the key findings"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsEditingTitle(true);
                setEditedTitle(conversationTitle);
              }}
              className="opacity-0 group-hover/title:opacity-100 text-zinc-400 hover:text-white transition-opacity p-0.5 cursor-pointer"
              title="Edit title"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <p className="text-[11px] text-zinc-500 mt-0.5">
          Last updated {lastUpdated}
        </p>
      </div>
    </div>
  );
}
