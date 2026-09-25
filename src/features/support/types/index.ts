export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "all" | "billing" | "processing" | "ai" | "security" | "limits";
  helpfulCount: number;
  unhelpfulCount: number;
  tags: string[];
}

export const FAQ_DATA: FAQItem[] = [
  {
    id: "faq-1",
    category: "limits",
    question: "What are the file size and page count limits on Docsy?",
    answer:
      "Free plan accounts can upload documents up to 50 MB (approx. 50 pages per document, up to 5 documents total). Pro accounts enjoy up to 2 GB total storage, individual files up to 200 MB, and unlimited document uploads with rapid multi-worker processing.",
    helpfulCount: 42,
    unhelpfulCount: 1,
    tags: ["limits", "storage", "pdf", "file size"],
  },
  {
    id: "faq-2",
    category: "ai",
    question: "How does Docsy ground its answers and prevent hallucinations?",
    answer:
      "Docsy utilizes a hybrid Retrieval-Augmented Generation (RAG) architecture. When you ask a question, our high-dimensional embeddings search your document vectors in Pinecone. The most relevant snippets are synthesized with Gemini 2.5 Flash and Groq models with strict source citation badges. Every answer includes verifiable page numbers and text excerpts.",
    helpfulCount: 88,
    unhelpfulCount: 2,
    tags: ["accuracy", "rag", "hallucination", "citations"],
  },
  {
    id: "faq-3",
    category: "security",
    question: "Is my proprietary data used to train public AI models?",
    answer:
      "No, never. Your documents, extracted text chunks, embeddings, and chat conversations are completely private. We maintain strict tenant isolation with row-level policies. Data sent to our LLM inference providers is processed under zero-data-retention enterprise agreements.",
    helpfulCount: 134,
    unhelpfulCount: 0,
    tags: ["privacy", "security", "training", "gdpr", "hipaa"],
  },
  {
    id: "faq-4",
    category: "processing",
    question: "Does Docsy support scanned PDFs and handwritten notes?",
    answer:
      "Yes! Our ingestion pipeline incorporates unpdf with multi-layer OCR fallback. Text inside embedded images, diagrams, and low-contrast scanned scans is converted to searchable markdown text before chunking.",
    helpfulCount: 56,
    unhelpfulCount: 3,
    tags: ["ocr", "scanned", "handwritten", "parsing"],
  },
  {
    id: "faq-5",
    category: "billing",
    question: "How do monthly subscriptions and query quotas work?",
    answer:
      "Free accounts receive 25 daily queries that reset every 24 hours. Pro members receive 200 daily high-speed queries, priority vector indexing, and customer support. You can upgrade, cancel, or modify your plan directly from the /billing page at any time without long-term commitments.",
    helpfulCount: 71,
    unhelpfulCount: 1,
    tags: ["billing", "stripe", "quota", "queries", "pro"],
  },
  {
    id: "faq-6",
    category: "processing",
    question: "Can I chat with multiple documents simultaneously?",
    answer:
      "Yes. In any conversation, you can link multiple documents from your workspace. Docsy will perform cross-document vector retrieval to correlate findings, compare clauses, and generate cross-referenced answers across all selected PDFs.",
    helpfulCount: 95,
    unhelpfulCount: 4,
    tags: ["multi-doc", "cross-reference", "chat", "compare"],
  },
];
