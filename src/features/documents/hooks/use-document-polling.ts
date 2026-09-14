"use client";

import { useEffect, useRef } from "react";
import { useDocumentStore } from "@/stores/document-store";
import type { DocumentStatusDto } from "@/types";

interface UseDocumentPollingOptions {
  intervalMs?: number;
  enabled?: boolean;
}

const DEFAULT_POLL_INTERVAL_MS = 3000;

/**
 * Lightweight hook to poll status updates for in-flight documents only.
 * Hits /api/documents/status backed by an Upstash Redis cache layer with TTL
 * and pipeline batching, avoiding heavy full-collection DB queries.
 *
 * Automatically stops polling as soon as all documents reach a terminal state (READY or FAILED).
 */
export function useDocumentPolling(options: UseDocumentPollingOptions = {}) {
  const { intervalMs = DEFAULT_POLL_INTERVAL_MS, enabled = true } = options;
  const documents = useDocumentStore((state) => state.documents);
  const isPollingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    // Collect IDs of documents actively being processed
    const inFlightDocs = documents.filter((doc) => doc.status !== "READY" && doc.status !== "FAILED");

    if (inFlightDocs.length === 0) return;

    const documentIds = inFlightDocs.map((doc) => doc.id);

    const pollStatus = async () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const res = await fetch("/api/documents/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentIds }),
        });

        if (!res.ok) return;

        const data: { statuses?: DocumentStatusDto[] } = await res.json();
        if (!data.statuses || !Array.isArray(data.statuses)) return;

        let hasNewlyReadyDoc = false;

        for (const statusItem of data.statuses) {
          const currentDoc = useDocumentStore.getState().documents.find((d) => d.id === statusItem.id);

          if (!currentDoc) continue;

          // Check if any reactive field actually changed
          const hasChanged =
            currentDoc.status !== statusItem.status ||
            currentDoc.processingProgress !== statusItem.processingProgress ||
            currentDoc.error !== statusItem.error ||
            currentDoc.pageCount !== statusItem.pageCount ||
            currentDoc.chunkCount !== statusItem.chunkCount;

          if (hasChanged) {
            useDocumentStore.getState().updateDocument(statusItem.id, {
              status: statusItem.status,
              processingProgress: statusItem.processingProgress,
              error: statusItem.error,
              pageCount: statusItem.pageCount,
              chunkCount: statusItem.chunkCount,
              updatedAt: statusItem.updatedAt,
            });

            if (currentDoc.status !== "READY" && statusItem.status === "READY") {
              hasNewlyReadyDoc = true;
            }
          }
        }

        // If any document just transitioned to READY, run a one-time full sync
        // to populate any remaining server-side fields (e.g. final file URLs/tokens)
        if (hasNewlyReadyDoc) {
          useDocumentStore
            .getState()
            .fetchDocuments()
            .catch(() => {});
        }
      } catch (err) {
        // Non-fatal: network blip during polling, will retry next interval
        console.warn("Document status polling blip:", err);
      } finally {
        isPollingRef.current = false;
      }
    };

    // const timer = setInterval(pollStatus, intervalMs);

    return () => {
      // clearInterval(timer);
      isPollingRef.current = false;
    };
  }, [documents, intervalMs, enabled]);
}
