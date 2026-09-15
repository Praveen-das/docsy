import { z } from "zod";

export const historyMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(10000),
});

export const chatStreamSchema = z.object({
  messageId: z.string().optional(),
  streamChannelId: z.string().optional(),
  content: z.string().min(1).max(10000),
  conversationHistory: z.array(historyMessageSchema).optional(),
  conversationToken: z.string().optional(),
  skipUserPersistence: z.boolean().optional(),
  replaceAssistantMessageId: z.string().optional(),
});

export type HistoryMessage = z.infer<typeof historyMessageSchema>;
export type ChatStreamInput = z.infer<typeof chatStreamSchema>;

