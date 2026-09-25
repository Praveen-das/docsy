export type FeedbackCategory =
  | "idea"
  | "bug"
  | "performance"
  | "parsing"
  | "general";

export const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  "idea",
  "bug",
  "performance",
  "parsing",
  "general",
];

/** Attachment metadata returned from the server (after upload). */
export interface FeedbackAttachment {
  name: string;
  size: number;
  type: string;
  storagePath: string;
  publicUrl: string;
}

/** Client-side attachment that carries the actual File reference for upload. */
export interface FeedbackAttachmentWithFile {
  name: string;
  size: number;
  type: string;
  file: File;
}

export interface FeedbackSubmission {
  id: string;
  userId: string;
  category: FeedbackCategory;
  message: string;
  attachments: FeedbackAttachment[];
  createdAt: string;
}
