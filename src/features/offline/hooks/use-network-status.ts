"use client";

import { useState, useEffect } from "react";

export interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      return navigator.onLine;
    }
    return true;
  });

  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: NodeJS.Timeout | null = null;

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWasOffline(false);
      }, 3500);
    };

    const handleOffline = () => {
      if (timeoutId) clearTimeout(timeoutId);
      setIsOnline(false);
      setWasOffline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
  };
}
