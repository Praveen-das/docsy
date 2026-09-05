"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Message, Citation } from "@/types";
import { useConversationStore } from "@/stores/conversation-store";
import { useDocumentStore } from "@/stores/document-store";
import { ChatHeader } from "./components/chat-header";
import { MessageList } from "./components/message-list";
import { ChatComposer } from "./components/chat-composer";
import { ChatProvider } from "./context/chat-context";

export interface ChatViewProps {
  conversationId?: string;
  conversationTitle?: string;
  activeCitation?: Citation | null;
  onSelectCitation?: (citation: Citation) => void;
  onDeleteChat?: () => void;
  // Optional overrides for standalone usage and testing
  messages?: Message[];
  isLoading?: boolean;
  onSendMessage?: (content: string) => void;
}

export function ChatView({
  conversationId: propConversationId,
  conversationTitle: propConversationTitle,
  activeCitation,
  onSelectCitation,
  onDeleteChat,
  messages: propMessages,
  isLoading: propIsLoading,
  onSendMessage: propOnSendMessage,
}: ChatViewProps) {
  const router = useRouter();

  // Zustand selectors following strict selector rule
  const storeActiveConvId = useConversationStore(
    (state) => state.activeConversationId
  );
  const conversations = useConversationStore((state) => state.conversations);
  const messagesRecord = useConversationStore((state) => state.messages);
  const drafts = useConversationStore((state) => state.drafts);
  const storeIsLoading = useConversationStore((state) => state.isLoadingAi);
  const sendMessage = useConversationStore((state) => state.sendMessage);
  const saveDraft = useConversationStore((state) => state.saveDraft);
  const deleteConversation = useConversationStore(
    (state) => state.deleteConversation
  );
  const createConversation = useConversationStore(
    (state) => state.createConversation
  );

  const documents = useDocumentStore((state) => state.documents);

  const activeConvId = propConversationId || storeActiveConvId || "";
  const activeConv = conversations.find((c) => c.id === activeConvId);
  const docId = activeConv?.documentIds[0];
  const primaryDoc = docId ? documents.find((d) => d.id === docId) : documents[0];

  const title =
    propConversationTitle || activeConv?.title || "Document Conversation";
  const messages = propMessages ?? messagesRecord[activeConvId] ?? [];
  const isLoading = propIsLoading !== undefined ? propIsLoading : storeIsLoading;

  const currentDraft = drafts[activeConvId] || "";
  const [inputText, setInputText] = useState(currentDraft);
  const prevConvIdRef = useRef(activeConvId);

  // Sync draft text when active conversation changes
  useEffect(() => {
    if (prevConvIdRef.current !== activeConvId) {
      prevConvIdRef.current = activeConvId;
      setInputText(currentDraft);
    }
  }, [activeConvId, currentDraft]);

  const handleInputChange = (value: string) => {
    setInputText(value);
    saveDraft(activeConvId, value);
  };

  const handleSubmit = () => {
    if (!inputText.trim() || isLoading) return;
    const content = inputText.trim();
    if (propOnSendMessage) {
      propOnSendMessage(content);
    } else {
      sendMessage(activeConvId, content, primaryDoc);
    }
    setInputText("");
    saveDraft(activeConvId, "");
  };

  const handleSelectStarterQuestion = (question: string) => {
    setInputText(question);
    if (propOnSendMessage) {
      propOnSendMessage(question);
    } else {
      sendMessage(activeConvId, question, primaryDoc);
    }
  };

  const handleDelete = () => {
    if (onDeleteChat) {
      onDeleteChat();
      return;
    }
    deleteConversation(activeConvId);

    if (!docId) {
      router.replace("/conversation");
      return;
    }

    const remaining = conversations.filter(
      (c) => c.documentIds.includes(docId) && c.id !== activeConvId
    );
    if (remaining.length > 0) {
      router.replace(`/conversation?doc=${docId}&conv=${remaining[0].id}`);
    } else {
      const newId = createConversation(docId);
      router.replace(`/conversation?doc=${docId}&conv=${newId}`);
    }
  };

  const chatContextValue = useMemo(
    () => ({
      activeCitation,
      onSelectCitation,
      onSelectStarterQuestion: handleSelectStarterQuestion,
    }),
    [activeCitation, onSelectCitation]
  );

  return (
    <ChatProvider value={chatContextValue}>
      <div className="flex h-full flex-col bg-white dark:bg-[#08080a]">
        {/* Top Header */}
        <ChatHeader
          conversationTitle={title}
          onDeleteChat={handleDelete}
        />

        {/* Message Feed Container */}
        <MessageList
          messages={messages}
          isLoading={isLoading}
        />

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
