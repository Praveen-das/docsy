# Architecture Design Specification: Offline Support & PWA for Docsy

**Date:** 2026-09-26  
**Status:** Approved  
**Topic:** Complete Offline Support, Service Worker PWA, IndexedDB Storage Engine & Proactive Background Sync  

---

## 1. Executive Summary

Docsy is an interactive AI document assistant built on Next.js 16 (App Router), React 19, TanStack React Query, and Zustand. While core generative AI responses require live cloud connectivity, users frequently need uninterrupted access to their library of documents, past chat transcripts, and citation references when encountering intermittent network drops or working offline.

This specification details the architecture for complete offline support:
- A progressive web app (PWA) manifest and lightweight native Service Worker for instant offline loading and desktop/mobile installability.
- A client-side typed IndexedDB storage engine (`docsy_offline_v1`) caching user documents, conversation lists, message histories, and an auth snapshot.
- A proactive, non-blocking background sync coordinator that pre-caches recent data when online and idle.
- Non-intrusive UI network indicators and graceful action guardrails (disabling live AI generation and uploads while keeping all chat transcripts read-only and searchable).

---

## 2. Goals & Non-Goals

### Goals
- **Full PWA Installability:** Enable standalone app installation on desktop and mobile browsers via standard Web App Manifest and Service Worker registration.
- **Offline App Shell:** Ensure visiting `/`, `/documents`, `/conversations`, and `/conversation` while disconnected renders the cached application shell rather than a browser dinosaur/error screen.
- **Cached Session Read-Only Access:** Cache the active Clerk user profile in IndexedDB so that disconnected users can browse their documents and read prior conversations without being kicked out to a broken authentication redirect.
- **Proactive Background Sync:** Automatically populate and refresh the IndexedDB cache with user documents and recent conversation turns when the device is online and idle.
- **Graceful UI Degradation:** Real-time online/offline indicator banner; clear, friendly tooltips on actions requiring internet (sending new LLM turns, uploading new files).

### Non-Goals
- **Local On-Device LLM / Vector Search:** Generating *new* AI replies or running vector embeddings offline is out of scope; new chat queries require server connectivity.
- **Binary PDF Viewer Caching:** Docsy does not utilize a binary PDF page viewer in this mode; PDF binary blob rendering and caching is omitted to minimize storage bloat and focus on conversation turns and citations.

---

## 3. System Architecture & Component Diagram

```
+---------------------------------------------------------------------------------+
|                                 Browser Client                                  |
|                                                                                 |
|  +--------------------+     +------------------------------------------------+  |
|  |   Next.js Pages    |     |                 UI Components                  |  |
|  | (App Shell Caching)|     |  [OfflineBanner]  [ChatComposer]  [UploadModal]|  |
|  +---------+----------+     +-----------------------+------------------------+  |
|            |                                        |                           |
|            |                                        | useNetworkStatus()        |
|            v                                        v                           |
|  +--------------------+             +-------------------------------+           |
|  | Service Worker     |             | Background Sync Coordinator   |           |
|  | (public/sw.js)     |             | (Idle prefetch & Query sync)  |           |
|  +---------+----------+             +---------------+---------------+           |
|            | Cache-First                            |                           |
|            v                                        v                           |
|  +--------------------+             +-------------------------------+           |
|  |  CacheStorage      |             | IndexedDB (docsy_offline_v1)  |           |
|  |  (Static / Shell)  |             | [documents] [conversations]   |           |
|  +--------------------+             | [messages]  [auth_snapshot]   |           |
|                                     +-------------------------------+           |
+---------------------------------------------------------------------------------+
```

---

## 4. Detailed Component Specifications

### 4.1 PWA Manifest (`app/manifest.ts`)
Defined using Next.js native `MetadataRoute.Manifest`:
- `name`: `"Docsy AI — Interactive Document Assistant"`
- `short_name`: `"Docsy"`
- `start_url`: `"/"`
- `display`: `"standalone"`
- `background_color`: `"#08080a"`
- `theme_color`: `"#08080a"`
- `icons`: References `/favicon.svg`, `/favicon-32x32.png`, and maskable configurations.

