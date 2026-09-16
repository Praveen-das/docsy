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
  documentName = "System Design Notes.pdf",
  currentPage,
  activePageData,
  zoomLevel,
}: PdfPageCanvasProps) {
  const isPageOne = currentPage === 1;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-[#090a10]">
      <div
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: "top center",
        }}
        className="w-full max-w-lg min-h-[580px] rounded-lg bg-white p-8 shadow-2xl text-zinc-900 transition-transform duration-150 flex flex-col justify-between select-text"
      >
        {isPageOne ? (
          /* Exact page 1 content matching Image 2 */
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-sans">
                System Design
              </h1>
              <p className="text-xs text-zinc-600 font-medium mt-1">
                Principles, Patterns and Best Practices
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                1. Introduction
              </h2>
              <p className="text-[12px] text-zinc-700 leading-relaxed">
                System design is the process of designing any software application to
                meet specific business requirements. It involves making architectural
                decisions, defining components, their interactions, and addressing key
                non-functional requirements such as scalability, reliability, and
                maintainability.
              </p>
            </div>

            <div className="space-y-2.5">
              <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                2. Core Principles
              </h2>
              <ul className="space-y-1.5 text-[11.5px] text-zinc-800">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold">• Scalability</span>
                  <span className="text-zinc-600">– Handle increased load gracefully</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold">• Reliability</span>
                  <span className="text-zinc-600">– Ensure system availability and fault tolerance</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold">• Maintainability</span>
                  <span className="text-zinc-600">– Keep the system modular and easy to evolve</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold">• Security</span>
                  <span className="text-zinc-600">– Protect data and ensure proper access control</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold">• Cost Efficiency</span>
                  <span className="text-zinc-600">– Optimize for performance and cost</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          /* General page content */
          <div className="space-y-5">
            <div className="border-b border-zinc-200 pb-2 flex items-center justify-between text-[11px] text-zinc-500 font-sans">
              <span>{documentName}</span>
              <span>PAGE {currentPage}</span>
            </div>

            <h3 className="text-base font-bold text-zinc-900">
              {activePageData?.title || `Section Analysis — Page ${currentPage}`}
            </h3>

            {activePageData?.paragraphs?.map((p: string, idx: number) => (
              <p key={idx} className="text-[12px] text-zinc-700 leading-relaxed font-sans">
                {p}
              </p>
            ))}

            {activePageData?.tableData && (
              <div className="overflow-x-auto rounded border border-zinc-200 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-zinc-100 text-zinc-800 font-semibold border-b">
                    <tr>
                      {activePageData.tableData.headers.map((h, i) => (
                        <th key={i} className="px-2.5 py-1.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-zinc-700">
                    {activePageData.tableData.rows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-2.5 py-1">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Bottom Page Number */}
        <div className="pt-6 flex justify-end text-[11px] font-mono text-zinc-400">
          <span>{currentPage}</span>
        </div>
      </div>
    </div>
  );
}
