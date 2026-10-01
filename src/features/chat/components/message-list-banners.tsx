import React from "react";
import { Loader2 } from "lucide-react";

interface MessageListBannersProps {
  isLoadingOlderMessages?: boolean;
  isErrorOlderMessages?: boolean;
  onLoadOlderMessages?: () => void;
}

export function MessageListBanners({
  isLoadingOlderMessages,
  isErrorOlderMessages,
  onLoadOlderMessages,
}: MessageListBannersProps) {
  if (isLoadingOlderMessages) {
    return (
      <div className="pointer-events-none absolute top-3 left-0 right-0 z-20 flex justify-center">
        <div className="flex items-center gap-2 rounded-full border border-zinc-200/90 bg-white/90 px-3.5 py-1 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/90 dark:text-zinc-300">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400" />
          <span>Loading earlier messages...</span>
        </div>
      </div>
    );
  }

  if (isErrorOlderMessages) {
    return (
      <div className="absolute top-3 left-0 right-0 z-20 flex justify-center px-4">
        <div className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50/95 px-3.5 py-1 text-xs font-medium text-red-700 shadow-sm backdrop-blur-md dark:border-red-900/40 dark:bg-red-950/90 dark:text-red-300">
          <span>Failed to load earlier messages.</span>
          {onLoadOlderMessages && (
            <button
              type="button"
              onClick={onLoadOlderMessages}
              className="cursor-pointer font-semibold underline hover:no-underline ml-1"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
