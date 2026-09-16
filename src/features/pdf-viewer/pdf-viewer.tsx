"use client";

import React, { useState, useEffect } from "react";
import { Document as DocumentType, MockPdfPage } from "@/types";
import { mockPdfDocumentPages } from "@/lib/mock-data";
import { PdfPageCanvas } from "./components/pdf-page-canvas";
import { useDocumentStore } from "@/stores/document-store";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Maximize2,
  Expand,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PdfViewerProps {
  documents?: DocumentType[];
  activeDocumentId?: string | null;
  onClose?: () => void;
}

export function PdfViewer({
  documents: propDocuments,
  activeDocumentId: propActiveDocId,
  onClose,
}: PdfViewerProps) {
  const storeDocuments = useDocumentStore((state) => state.documents);
  const documents = propDocuments || storeDocuments;
  const activeDocId = propActiveDocId || "";
  const currentDoc =
    (activeDocId ? documents.find((d) => d.id === activeDocId) : undefined) || documents[0];

  const [activeTab, setActiveTab] = useState<"document" | "citations" | "notes">("document");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(currentDoc?.pageCount || 24);
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    if (currentDoc) {
      setTotalPages(currentDoc.pageCount || 24);
      setCurrentPage(1);
    }
  }, [currentDoc?.id]);

  const docPages = currentDoc ? mockPdfDocumentPages[currentDoc.id] : undefined;
  const foundPage = docPages?.find((p) => p.pageNumber === currentPage);

  const activePageData: MockPdfPage = foundPage || {
    pageNumber: currentPage,
    title: `Section Analysis — Page ${currentPage}`,
    paragraphs: [
      "System design is the process of designing any software application to meet specific business requirements. It involves making architectural decisions, defining components, their interactions, and addressing key non-functional requirements such as scalability, reliability, and maintainability.",
    ],
    hasHighlight: false,
    highlightSnippet: undefined,
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 80));
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#0a0c14] border-l border-white/[0.06] select-none">
      {/* ─── TOP TAB BAR matching Image 2 ────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-[#08090d]">
        <div className="flex items-center gap-1.5">
          {/* Tab: Document */}
          <button
            type="button"
            onClick={() => setActiveTab("document")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              activeTab === "document"
                ? "bg-[#141624] text-white border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            Document
          </button>

          {/* Tab: Citations [3] */}
          <button
            type="button"
            onClick={() => setActiveTab("citations")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              activeTab === "citations"
                ? "bg-[#141624] text-white border border-indigo-500/30"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <span>Citations</span>
            <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-mono text-indigo-300">
              3
            </span>
          </button>

          {/* Tab: Notes */}
          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              activeTab === "notes"
                ? "bg-[#141624] text-white border border-indigo-500/30"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            Notes
          </button>
        </div>

        {/* Maximize Button */}
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title="Fullscreen viewer"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ─── PDF TOOLBAR matching Image 2 ────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.04] bg-[#090b12] text-xs text-zinc-400">
        {/* Page Selector ^ 1 / 24 v */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-white/5 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>

          <span className="text-zinc-200 font-semibold">
            {currentPage} <span className="text-zinc-500">/</span> {totalPages}
          </span>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="p-1 rounded hover:bg-white/5 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Zoom Controls: - 100% + */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 rounded hover:bg-white/5 hover:text-white cursor-pointer"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          <span className="text-zinc-300 font-medium min-w-[36px] text-center">
            {zoomLevel}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 rounded hover:bg-white/5 hover:text-white cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setZoomLevel(100)}
            className="p-1 rounded hover:bg-white/5 hover:text-white ml-1 cursor-pointer"
            title="Reset Zoom"
          >
            <Expand className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* ─── DOCUMENT CANVAS ─────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {activeTab === "document" && (
          <PdfPageCanvas
            documentName={currentDoc?.originalName}
            currentPage={currentPage}
            activePageData={activePageData}
            zoomLevel={zoomLevel}
          />
        )}

        {activeTab === "citations" && (
          <div className="flex-1 p-6 overflow-y-auto space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Document Citations
            </h4>
            {[
              { page: 6, text: "A well-designed system should gracefully handle increased load by scaling out, not just scaling up." },
              { page: 12, text: "Database comparison matrix detailing transactional consistency and horizontal scalability." },
              { page: 18, text: "Event-driven architecture using Kafka message brokers decouples operational throughput." },
            ].map((c) => (
              <div
                key={c.page}
                onClick={() => {
                  setCurrentPage(c.page);
                  setActiveTab("document");
                }}
                className="rounded-xl border border-white/8 bg-[#0f111a] p-3 hover:border-indigo-500/40 cursor-pointer transition-colors space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-indigo-400 font-semibold">Page {c.page}</span>
                  <span className="text-[10px] text-zinc-500">Jump to page ↗</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed italic">{c.text}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="flex-1 p-6 overflow-y-auto">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              Personal Notes
            </h4>
            <textarea
              placeholder="Take notes while reviewing this document..."
              className="w-full h-48 rounded-xl border border-white/10 bg-[#0f111a] p-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/40 resize-none"
            />
          </div>
        )}

        {/* ─── BOTTOM HORIZONTAL THUMBNAIL CAROUSEL matching Image 2 ── */}
        <div className="shrink-0 border-t border-white/[0.06] bg-[#08090d] px-3 py-2.5 flex items-center justify-center gap-2 select-none">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2.5">
            {[1, 2, 3, 4].map((pNum) => (
              <div
                key={pNum}
                onClick={() => setCurrentPage(pNum)}
                className="flex flex-col items-center gap-1 cursor-pointer group"
              >
                {/* Mini page card */}
                <div
                  className={cn(
                    "w-12 h-16 rounded-md bg-white border flex flex-col p-1 justify-between transition-all duration-150 overflow-hidden shadow-xs",
                    currentPage === pNum
                      ? "ring-2 ring-indigo-500 border-indigo-400 scale-105 shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                      : "border-zinc-300 opacity-70 group-hover:opacity-100"
                  )}
                >
                  <div className="w-full h-1 bg-zinc-800 rounded-xs" />
                  <div className="space-y-0.5">
                    <div className="w-full h-0.5 bg-zinc-400 rounded-xs" />
                    <div className="w-4/5 h-0.5 bg-zinc-400 rounded-xs" />
                    <div className="w-3/5 h-0.5 bg-zinc-400 rounded-xs" />
                  </div>
                  <div className="w-full flex justify-end">
                    <span className="text-[6px] text-zinc-600 font-mono">{pNum}</span>
                  </div>
                </div>

                <span
                  className={cn(
                    "text-[10px] font-mono",
                    currentPage === pNum ? "text-indigo-400 font-bold" : "text-zinc-500"
                  )}
                >
                  {pNum}
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
