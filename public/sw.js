/**
 * Docsy AI — Progressive Web App Service Worker
 * Manages offline caching, asset pre-fetching, Next.js RSC caching, and route-isolated fallbacks.
 */

const CACHE_NAME = "docsy-cache-v2";

// Core static assets and key application route shells
const STATIC_PRECACHE = [
  "/",
  "/conversations",
  "/conversation",
  "/documents",
  "/favicon.ico",
  "/favicon.svg",
  "/favicon-32x32.png",
  "/favicon-16x16.png",
  "/logo.svg",
];

// Branded offline HTML fallback shown only when an uncached route is visited offline
const OFFLINE_FALLBACK_HTML = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Offline — Docsy AI</title>
  <style>
    body {
      background-color: #08080a;
      color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px;
      box-sizing: border-box;
      text-align: center;
    }
    .card {
      background: #0f121a;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 32px 24px;
      max-width: 440px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);
    }
    .icon {
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #818cf8;
    }
    h1 {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }
    p {
      font-size: 13px;
      color: #818ea8;
      line-height: 1.5;
      margin: 0 0 24px 0;
    }
    .button-group {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    button, a {
      background: #6366f1;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      transition: background 0.15s ease;
    }
    button:hover, a:hover {
      background: #4f46e5;
    }
    .secondary-btn {
      background: rgba(255, 255, 255, 0.06);
      color: #e4e4e7;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .secondary-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  </style>
</head>
<body>
  <div class="card">
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="1" y1="1" x2="23" y2="23"></line>
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
      <line x1="12" y1="20" x2="12.01" y2="20"></line>
    </svg>
    <h1>You are currently offline</h1>
    <p>This page has not been cached yet for offline use. You can access your cached conversations and documents from your library.</p>
    <div class="button-group">
      <a href="/conversations" class="secondary-btn">Conversations</a>
      <button onclick="window.location.reload()">Retry Connection</button>
    </div>
  </div>
</body>
</html>`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Safely precache items individually so one network or auth hiccup never aborts SW installation
      await Promise.allSettled(
        STATIC_PRECACHE.map(async (url) => {
          try {
            const response = await fetch(url, { credentials: "same-origin" });
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch (err) {
            console.warn("[SW] Precache item skipped:", url, err);
          }
        })
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Listen for client requests to pre-warm application routes
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "PRECACHE_ROUTES" && Array.isArray(event.data.routes)) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(async (cache) => {
        for (const route of event.data.routes) {
          try {
            const res = await fetch(route, { credentials: "same-origin" });
            if (res.ok) {
              await cache.put(route, res.clone());
              const parsedUrl = new URL(res.url);
              if (parsedUrl.pathname !== route) {
                await cache.put(parsedUrl.pathname, res);
              }
            }
          } catch {
            // Ignore offline fetch errors
          }
        }
      })
    );
  }
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip non-http/https protocols
  if (!url.protocol.startsWith("http")) return;

  // Never cache AI chat streams, message mutation endpoints, or upload endpoints
  if (
    url.pathname.startsWith("/api/chat") ||
    url.pathname.includes("/messages") ||
    url.pathname.startsWith("/api/upload")
  ) {
    return;
  }

  // 1. Static Assets & Next.js compiled chunks: Cache-First strategy
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".ttf") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => new Response("", { status: 404 }));
      })
    );
    return;
  }

  // 2. Next.js App Router RSC (React Server Component) Flight Requests:
  // Identified by `_rsc` query parameter or `rsc: 1` / Next.js router headers
  const isRscRequest =
    url.searchParams.has("_rsc") ||
    request.headers.get("rsc") === "1" ||
    request.headers.has("next-router-state-tree");

  if (isRscRequest) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
              // Also store normalized key so requests with different _rsc hash can match
              cache.put(url.pathname + "?_rsc=1", networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Attempt exact match first
          let cached = await caches.match(request);
          if (cached) return cached;

          // Attempt match ignoring search query
          cached = await caches.match(request, { ignoreSearch: true });
          if (cached) return cached;

          // Attempt normalized RSC key
          cached = await caches.match(url.pathname + "?_rsc=1");
          if (cached) return cached;

          // Return 503 so Next.js router degrades to document navigation (which serves the cached HTML shell)
          return new Response("RSC Offline Fallback", {
            status: 503,
            statusText: "Service Unavailable",
          });
        })
    );
    return;
  }

  // 3. Navigation / Full HTML document requests: Network-First with isolated Cache Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
              // Also cache under pathname so queries like ?doc=123 don't miss future matches
              if (url.search) {
                cache.put(url.pathname, networkResponse.clone());
              }
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // 1. Attempt exact URL match from cache
          let cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          // 2. Attempt match ignoring query search params (e.g. /conversation?doc=... matches /conversation)
          cachedPage = await caches.match(request, { ignoreSearch: true });
          if (cachedPage) return cachedPage;

          // 3. Attempt match by exact pathname
          cachedPage = await caches.match(url.pathname);
          if (cachedPage) return cachedPage;

          // 4. Route-specific shell matching: strictly isolated to avoid route bleeding
          if (url.pathname.startsWith("/conversation")) {
            const convShell = await caches.match("/conversation");
            if (convShell) return convShell;
          }

          if (url.pathname.startsWith("/conversations")) {
            const convsShell = await caches.match("/conversations");
            if (convsShell) return convsShell;
          }

          if (url.pathname.startsWith("/documents")) {
            const docsShell = await caches.match("/documents");
            if (docsShell) return docsShell;
          }

          if (url.pathname === "/") {
            const homeShell = await caches.match("/");
            if (homeShell) return homeShell;
          }

          // 5. Fallback offline HTML response for truly uncached routes
          // (CRITICAL: NEVER return cached "/" for other routes to prevent rendering homepage on wrong URL)
          return new Response(OFFLINE_FALLBACK_HTML, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        })
    );
    return;
  }

  // 4. Data API endpoints (e.g. /api/documents, /api/conversations):
  // Stale-While-Revalidate to keep read queries instant
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});
