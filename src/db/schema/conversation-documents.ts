import {
  pgTable,
  uuid,
  timestamp,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { conversations } from "./conversations";
import { documents } from "./documents";

/**
 * Junction table for many-to-many relationship between conversations and documents.
 * Composite primary key on (conversation_id, document_id).
 */
export const conversationDocuments = pgTable(
  "conversation_documents",
  {
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.conversationId, table.documentId] }),
    index("conversation_documents_document_id_idx").on(table.documentId),
    index("conversation_documents_conversation_id_idx").on(table.conversationId),
  ]
);

export type ConversationDocumentRecord = typeof conversationDocuments.$inferSelect;
export type NewConversationDocument = typeof conversationDocuments.$inferInsert;
