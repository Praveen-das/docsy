import { extractText } from "unpdf";

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

/**
 * Extract text from a PDF buffer page-by-page using unpdf.
 * Returns an array of pages with their text content and page numbers.
 *
 * Uses a clean, unpooled ArrayBuffer slice to prevent DataCloneError
 * during worker postMessage transfers in Node.js runtimes.
 *
 * Throws a user-safe error if no usable text is found (image-only PDFs).
 */
export async function extractTextFromPdf(
  pdfBuffer: Buffer | ArrayBuffer | Uint8Array
): Promise<ExtractedPage[]> {
  // Ensure we pass a standalone, unpooled ArrayBuffer copy
  let uint8: Uint8Array;
  if (Buffer.isBuffer(pdfBuffer)) {
    const arrayBuffer = pdfBuffer.buffer.slice(
      pdfBuffer.byteOffset,
      pdfBuffer.byteOffset + pdfBuffer.byteLength
    );
    uint8 = new Uint8Array(arrayBuffer);
  } else if (pdfBuffer instanceof Uint8Array) {
    uint8 = new Uint8Array(pdfBuffer.slice());
  } else {
    uint8 = new Uint8Array(pdfBuffer.slice(0));
  }

  // extractText resolves the PDF, extracts all pages, and destroys the task in one call
  const { text: fullText, totalPages } = await extractText(uint8, {
    mergePages: false,
  });

  if (!totalPages || totalPages === 0) {
    throw new Error(
      "This PDF contains no pages. Please upload a valid PDF document."
    );
  }

  // `fullText` is string[] when mergePages=false — one string per page
  const pages: ExtractedPage[] = [];
  const pageTexts = Array.isArray(fullText) ? fullText : [fullText];

  for (let i = 0; i < pageTexts.length; i++) {
    const text = pageTexts[i]?.trim();
    if (text && text.length > 0) {
      pages.push({
        pageNumber: i + 1,
        text,
      });
    }
  }

  if (pages.length === 0) {
    throw new Error(
      "Unable to extract readable text from this PDF. It may be a scanned document or contain only images. Please upload a text-based (searchable) PDF."
    );
  }

  return pages;
}
