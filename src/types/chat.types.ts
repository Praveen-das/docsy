import type { HistoryMessage } from "@/lib/validations/chat.schema";

export interface ChatWorkflowPayload {
  messageId: string;
  streamChannelId?: string;
  conversationId: string;
  userId: string;
  documentIds: string[];
  content: string;
  conversationHistory?: HistoryMessage[];
  skipUserPersistence?: boolean;
  replaceAssistantMessageId?: string;
}
