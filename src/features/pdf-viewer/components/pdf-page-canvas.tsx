"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MockPdfPage } from "@/types";

export interface PdfPageCanvasProps {
  documentName?: string;
  currentPage: number;
  activePageData: MockPdfPage;
  zoomLevel: number;
}

export function PdfPageCanvas({
  documentName,
  currentPage,
  activePageData,
  zoomLevel,
}: PdfPageCanvasProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-[#f0f0f4] dark:bg-[#08080a]">
      <div
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: "top center",
        }}
        className="w-full max-w-2xl min-h-[860px] rounded-md border border-zinc-200/90 bg-white p-8 sm:p-14 shadow-[0_4px_24px_rgba(0,0,0,0.06)] text-zinc-800 transition-transform duration-150 flex flex-col justify-between relative dark:border-white/10 dark:bg-[#121215] dark:shadow-[0_4px_30px_rgba(0,0,0,0.6)] dark:text-zinc-200"
      >
        {/* Top Running Header */}
        <div>
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 text-xs text-zinc-400 uppercase tracking-wider font-semibold dark:border-white/5 dark:text-zinc-500">
            <span>{documentName}</span>
            <span>Section 04 • Official Filing</span>
          </div>

          {/* Page Content with Editorial Typography */}
          <div className="mt-7 space-y-5">
            <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {activePageData?.title || `Page ${currentPage}`}
            </h3>

            {activePageData?.paragraphs.map((p: string, idx: number) => (
              <p
                key={idx}
                className="text-[13.5px] leading-relaxed text-zinc-700 font-serif dark:text-zinc-300"
              >
                {p}
              </p>
            ))}

            {/* Table Data if Present on this page */}
            {activePageData?.tableData && (
              <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50/60 dark:border-white/10 dark:bg-[#16161b]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200 dark:bg-[#1a1a20] dark:text-zinc-300 dark:border-white/10">
                    <tr>
                      {activePageData.tableData.headers.map(
                        (h: string, i: number) => (
                          <th key={i} className="px-3 py-2.5">
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60 font-mono text-zinc-700 dark:divide-white/5 dark:text-zinc-300">
                    {activePageData.tableData.rows.map(
                      (row: string[], rIdx: number) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-zinc-100/70 dark:hover:bg-white/5"
                        >
                          {row.map((cell: string, cIdx: number) => (
                            <td
                              key={cIdx}
                              className={cn(
                                "px-3 py-2",
                                isNaN(Number(cell.replace(/[^0-9.-]/g, "")))
                                  ? "text-left font-sans"
                                  : "text-right"
                              )}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Document Running Footer */}
        <div className="mt-14 border-t border-zinc-100 pt-3 flex items-center justify-between text-[11px] text-zinc-400 dark:border-white/5 dark:text-zinc-500 font-mono">
          <span>DOCSY DOCUMENT READER</span>
          <span>PAGE {currentPage}</span>
        </div>
      </div>
    </div>
  );
}
