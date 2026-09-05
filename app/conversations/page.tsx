"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Conversation } from "@/types";
import { useConversationStore } from "@/stores/conversation-store";
import { useDocumentStore } from "@/stores/document-store";
import { formatRelativeTime } from "@/lib/format-time";
import { MessageSquare, Search, Plus, Trash2, Clock, FileText, ArrowRight, Sparkles } from "lucide-react";

export default function ConversationsPage() {
  const conversations = useConversationStore((state) => state.conversations);
  const fetchConversations = useConversationStore((state) => state.fetchConversations);
  const deleteConversation = useConversationStore((state) => state.deleteConversation);

  const documents = useDocumentStore((state) => state.documents);
  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments);

  const [searchQuery, setSearchQuery] = useState("");
  const [convToDelete, setConvToDelete] = useState<Conversation | null>(null);

  useEffect(() => {
    fetchConversations();
    fetchDocuments();
  }, [fetchConversations, fetchDocuments]);

  const filtered = conversations.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleDelete = () => {
    if (!convToDelete) return;
    deleteConversation(convToDelete.id);
    setConvToDelete(null);
  };

  return (
    <AppLayout title="Conversations">
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Conversation History
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Review past document discussions, check citations, or resume questioning.
            </p>
          </div>

          <Link href="/conversation">
            <Button variant="accent" size="sm">
              <Plus className="h-4 w-4" />
              <span>New Conversation</span>
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations by title or topic..."
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-white/10 dark:bg-[#141418] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500/60"
          />
        </div>

        {/* Conversations List */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-[#141418]">
            <MessageSquare className="mx-auto h-8 w-8 text-zinc-400 dark:text-zinc-500 mb-2" />
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No conversations found</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Start a new conversation with any processed document.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((conv) => {
              const linkedDocs = documents.filter((d) => conv.documentIds.includes(d.id));

              return (
                <div
                  key={conv.id}
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs hover:border-zinc-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group dark:border-white/10 dark:bg-[#141418] dark:hover:border-white/20"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {conv.title}
                      </h3>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-600 font-medium border border-zinc-200 dark:bg-[#1c1c22] dark:text-zinc-400 dark:border-white/10">
                        {conv.messageCount} messages
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {conv.lastMessageSnippet}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-zinc-400 dark:text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(conv.updatedAt)}
                      </span>
                      <span>•</span>
                      <div className="flex items-center gap-1.5 overflow-x-auto">
                        {linkedDocs.map((doc) => (
                          <span
                            key={doc.id}
                            className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600 border border-blue-200 dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20"
                          >
                            <FileText className="h-2.5 w-2.5" />
                            <span className="truncate max-w-[140px]">{doc.originalName}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => setConvToDelete(conv)}
                      className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer dark:text-zinc-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/10"
                      title="Delete conversation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <Link href={`/conversation?doc=${conv.documentIds[0] || "doc-1"}&conv=${conv.id}`}>
                      <Button size="sm" variant="outline" className="h-9">
                        <span>Continue</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={!!convToDelete}
        onClose={() => setConvToDelete(null)}
        title="Delete Conversation?"
        description="Deleting a conversation permanently removes its question history. Your uploaded documents will NOT be deleted."
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Are you sure you want to delete &ldquo;{convToDelete?.title}&rdquo;?
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConvToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Delete Conversation
            </Button>
          </div>
        </div>
      </Dialog>
    </AppLayout>
  );
}
