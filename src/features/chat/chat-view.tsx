"use client";

import { useCallback, useMemo } from "react";
import { ChatHeader } from "./components/chat-header";
import { MessageList } from "./components/message-list";
import { ChatComposer } from "./components/chat-composer";
import { ChatProvider } from "./context/chat-context";
import { useChatConversation } from "./hooks/use-chat-conversation";
import { useChatDraft } from "./hooks/use-chat-draft";
import BottomGlow from "@/components/ui/BottomGlow";

export interface ChatViewProps {
  documentId?: string;
  isViewerOpen?: boolean;
  onToggleViewer?: () => void;
}

export function ChatView({ documentId, isViewerOpen = true, onToggleViewer }: ChatViewProps) {
  const {
    activeConvId,
    title,
    primaryDoc,
    pages,
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
  } = useChatConversation({ documentId });

  const { inputText, handleInputChange, clearInput } = useChatDraft(activeConvId);

  const documentName = primaryDoc?.originalName || "System Design Notes.pdf";
  const pageCount = primaryDoc?.pageCount || 24;

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
            pages={pages}
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
