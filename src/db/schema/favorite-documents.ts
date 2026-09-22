import {
  pgTable,
  uuid,
  text,
  timestamp,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { documents } from "./documents";

/**
 * Junction / tracking table for user-favorite documents.
 * Composite primary key on (user_id, document_id).
 */
export const favoriteDocuments = pgTable(
  "favorite_documents",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.documentId] }),
    index("favorite_documents_user_id_idx").on(table.userId),
    index("favorite_documents_document_id_idx").on(table.documentId),
  ]
);

export type FavoriteDocumentRecord = typeof favoriteDocuments.$inferSelect;
export type NewFavoriteDocument = typeof favoriteDocuments.$inferInsert;
