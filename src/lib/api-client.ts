import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

type TokenProvider = (convId: string) => string | undefined;
type TokenUpdater = (convId: string, token: string) => void;

let getTokenFn: TokenProvider | null = null;
let setTokenFn: TokenUpdater | null = null;

/**
 * Registers token provider and updater callbacks to decouple Axios interceptors
 * from Zustand store implementation details.
 */
export function registerTokenHandlers(handlers: { getToken: TokenProvider; setToken: TokenUpdater }) {
  getTokenFn = handlers.getToken;
  setTokenFn = handlers.setToken;
}

/**
 * Extracts conversation ID from paths matching /api/conversations/:id
 */
function extractConversationId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/\/api\/conversations\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Shared Axios client configured for Next.js App Router:
 * - Uses native 'fetch' adapter for full browser streaming compatibility (ReadableStream)
 * - Request interceptor automatically attaches conversation session tokens
 * - Response interceptor automatically catches 401 Unauthorized, mints a fresh token,
 *   updates the store, and seamlessly retries the request
 */
export const api = axios.create({
  adapter: "fetch",
  headers: {
    "Content-Type": "application/json",
  },
});

const inFlightTokenFetches = new Map<string, Promise<string | null>>();

function isConversationSubResource(url?: string): boolean {
  if (!url) return false;
  return /\/api\/conversations\/[a-zA-Z0-9_-]+\/.+/.test(url);
}

/**
 * Resolves a conversation capability token:
 * 1. Synchronous store lookup (<0.01ms)
 * 2. On-demand JIT fetch only when conversation is accessed, deduplicating concurrent calls
 */
async function getOrFetchToken(convId: string): Promise<string | null> {
  const cached = getTokenFn ? getTokenFn(convId) : undefined;
  if (cached) return cached;

  let fetchPromise = inFlightTokenFetches.get(convId);
  if (!fetchPromise) {
    fetchPromise = (async () => {
      try {
        // fallow-ignore-next-line security-sink
        const res = await axios.get<{ streamToken?: string }>(`/api/conversations/${encodeURIComponent(convId)}`, {
          adapter: "fetch",
        });
        const freshToken = res.data?.streamToken || null;
        if (freshToken && setTokenFn) {
          setTokenFn(convId, freshToken);
        }
        return freshToken;
      } catch {
        return null;
      } finally {
        inFlightTokenFetches.delete(convId);
      }
    })();
    inFlightTokenFetches.set(convId, fetchPromise);
  }

  return fetchPromise;
}

// Request Interceptor: Auto-attach stream capability token (store lookup or JIT fetch)
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const convId = extractConversationId(config.url);
    if (convId && isConversationSubResource(config.url) && !config.headers["x-conversation-token"]) {
      const token = await getOrFetchToken(convId);
      if (token) {
        config.headers["x-conversation-token"] = token;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Auto-refresh expired capability token on 401 & retry
api.interceptors.response.use(
  (response) => {
    // If server returned a fresh capability token in headers, cache it in store
    const returnedToken = response.headers?.["x-conversation-token"];
    const convId = extractConversationId(response.config?.url);
    if (returnedToken && convId && setTokenFn) {
      setTokenFn(convId, returnedToken);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomRequestConfig | undefined;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const convId = extractConversationId(originalRequest.url);

    // If 401 on conversation endpoint and request hasn't been retried yet
    if (error.response?.status === 401 && convId && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Direct unintercepted fetch to retrieve fresh conversation capability token
        // fallow-ignore-next-line security-sink
        const refreshRes = await axios.get<{ streamToken?: string }>(`/api/conversations/${encodeURIComponent(convId)}`, {
          adapter: "fetch",
        });

        const freshToken = refreshRes.data?.streamToken;
        if (freshToken) {
          // 1. Update Zustand store with fresh token
          if (setTokenFn) {
            setTokenFn(convId, freshToken);
          }

          // 2. Attach fresh token to original request headers
          originalRequest.headers["x-conversation-token"] = freshToken;

          // 3. Update body payload if conversationToken was part of JSON payload
          if (typeof originalRequest.data === "string") {
            try {
              const body = JSON.parse(originalRequest.data);
              if ("conversationToken" in body) {
                body.conversationToken = freshToken;
                originalRequest.data = JSON.stringify(body);
              }
            } catch {
              // Ignore non-JSON string
            }
          } else if (
            typeof originalRequest.data === "object" &&
            originalRequest.data !== null &&
            "conversationToken" in originalRequest.data
          ) {
            (originalRequest.data as Record<string, unknown>).conversationToken = freshToken;
          }

          // 4. Transparently retry original request
          return api(originalRequest);
        }
      } catch (refreshErr) {
        console.error("Axios interceptor token refresh failed:", refreshErr);
      }
    }

    return Promise.reject(error);
  },
);
