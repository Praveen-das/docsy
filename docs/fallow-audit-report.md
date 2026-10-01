# Fallow Codebase Audit Report: Docsy AI

> **Generated:** September 30, 2026  
> **Tool:** `fallow@3.30.0`  
> **Scope:** Full repository analysis (`src/`, `app/`, `public/`, `package.json`)  
> **Baseline:** 274 files, 1,504 functions, 29,299 lines of code analyzed  

---

## 1. Executive Summary

| Category | Count | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Total Issues Flagged** | **117** | ⚠️ Action Required | Dead code, duplication, structural cycles |
| **Unused Files** | **8** | 🟡 13 Purged | Purged 5 billing + 8 obsolete UI/barrels; Offline & PDF viewer remain |
| **Unused NPM Dependencies** | **0** | 🟢 Clean | 4 dead packages removed from `package.json` |
| **Unlisted Runtime Dependencies** | **0** | 🟢 Clean | Added `@upstash/qstash` and `jose` to `package.json` |
| **Circular Import Cycles** | **2** | 🟢 Both Resolved | Zustand ↔ Hook cycle fixed; Dashboard card ↔ section fixed |
| **Re-export Cycles** | **1** | 🟢 Resolved | Self-loop in `header-user-menu.tsx` removed |
| **Unused Exports / Types** | **87** | 🟢 Minor | 65 dead exports, 22 dead types |
| **Code Duplication** | **3.95%** | 🟢 Reduced | Dropped from 5.15% (1,509 lines) to 3.95% (1,117 lines) |
| **Complexity Findings** | **209** | 🔴 70 Critical | High CC / Cognitive / CRAP score hotspots |

---

## 2. Architectural Issues

### 2.1 Circular Dependencies

#### 1. Zustand Store ↔ React Query Hook Cycle (✅ RESOLVED)
- **Files Involved:**
  - `src/features/conversations/hooks/use-conversations.ts`
  - `src/stores/conversation-store.ts`
- **Root Cause:**
  - `conversation-store.ts` was directly importing `updateConversationInCache` from `use-conversations.ts`.
  - `use-conversations.ts` was importing `useConversationStore` from `conversation-store.ts`.
- **Resolution:**
  - Extracted query keys and cache updater to `src/features/conversations/services/conversation-cache.service.ts`.
  - Extracted message cache functions to `src/features/chat/services/message-cache.service.ts`.
  - Store now imports purely from the service layer. Cycle eliminated.

#### 2. Dashboard Card ↔ Section Component Cycle (✅ RESOLVED)
- **Files Involved:**
  - `src/features/dashboard/components/recent-document-card.tsx`
  - `src/features/dashboard/components/recent-documents-section.tsx`
- **Root Cause:**
  - `recent-document-card.tsx` was importing interface `DashboardDocumentItem` from parent `recent-documents-section.tsx`.
  - `recent-documents-section.tsx` imports `RecentDocumentCard` from `recent-document-card.tsx`.
- **Resolution:**
  - Colocated `DashboardDocumentItem` contract inside child `recent-document-card.tsx`.
  - Parent `recent-documents-section.tsx` now imports and re-exports it. Unidirectional import graph achieved. Cycle eliminated.

---

### 2.2 Re-Export Self-Loop (✅ RESOLVED)

- **File Involved:**
  - `src/components/layout/header-user-menu.tsx`
- **Root Cause:**
  - File had `export * from "./header-user-menu"` which created a circular self-referential export chain.
- **Resolution:**
  - Removed dangling `export * from "./header-user-menu"` statement. No external modules rely on wildcard subcomponent re-exports. Cycle eliminated.

---

### 2.3 Dependency Hygiene (`package.json`) (✅ RESOLVED)

#### Added Direct Dependencies (Previously unlisted in `package.json`):
- `@upstash/qstash` (`^2.11.3`) — imported in `src/lib/qstash/index.ts`
- `jose` (`^5.10.0`) — imported in `src/lib/conversation-token.ts`

#### Purged Dead Dependencies (0 usages across project):
- `@ai-sdk/react` (`^4.0.120`) — removed
- `@langchain/google-genai` (`^2.3.0`) — removed
- `@langchain/pinecone` (`^1.0.3`) — removed
- `langchain` (`^1.5.10`) — removed

---

## 3. Dead Code Analysis

### 3.1 Unused Files (8 Remaining)

#### A. Orphaned Offline Subsystem (4 Files)
Commented out in `app/layout.tsx:70`. Entire subsystem is disconnected from application lifecycle:
- `public/sw.js` (Service worker implementation)
- `src/providers/offline-provider.tsx` (Service worker registration & state provider)
- `src/features/offline/components/offline-banner.tsx` (Banner component)
- `src/features/offline/services/background-sync.service.ts` (Sync execution service)

#### B. Orphaned PDF Viewer Subsystem (4 Files)
Completely unreferenced by any route or feature component:
- `src/features/pdf-viewer/pdf-viewer.tsx`
- `src/features/pdf-viewer/components/pdf-toolbar.tsx`
- `src/features/pdf-viewer/components/pdf-thumbnails.tsx`
- `src/features/pdf-viewer/components/pdf-page-canvas.tsx`

