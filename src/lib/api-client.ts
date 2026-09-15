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

// Request Interceptor: Auto-attach stream capability token from store
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const convId = extractConversationId(config.url);
    if (convId && getTokenFn && !config.headers["x-conversation-token"]) {
      const token = getTokenFn(convId);
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
        const refreshRes = await axios.get<{ streamToken?: string }>(`/api/conversations/${convId}`, {
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
