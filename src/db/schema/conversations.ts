import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Conversations table.
 * Each conversation belongs to a user and links to one or more documents
 * via the `conversation_documents` junction table.
 */
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("New Conversation"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("conversations_user_id_idx").on(table.userId),
    index("conversations_user_id_updated_at_idx").on(table.userId, table.updatedAt),
  ]
);

export type ConversationRecord = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
