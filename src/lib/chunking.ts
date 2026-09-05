import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { ExtractedPage } from "./pdf-parser";

export interface TextChunk {
  text: string;
  documentId: string;
  userId: string;
  page: number;
  chunkIndex: number;
}

interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  separators?: string[];
}

/**
 * Split extracted pages into overlapping chunks using LangChain's RecursiveCharacterTextSplitter.
 * Each chunk retains its documentId, userId, source page, and sequential index for citation spotlighting.
 *
 * Default: 1000 chars per chunk with 150 char overlap (PRD §13).
 */
export async function chunkText(
  pages: ExtractedPage[],
  documentId: string,
  userId: string,
  options: ChunkOptions = {}
): Promise<TextChunk[]> {
  const { chunkSize = 1000, chunkOverlap = 150, separators } = options;

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    ...(separators ? { separators } : {}),
  });

  const chunks: TextChunk[] = [];
  let globalIndex = 0;

  for (const page of pages) {
    const rawText = page.text?.trim();
    if (!rawText) continue;

    const splitTexts = await splitter.splitText(rawText);

    for (const text of splitTexts) {
      const trimmed = text.trim();
      if (trimmed.length === 0) continue;

      chunks.push({
        text: trimmed,
        documentId,
        userId,
        page: page.pageNumber,
        chunkIndex: globalIndex++,
      });
    }
  }

  return chunks;
}

