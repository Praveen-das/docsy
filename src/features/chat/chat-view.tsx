"use client";

import React, { useCallback, useMemo } from "react";
import { Message } from "@/types";
import { ChatHeader } from "./components/chat-header";
import { MessageList } from "./components/message-list";
import { ChatComposer } from "./components/chat-composer";
import { ChatProvider } from "./context/chat-context";
import { useChatConversation } from "./hooks/use-chat-conversation";
import { useChatDraft } from "./hooks/use-chat-draft";

export interface ChatViewProps {
  conversationId?: string;
  conversationTitle?: string;
  documentId?: string;
  onDeleteChat?: () => void;
  // Optional overrides for standalone usage and testing
  messages?: Message[];
  isLoading?: boolean;
  onSendMessage?: (content: string) => void;
}

export function ChatView({
  conversationId: propConversationId,
  conversationTitle: propConversationTitle,
  documentId: propDocumentId,
  onDeleteChat,
  messages: propMessages,
  isLoading: propIsLoading,
  onSendMessage: propOnSendMessage,
}: ChatViewProps) {
  const {
    activeConvId,
    title,
    messages,
    isLoading,
    isAiTyping,
    isLoadingMessages,
    isGeneratingTitle,
    handleSendMessage,
    handleDelete,
    handleGenerateTitle,
  } = useChatConversation({
    conversationId: propConversationId,
    conversationTitle: propConversationTitle,
    documentId: propDocumentId,
    propMessages,
    propIsLoading,
    propOnSendMessage,
    onDeleteChat,
  });

  const { inputText, handleInputChange, clearInput } = useChatDraft(activeConvId);

  const handleSubmit = useCallback(() => {
    handleSendMessage(inputText, clearInput);
  }, [handleSendMessage, inputText, clearInput]);

  const handleSelectStarterQuestion = useCallback(
    (question: string) => {
      handleSendMessage(question, clearInput);
    },
    [handleSendMessage, clearInput]
  );

  const chatContextValue = useMemo(
    () => ({
      onSelectStarterQuestion: handleSelectStarterQuestion,
    }),
    [handleSelectStarterQuestion]
  );

  return (
    <ChatProvider value={chatContextValue}>
      <div className="flex h-full flex-col bg-white dark:bg-[#08080a]">
        {/* Top Header */}
        <ChatHeader
          conversationTitle={title}
          onDeleteChat={handleDelete}
          onGenerateTitle={handleGenerateTitle}
          isGeneratingTitle={isGeneratingTitle}
          canGenerateTitle={Boolean(activeConvId)}
        />

        {/* Message Feed Container */}
        <MessageList messages={messages} isLoadingMessages={isLoadingMessages} isAiTyping={isAiTyping} />

        {/* Input Composer Bar */}
        <ChatComposer
          inputText={inputText}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </ChatProvider>
  );
}