#### C. Orphaned Billing Components (5 Files - ✅ PURGED)
Purged from repository:
- `src/features/billing/pricing-section.tsx` (Deleted)
- `src/features/billing/pricing-card.tsx` (Deleted)
- `src/features/billing/billing-faq.tsx` (Deleted)
- `src/features/billing/feature-comparison-table.tsx` (Deleted)
- `src/features/settings/components/billing/plan-perks.tsx` (Deleted)

#### D. Unused Components & Obsolete Services (8 Files - ✅ PURGED)
Purged from repository:
- `src/components/layout/sidebar-nav-pills.tsx` (Deleted)
- `src/features/conversations/components/conversation-item.tsx` (Deleted)
- `src/features/conversations/components/conversation-sidebar-header.tsx` (Deleted)
- `src/features/conversations/components/mobile-pane-switcher.tsx` (Deleted)
- `src/features/documents/components/document-options-button.tsx` (Deleted)
- `src/features/chat/citation-pill.tsx` (Deleted)
- `src/features/chat/components/citation-list.tsx` (Deleted)
- `src/services/processing.service.ts` (Deleted)

---

### 3.2 Dead Exports & Types (Summary)
- **65 Unused Exports:** Includes components like `RedPdfBadge` in `app/(app)/(main)/page.tsx`, `ThemeToggle`, `default` exports in `gradient-orb.tsx`, `modal-backdrop.tsx`, etc.
- **22 Unused Types:** Includes `Database` in `src/db/index.ts`, `SidebarNavItemProps`, `ButtonProps`, `GlowCardProps`, `LogoProps`, `InvoicesResponse`, etc.

---

## 4. Code Duplication (Remediated)

Duplication reduced from **5.15% (1,509 lines)** to **0 clone groups** on `npx fallow dupes` (`✓ No code duplication found`).

| Clone Group | Status | Replaced By / Remediation |
| :--- | :--- | :--- |
| **1. Dynamic Route Auth & Execution (`dup:6f87acd9`)** (30 lines) | 🟢 RESOLVED | Extracted `withAuthRoute` in `src/lib/api-auth.ts` across `pin/route.ts`, `favorite/route.ts`, and `reprocess/route.ts`. |
| **2. Conversation Card vs Row UI** (129 lines) | 🟢 RESOLVED | Extracted `ConversationActionMenu` in `conversation-action-menu.tsx` & unified `ConversationItemProps`. |
| **3. Conversations Page View Loops** (40 lines) | 🟢 RESOLVED | Unified list & grid rendering loop via dynamic `ConversationItem` in `app/(app)/(main)/conversations/page.tsx`. |
| **4. Toolbar Menus & Filter Pills** (84 lines) | 🟢 RESOLVED | Extracted `FilterPills` in `filter-tabs.tsx` and memoized `docMenuSections` in `conversations-toolbar.tsx` & `document-toolbar.tsx`. |
| **5. Fast-Path Token Authorization** (80 lines) | 🟢 RESOLVED | Added `getConversationTokenContext` in `src/lib/api-auth.ts` across `[id]/messages/route.ts` & `[id]/messages/[messageId]/route.ts`. |
| **6. Webhook Secret Verification** (35 lines) | 🟢 RESOLVED | Added `verifySupabaseWebhookSecret` in `src/lib/api-auth.ts` for database and storage webhook handlers. |
| **7. Sidebar Hydration & Collapse State** (44 lines) | 🟢 RESOLVED | Extracted `useSidebarState` in `src/components/layout/use-sidebar-state.ts` for `sidebar.tsx` and `conversation-sidebar.tsx`. |
| **8. Document XHR Upload Pipeline** (76 lines) | 🟢 RESOLVED | Centralized in `documentApiService.uploadFile` in `document-api.service.ts` for `use-document-upload.ts` and `upload-modal.tsx`. |
| **9. Modal Escape Key & Body Scroll Lock** (56 lines) | 🟢 RESOLVED | Extracted `useModalDismiss` in `src/components/ui/modal-backdrop.tsx` for `dialog.tsx`, `select-document-modal.tsx`, `upload-modal.tsx`, and `document-conversations-dialog.tsx`. |
| **10. Document Batch Status Responses** (24 lines) | 🟢 RESOLVED | Extracted `respondWithStatuses` in `app/api/documents/status/route.ts`. |
| **11. File Size Formatting Utility** (21 lines) | 🟢 RESOLVED | Centralized `formatFileSize` in `src/lib/utils.ts` across `document-conversations-dialog.tsx`, `select-document-modal.tsx`, and `feedback-modal.tsx`. |
| **12. Optimistic Cache Mutations** (52 lines) | 🟢 RESOLVED | Extracted `snapshotConversationsCache`, `rollbackConversationsCache`, and `invalidateConversationsCache` in `conversation-cache.service.ts`. |
| **13. API Route Auth & Param Handling** (72 lines across 8 routes) | 🟢 RESOLVED | Extracted `getAuthRouteContext` in `src/lib/api-auth.ts`. |
| **14. Auth Pages Boilerplate** (74 lines) | 🟢 RESOLVED | Extracted `AuthLayout` and `CLERK_AUTH_APPEARANCE` in `src/components/layout/auth-layout.tsx`. |
| **15. Card Mouse Spotlights** (46 lines) | 🟢 RESOLVED | Extracted `bindGlowHandlers` in `src/lib/interactive-glow.ts`. |

