export type ProcessingStatus =
  | "UPLOADING"
  | "EXTRACTING"
  | "CHUNKING"
  | "EMBEDDING"
  | "INDEXING"
  | "READY"
  | "FAILED";

export interface Citation {
  documentId: string;
  documentName: string;
  page: number;
  chunkIndex: number;
  textSnippet: string;
  relevanceScore: number;
}

export interface Document {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  fileUrl: string;
  fileSize: number; // in bytes
  pageCount: number;
  chunkCount: number;
  status: ProcessingStatus;
  processingProgress: number; // 0 to 100
  error: string | null;
  createdAt: string;
  updatedAt: string;
  hasOpened?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources?: Citation[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  documentIds: string[];
  lastMessageSnippet?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  dailyQueriesUsed: number;
  dailyQueriesLimit: number;
}

export interface MockPdfPage {
  pageNumber: number;
  title: string;
  paragraphs: string[];
  hasHighlight?: boolean;
  highlightSnippet?: string;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
}
