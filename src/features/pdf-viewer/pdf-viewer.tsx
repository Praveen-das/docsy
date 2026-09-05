"use client";

import React, { useState, useEffect } from "react";
import { Document as DocumentType, Citation, MockPdfPage } from "@/types";
import { mockPdfDocumentPages } from "@/lib/mock-data";
import { PdfToolbar } from "./components/pdf-toolbar";
import { PdfThumbnails } from "./components/pdf-thumbnails";
import { PdfPageCanvas } from "./components/pdf-page-canvas";
import { useConversationStore } from "@/stores/conversation-store";
import { useDocumentStore } from "@/stores/document-store";

export interface PdfViewerProps {
  documents?: DocumentType[];
  activeDocumentId?: string;
  targetCitation?: Citation | null;
}

export function PdfViewer({
  documents: propDocuments,
  activeDocumentId: propActiveDocId,
  targetCitation,
}: PdfViewerProps) {
  const storeDocuments = useDocumentStore((state) => state.documents);
  const documents = propDocuments || storeDocuments;
  const storeActiveDocId = useConversationStore(
    (state) => state.activeDocumentId
  );
  const activeDocId = propActiveDocId || storeActiveDocId || "";
  const currentDoc =
    documents.find((d) => d.id === activeDocId) || documents[0];
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(currentDoc?.pageCount || 24);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [searchInDoc, setSearchInDoc] = useState<string>("");
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [highlightPulse, setHighlightPulse] = useState(false);

  // Sync total pages when active document changes
  useEffect(() => {
    if (currentDoc) {
      setTotalPages(currentDoc.pageCount);
      setCurrentPage(1);
    }
  }, [currentDoc?.id]);

  // Navigate & pulse when citation is selected
  useEffect(() => {
    if (targetCitation) {
      setCurrentPage(targetCitation.page);
      setHighlightPulse(true);
      const timer = setTimeout(() => setHighlightPulse(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [targetCitation]);

  const docPages = currentDoc ? mockPdfDocumentPages[currentDoc.id] : undefined;
  const foundPage = docPages?.find((p) => p.pageNumber === currentPage);

  const activePageData: MockPdfPage = foundPage || {
    pageNumber: currentPage,
    title: `Executive Operational Summary — Page ${currentPage}`,
    paragraphs: [
      "Financial results for the trailing twelve-month period reflect sustained efficiency across core operational units. Supply chain diversification and localized sourcing initiatives reduced per-unit transport latency by 14.2%, contributing to margin defense amid broader macroeconomic fluctuation.",
      "Capital expenditures throughout the reporting cycle remained calibrated toward automation software, high-throughput manufacturing hardware, and multi-region compute infrastructure. Working capital positions remain robust, providing operational flexibility into upcoming production ramp schedules.",
      "Risk mitigation measures detailed under Item 1A have progressed according to schedule, with regulatory compliance frameworks audited and certified by independent third-party advisors across all primary jurisdictions.",
    ],
    hasHighlight: targetCitation?.page === currentPage,
    highlightSnippet:
      targetCitation?.textSnippet ||
      "Supply chain diversification and localized sourcing initiatives reduced per-unit transport latency by 14.2%.",
    tableData: undefined as { headers: string[]; rows: string[][] } | undefined,
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 15, 160));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 15, 80));
  };

  const isTargetCitationOnPage = Boolean(
    targetCitation && targetCitation.page === currentPage
  );

  return (
    <div className="flex h-full flex-col bg-[#f7f7f8] text-zinc-900 border-r border-zinc-200 dark:bg-[#08080a] dark:text-zinc-100 dark:border-white/5 transition-colors duration-150">
      {/* PDF Controls & Search Toolbar */}
      <PdfToolbar
        currentPage={currentPage}
        totalPages={totalPages}
        showThumbnails={showThumbnails}
        zoomLevel={zoomLevel}
        searchInDoc={searchInDoc}
        isTargetCitationOnPage={isTargetCitationOnPage}
        onToggleThumbnails={() => setShowThumbnails(!showThumbnails)}
        onPageChange={setCurrentPage}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        onSearchChange={setSearchInDoc}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={() => setZoomLevel(100)}
      />

      {/* Document Workspace Area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Thumbnails Navigation Strip */}
        {showThumbnails && (
          <PdfThumbnails
            totalPages={totalPages}
            currentPage={currentPage}
            onSelectPage={setCurrentPage}
          />
        )}

        {/* Document Canvas */}
        <PdfPageCanvas
          documentName={currentDoc?.originalName}
          currentPage={currentPage}
          activePageData={activePageData}
          zoomLevel={zoomLevel}
          highlightPulse={highlightPulse}
        />
      </div>
    </div>
  );
}