### 4.2 Service Worker (`public/sw.js`)
- **Version Key:** `docsy-cache-v1`
- **Install Phase:** Pre-caches static assets, `/favicon.ico`, `/favicon.svg`, `/logo.svg`, and an offline fallback shell. Calls `self.skipWaiting()`.
- **Activate Phase:** Evicts stale cache versions and calls `clients.claim()`.
- **Fetch Routing:**
  - `/_next/static/*`, `/favicon.*`, fonts, images: **Cache-First** strategy.
  - Page Navigation (`mode === 'navigate'`): **Network-First with Cache Fallback**. If network fails, serves cached page shell.
  - `/api/chat`, `/api/conversations/*/messages`, `/api/upload`: **Network-Only** (bypasses SW cache to guarantee live SSE streams).

### 4.3 Offline Storage Engine (`src/lib/offline-db.ts`)
Typed IndexedDB wrapper targeting `docsy_offline_v1`:
- **Object Stores:**
  - `documents`: Key `id` (string), indexes: `by_user` (`userId`), `by_updated` (`updatedAt`). Holds `Document` records.
  - `conversations`: Key `id` (string), indexes: `by_user` (`userId`), `by_updated` (`updatedAt`). Holds `Conversation` records.
  - `messages`: Key `id` (string), indexes: `by_conversation` (`conversationId`), `by_created` (`createdAt`). Holds `Message` records with citations.
  - `auth_snapshot`: Key `userId` (string). Holds serialized user metadata (`id`, `fullName`, `email`, `imageUrl`, `plan`, `cachedAt`).
- **Quota Management:** Monitors total entries; retains latest 100 conversations and all user documents.

### 4.4 Proactive Background Sync Service (`src/features/offline/services/background-sync.service.ts`)
- **Execution Hook:** Runs when online and authenticated via `requestIdleCallback` (fallback `setTimeout`).
- **Cooldown:** 5-minute debounce to prevent redundant queries.
- **Workflow:**
  1. Captures Clerk user profile and writes to `auth_snapshot`.
  2. Queries user documents via API/React Query and upserts to `documents` store.
  3. Queries user conversations and upserts to `conversations` store.
  4. For top 5 most recent conversations, fetches and stores message turns in `messages` store.
  5. Updates in-memory sync state (`lastSyncedAt`, `isSyncing`).

### 4.5 Network Hook & Banner (`src/features/offline/...`)
- **`useNetworkStatus()`:** Subscribes to `online` and `offline` window events. Exposes `{ isOnline: boolean, wasOffline: boolean }`.
- **`OfflineBanner`:**
  - **Offline State:** Floating pill in header/viewport with amber indicator:
    *"⚡ Offline Mode — Viewing cached documents & transcripts in read-only"*
  - **Reconnected State:** Emerald glow pill: *"Back Online — Synced"* that auto-dismisses after 3 seconds.

### 4.6 Feature Guardrails
- **`chat-composer.tsx`:** Disables submission button when `!isOnline`. Input placeholder displays *"You are offline. Connect to internet to ask questions."*
- **`upload-modal.tsx`:** Disables file dropzone with offline warning when `!isOnline`.

---

## 5. Security & Authentication Considerations
- Cached data in IndexedDB is origin-scoped to the user's browser.
- Clerk session tokens are never forged; offline mode provides read-only presentation of previously authorized client data.
- Sensitive payment credentials or admin keys are never written to IndexedDB.

---

## 6. Verification & Testing Plan
1. **Lighthouse PWA Audit:** Verify installability badge and manifest validity.
2. **Network Disconnect Simulation:**
   - In Chrome DevTools (Network tab -> "Offline"):
   - Verify app shell reloads cleanly without broken page error.
   - Verify document list and conversation list render from IndexedDB.
   - Verify opening an existing conversation displays full message history and citations.
   - Verify chat composer and upload modal disable inputs with appropriate notices.
3. **Reconnection Verification:**
   - Toggle network back to "Online".
   - Verify emerald "Back Online" toast appears and fades.
   - Verify new messages and uploads can be sent immediately.
