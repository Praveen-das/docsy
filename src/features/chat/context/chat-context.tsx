"use client";

import React, { createContext, useContext } from "react";

export interface ChatContextValue {
  onSelectStarterQuestion?: (question: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: ChatContextValue;
}) {
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  return context ?? {};
}
