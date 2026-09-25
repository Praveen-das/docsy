"use client";

import React, { useCallback, useMemo } from "react";
import { Message } from "@/types";
import { ChatHeader } from "./components/chat-header";
import { MessageList } from "./components/message-list";
import { ChatComposer } from "./components/chat-composer";
import { ChatProvider } from "./context/chat-context";
import { useChatConversation } from "./hooks/use-chat-conversation";
import { useChatDraft } from "./hooks/use-chat-draft";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import BottomGlow from "@/components/ui/BottomGlow";

export interface ChatViewProps {
  conversationId?: string;
  conversationTitle?: string;
  documentId?: string;
  isViewerOpen?: boolean;
  onToggleViewer?: () => void;
  onCitationClick?: (pageNumber: number) => void;
  // Optional overrides for standalone usage and testing
  messages?: Message[];
  isLoading?: boolean;
  onSendMessage?: (content: string) => void;
}

export function ChatView({
  conversationId: propConversationId,
  conversationTitle: propConversationTitle,
  documentId: propDocumentId,
  isViewerOpen = true,
  onToggleViewer,
  onCitationClick,
  messages: propMessages,
  isLoading: propIsLoading,
  onSendMessage: propOnSendMessage,
}: ChatViewProps) {
  const {
    activeConvId,
    title,
    historyMessages,
    pendingMessages,
    isLoading,
    isAiTyping,
    streamingContent,
    isLoadingMessages,
    hasMoreMessages,
    isLoadingOlderMessages,
    isErrorOlderMessages,
    fetchOlderMessages,
    handleSendMessage,
    handleEditMessage,
    handleRegenerateMessage,
    handleRetryMessage,
    handleShareMessage,
    regeneratingMessageId,
    handleDelete,
  } = useChatConversation({
    conversationId: propConversationId,
    conversationTitle: propConversationTitle,
    documentId: propDocumentId,
    propMessages,
    propIsLoading,
    propOnSendMessage,
  });

  const { inputText, handleInputChange, clearInput } = useChatDraft(activeConvId);

  const { data: documents = [] } = useDocuments();
  const activeDoc = propDocumentId ? documents.find((d) => d.id === propDocumentId) : undefined;
  const documentName = activeDoc?.originalName || "System Design Notes.pdf";
  const pageCount = activeDoc?.pageCount || 24;

  const handleSubmit = useCallback(() => {
    handleSendMessage(inputText, clearInput);
  }, [handleSendMessage, inputText, clearInput]);

  const handleSelectStarterQuestion = useCallback(
    (question: string) => {
      handleSendMessage(question, clearInput);
    },
    [handleSendMessage, clearInput],
  );

  const chatContextValue = useMemo(
    () => ({
      onSelectStarterQuestion: handleSelectStarterQuestion,
    }),
    [handleSelectStarterQuestion],
  );

  return (
    <ChatProvider value={chatContextValue}>
      <div className="relative flex h-full flex-col bg-[#08090d] text-white">
        {/* Top Header matching Image 2 */}
        <ChatHeader
          conversationId={activeConvId || ""}
          conversationTitle={title || "Summarize the key findings"}
          documentName={documentName}
          pageCount={pageCount}
          lastUpdated="2 hours ago"
          isViewerOpen={isViewerOpen}
          onToggleViewer={onToggleViewer}
        />

        {/* Main Chat Body Container */}
        <div className="relative flex flex-1 flex-col overflow-hidden min-h-0 z-20">
          <MessageList
            messages={historyMessages}
            pendingMessages={pendingMessages}
            isLoadingMessages={isLoadingMessages}
            isAiTyping={isAiTyping}
            streamingContent={streamingContent}
            regeneratingMessageId={regeneratingMessageId}
            hasMoreMessages={hasMoreMessages}
            isLoadingOlderMessages={isLoadingOlderMessages}
            isErrorOlderMessages={isErrorOlderMessages}
            onLoadOlderMessages={fetchOlderMessages}
            onEditMessage={handleEditMessage}
            onRegenerateMessage={handleRegenerateMessage}
            onRetryMessage={handleRetryMessage}
            onShareMessage={handleShareMessage}
          />

          {/* Floating Input Composer Bar matching Image 2 */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#08090d] via-[#08090d]/80 to-transparent pt-6">
            <div className="pointer-events-auto">
              <ChatComposer
                inputText={inputText}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
        <BottomGlow className="z-10" />
      </div>
    </ChatProvider>
  );
}
