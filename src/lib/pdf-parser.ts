import { getDocumentProxy, extractText } from "unpdf";

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

/**
 * Extract text from a PDF buffer page-by-page using unpdf.
 * Returns an array of pages with their text content and page numbers.
 *
 * Throws a user-safe error if no usable text is found (image-only PDFs).
 */
export async function extractTextFromPdf(
  pdfBuffer: Buffer
): Promise<ExtractedPage[]> {
  const uint8 = new Uint8Array(pdfBuffer);
  const doc = await getDocumentProxy(uint8);
  const totalPages = doc.numPages;

  if (totalPages === 0) {
    throw new Error(
      "This PDF contains no pages. Please upload a valid PDF document."
    );
  }

  const { text: fullText, totalPages: extractedPages } = await extractText(uint8, {
    mergePages: false,
  });

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
