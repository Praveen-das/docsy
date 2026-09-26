# Implementation Plan: Offline Support & PWA for Docsy

**Spec:** [`docs/superpowers/specs/2026-09-26-offline-support-design.md`](file:///c:/Users/pvn/Desktop/docsy/docs/superpowers/specs/2026-09-26-offline-support-design.md)  
**Date:** 2026-09-26  
**Status:** In Progress  

---

## Overview of Phases

1. **Phase 1: Web App Manifest & Service Worker**
   - Implement `app/manifest.ts` native App Router manifest.
   - Implement `public/sw.js` with Cache-First static asset caching, Network-First page navigation caching, and Network-Only AI stream exclusion.

2. **Phase 2: Typed IndexedDB Storage Engine**
   - Implement `src/lib/offline-db.ts` with stores for `documents`, `conversations`, `messages`, and `auth_snapshot`.

3. **Phase 3: Proactive Background Sync & Query Fallbacks**
   - Implement `src/features/offline/services/background-sync.service.ts`.
   - Wire IndexedDB fallback reads into `useConversations` and `useDocuments` when network fails.

4. **Phase 4: Network Status Hook, Offline Banner & Root Provider**
   - Implement `src/features/offline/hooks/use-network-status.ts`.
   - Implement `src/features/offline/components/offline-banner.tsx`.
   - Implement `src/providers/offline-provider.tsx` and register in `app/layout.tsx`.

5. **Phase 5: Action Guardrails for AI Generation & Uploads**
   - Update `chat-composer.tsx` to disable submission when offline.
   - Update `upload-modal.tsx` to disable dropzone with offline warning when disconnected.

6. **Phase 6: Verification & Validation**
   - Verify Service Worker and manifest registration.
   - Validate offline navigation, cached document/chat rendering, and reconnection state transitions.
