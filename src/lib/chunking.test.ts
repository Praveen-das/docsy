import { describe, it, expect } from "vitest";
import { chunkText } from "./chunking";
import type { ExtractedPage } from "./pdf-parser";

describe("chunkText", () => {
  it("splits text into chunks and assigns correct metadata and sequential indexes", async () => {
    const pages: ExtractedPage[] = [
      {
        pageNumber: 1,
        text: "Paragraph one with some introductory text for testing chunk splitting.\n\nParagraph two with more content.",
      },
      {
        pageNumber: 2,
        text: "Page two content that describes additional document information in detail.",
      },
    ];

    const chunks = await chunkText(pages, "doc_abc", "user_123", {
      chunkSize: 50,
      chunkOverlap: 10,
    });

    expect(chunks.length).toBeGreaterThan(1);

    // Verify all chunks retain documentId, userId, and sequential index
    chunks.forEach((chunk, idx) => {
      expect(chunk.documentId).toBe("doc_abc");
      expect(chunk.userId).toBe("user_123");
      expect(chunk.chunkIndex).toBe(idx);
      expect(typeof chunk.page).toBe("number");
      expect(chunk.text.length).toBeGreaterThan(0);
    });

    // Verify page numbers are preserved accurately
    expect(chunks.some((c) => c.page === 1)).toBe(true);
    expect(chunks.some((c) => c.page === 2)).toBe(true);
  });

  it("skips empty or whitespace-only pages without throwing or creating empty chunks", async () => {
    const pages: ExtractedPage[] = [
      { pageNumber: 1, text: "   " },
      { pageNumber: 2, text: "" },
      { pageNumber: 3, text: "Valid content on page three." },
    ];

    const chunks = await chunkText(pages, "doc_empty", "user_1");

    expect(chunks).toHaveLength(1);
    expect(chunks[0].page).toBe(3);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[0].text).toBe("Valid content on page three.");
  });

  it("returns an empty array when pages input is empty", async () => {
    const chunks = await chunkText([], "doc_1", "user_1");
    expect(chunks).toEqual([]);
  });
});