---

## 5. Complexity & Churn Hotspots

### 5.1 Top Maintenance Hotspots (Remediated)
1. **`src/features/chat/hooks/use-chat-conversation.ts`**: 🟢 RESOLVED. Decomposed into `useChatActions` (`use-chat-actions.ts`), `useChatSessionSync` (`use-chat-session-sync.ts`), and helper `findPrecedingUserTurn`. Removed from fallow refactoring targets; LOC dropped from 294 to 90, cognitive complexity dropped from 33 to < 5.
2. **`src/components/layout/conversation-sidebar.tsx`**: 🟢 RESOLVED. Removed dead imports (`Link`, `usePathname`, `lucide-react` icons, unused `QUICK_NAV` array), simplified route transition, and fixed CSS class typo.
3. **`src/features/chat/components/message-list.tsx`**: 🟢 RESOLVED. Extracted virtual scroll orchestration into `useMessageListScroll` (`use-message-list-scroll.ts`) and floating notification banners into `MessageListBanners` (`message-list-banners.tsx`). Removed from fallow refactoring targets; cognitive complexity dropped from 37 to < 8.
4. **`src/services/document.service.ts`**: 🟢 RESOLVED. Extracted storage cleanup, vector deletions, and missing status resolution pipeline into `document-status.helper.ts`. Purged uncalled `updateDocumentMetadata`, eliminating CRITICAL cyclomatic 10 and reducing file LOC from 638 to 365.

### 5.2 Large Monolithic Components ("God Components")
- `SelectDocumentModal` in `src/features/documents/components/select-document-modal.tsx`: 🟢 RESOLVED. Decomposed into `useDocumentSearch` (`use-document-search.ts`), `SearchDocumentResultItem` & `SearchConversationResultItem` (`search-result-items.tsx`), and `SearchModalEmptyStates` (`search-modal-empty-states.tsx`). Removed from refactoring targets and large functions list.
- `ConversationsToolbar` in `src/features/conversations/components/conversations-toolbar.tsx`: 🟢 RESOLVED. Decomposed into `ConversationDocFilterMenu`, `ConversationSortMenu`, and `ConversationViewSwitcher` (`conversations-toolbar-menus.tsx`). Removed from refactoring targets and large functions list.
- `UploadModal` in `src/features/documents/upload-modal.tsx`: 🟢 RESOLVED. Decomposed into `useDocumentUploadModal` (`use-document-upload-modal.ts`), `UploadDropzone` (`upload-dropzone.tsx`), `UploadFilePreview` (`upload-file-preview.tsx`), `UploadIdleView` (`upload-idle-view.tsx`), and `UploadProgressView` / `UploadFailedView` (`upload-status-views.tsx`). LOC dropped from 382 to 114; removed from top large functions.
- `PricingPage` in `app/pricing/page.tsx`: **266 lines**

---

## 6. Recommended Action Plan

### Phase 1: Safe Architecture Fixes (Low Risk, Zero Regressions)
- [x] Extract conversation & message cache services to break Zustand ↔ Hook cycle.
- [x] Move `DashboardDocumentItem` into a shared types file to resolve `recent-document-card.tsx` cycle.
- [x] Delete `export * from "./header-user-menu"` line 149 in `header-user-menu.tsx`.
- [x] Add `@upstash/qstash` and `jose` to `package.json` dependencies.

### Phase 2: Dependency & Dead File Purge
- [x] Uninstall dead packages: `@ai-sdk/react`, `@langchain/google-genai`, `@langchain/pinecone`, `langchain`.
- [ ] Verify whether `pdf-viewer` is planned or abandoned; purge if abandoned.
- [ ] Re-enable `OfflineProvider` or delete `src/features/offline/` and `public/sw.js`.
- [x] Purge `sidebar-nav-pills.tsx`, `conversation-item.tsx`, and `processing.service.ts`.
- [x] Purge orphaned billing components (5 files).

### Phase 3: Duplication Consolidation
- [x] Create `getAuthRouteContext` for Next.js route handlers (`app/api/...`).
- [x] Extract shared `ConversationActionMenu` component for `conversation-grid-card` and `conversation-list-row`.
- [x] Unify `login` and `register` layout wrapper into reusable `AuthLayout`.
- [x] Unify `glow-card` and `glow-row` event binding in `interactive-glow.ts`.
- [x] Unify optimistic query rollback handlers in `conversation-cache.service.ts`.
