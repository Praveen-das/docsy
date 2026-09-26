"use client";

import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { OfflineBanner } from "@/features/offline/components/offline-banner";
import { backgroundSyncService } from "@/features/offline/services/background-sync.service";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import { useConversations } from "@/features/conversations/hooks/use-conversations";

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { data: documents = [] } = useDocuments();
  const { conversations = [] } = useConversations();

  // 1. Register Service Worker on client mount
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const warmRoutes = () => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "PRECACHE_ROUTES",
          routes: ["/", "/conversations", "/conversation", "/documents"],
        });
      }
    };

    const handleLoad = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // Immediately check for SW updates so v2 activates
          reg.update().catch(() => {});
          warmRoutes();

          // Listen for updates and skip waiting for immediate activation
          reg.addEventListener("updatefound", () => {
            const installing = reg.installing;
            if (installing) {
              installing.addEventListener("statechange", () => {
                if (installing.state === "installed" && navigator.serviceWorker.controller) {
                  installing.postMessage({ type: "SKIP_WAITING" });
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn("[SW] Service worker registration warning:", err);
        });
    };

    const handleControllerChange = () => {
      warmRoutes();
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    return () => {
      window.removeEventListener("load", handleLoad);
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  // 2. Schedule proactive background sync when online and idle
  useEffect(() => {
    if (!user) return;

    backgroundSyncService.scheduleSync({
      user,
      documents,
      conversations,
    });
  }, [user, documents, conversations]);

  return (
    <>
      <OfflineBanner />
      {children}
    </>
  );
}
