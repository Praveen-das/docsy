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
  let cleanup = () => {};

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

      cleanup = () => {
        clearInterval(heartbeat);
        safeClose();
      };

      try {
        const channel = realtime.channel(channelId);

        await channel.history().on("ai.chunk", (chunk: any) => {
          if (isSSE) {
            if (chunk.type === "typing") {
              return;
            }
            if (chunk.type === "error") {
              const errorPayload = {
                type: "error",
                errorText: chunk.errorText || chunk.error || "Stream failed",
              };
              safeEnqueue(`data: ${JSON.stringify(errorPayload)}\n\n`);
              clearInterval(heartbeat);
              safeClose();
              return;
            }
            safeEnqueue(`data: ${JSON.stringify(chunk)}\n\n`);
            if (chunk.type === "finish") {
              clearInterval(heartbeat);
              safeClose();
            }
            return;
          }

          switch (chunk.type) {
            case "typing":
              safeEnqueue(encoder.encode("\0"));
              break;
            case "text-delta": {
              const text = chunk.delta ?? chunk.text;
              if (typeof text === "string") {
                safeEnqueue(encoder.encode(text));
              }
              break;
            }
            case "finish":
              clearInterval(heartbeat);
              safeClose();
              break;
            case "error":
              clearInterval(heartbeat);
              safeError(new Error(chunk.error || chunk.errorText || "Stream failed"));
              break;
          }
        });
      } catch (err) {
        clearInterval(heartbeat);
        safeError(err);
      }
    },
    cancel() {
      cleanup();
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
