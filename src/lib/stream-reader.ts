import { realtime } from "@/lib/realtime";

const HEARTBEAT_INTERVAL_MS = 15_000;

/**
 * Creates a resumable ReadableStream connected to an Upstash Realtime channel.
 * Replays buffered tokens via channel.history() and yields live deltas,
 * ensuring zero dropped tokens on reconnects or network interruptions.
 *
 * Supports both SSE (`text/event-stream`) and raw text (`text/plain`) formats.
 */
export function createRealtimeStream(
  channelId: string,
  isSSE: boolean,
): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      let isClosed = false;
      const encoder = new TextEncoder();

      const safeClose = () => {
        if (isClosed) return;
        isClosed = true;
        try {
          controller.close();
        } catch {
          // Controller may already be closed
        }
      };

      const safeEnqueue = (data: Uint8Array | string) => {
        if (isClosed) return;
        try {
          controller.enqueue(data);
        } catch {
          // Controller may already be closed
        }
      };

      const safeError = (err: unknown) => {
        if (isClosed) return;
        isClosed = true;
        try {
          controller.error(err);
        } catch {
          // Controller may already be closed
        }
      };

      // Send a keep-alive every 15s to prevent undici body timeout
      // during the idle gap between stream open and first AI token
      const heartbeat = setInterval(() => {
        if (isClosed) {
          clearInterval(heartbeat);
          return;
        }
        safeEnqueue(isSSE ? ": keepalive\n\n" : encoder.encode(" "));
      }, HEARTBEAT_INTERVAL_MS);

      try {
        const channel = realtime.channel(channelId);

        await channel.history().on("ai.chunk", (chunk: any) => {
          if (isSSE) {
            safeEnqueue(`data: ${JSON.stringify(chunk)}\n\n`);
            if (chunk.type === "finish" || chunk.type === "error") {
              clearInterval(heartbeat);
              safeClose();
            }
            return;
          }

          switch (chunk.type) {
            case "typing":
              safeEnqueue(encoder.encode("\0"));
              break;
            case "text-delta":
              if (typeof chunk.text === "string") {
                safeEnqueue(encoder.encode(chunk.text));
              }
              break;
            case "finish":
              clearInterval(heartbeat);
              safeClose();
              break;
            case "error":
              clearInterval(heartbeat);
              safeError(new Error(chunk.error || "Stream failed"));
              break;
          }
        });
      } catch (err) {
        clearInterval(heartbeat);
        safeError(err);
      }
    },
  });
}

/**
 * Builds the appropriate Response headers for the realtime stream.
 */
export function getStreamHeaders(isSSE: boolean): Record<string, string> {
  return {
    "Content-Type": isSSE ? "text/event-stream" : "text/plain; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };
}
