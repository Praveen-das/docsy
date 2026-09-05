import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { conversations } from "./conversations";

/**
 * Messages table.
 * Stores conversation messages with optional JSONB `sources` for citation data.
 * Cascade-deletes when the parent conversation is removed.
 */
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
    content: text("content").notNull(),
    sources: jsonb("sources").default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("messages_conversation_id_created_at_idx").on(
      table.conversationId,
      table.createdAt
    ),
  ]
);

export type MessageRecord = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
