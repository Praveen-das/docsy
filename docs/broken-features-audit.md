# Broken Features & Button Issues Audit

This document details known broken features, unwired buttons, and routing issues identified across the Docsy codebase, along with their root causes, user impacts, and proposed fixes.

---

## Summary of Issues

| ID | Issue | Severity | Component / Route | Status |
|---|---|---|---|---|
| **ISSUE-01** | Direct & Shared Conversation URLs lead to blank page | 🔴 High | `/conversation/[id]`, `/chat/[id]` | ✅ Resolved (Routes pruned, direct URLs used) |
| **ISSUE-02** | Conversation Title Rename fails silently in Chat Header | 🟡 Medium | `ChatHeader`, `ChatView` | ✅ Resolved (Wired to `useRenameConversation`) |
| **ISSUE-03** | Assistant Message "Share" action button missing from UI | 🟡 Medium | `ChatMessageItem` | ✅ Resolved (Share button added & wired) |
| **ISSUE-04** | Missing "Delete PDF" option on Recent Documents cards | 🟢 Low | `RecentDocumentCard` | ✅ Resolved (Wired `useDeleteDocument` & Dialog) |
| **ISSUE-05** | `/conversation?conv=:id` URL parameter drops document session | 🟡 Medium | `ConversationWorkspace` | ✅ Resolved (Auto-resolves doc from cache) |

---

## Detailed Issue Breakdown

### ISSUE-01: Direct & Shared Conversation URLs Render Blank Page
- **Severity:** 🔴 High
- **Files Affected:**
  - [`app/(app)/(workspace)/conversation/[id]/page.tsx:L12-L24`](file:///c:/Users/pvn/Desktop/docsy/app/%28app%29/%28workspace%29/conversation/%5Bid%5D/page.tsx#L12-L24)
  - [`app/(app)/(workspace)/chat/[id]/page.tsx:L9`](file:///c:/Users/pvn/Desktop/docsy/app/%28app%29/%28workspace%29/chat/%5Bid%5D/page.tsx#L9)
  - [`src/features/documents/components/conversation-options-menu.tsx:L67`](file:///c:/Users/pvn/Desktop/docsy/src/features/documents/components/conversation-options-menu.tsx#L67)
- **Problem Description:**
  The server-side redirect logic inside `/conversation/[id]/page.tsx` was commented out and replaced with a debug `console.log`. The component returns `undefined` (empty blank page).
- **User Impact:**
  1. Clicking **"Open in new window"** from any conversation options menu (`window.open('/conversation/${id}')`) opens a blank page.
  2. Clicking **"Share chat"** copies `/conversation/${id}` to the clipboard. Anyone visiting that link gets a blank screen.
  3. Visiting `/chat/:id` redirects to `/conversation/:id`, which also yields an empty page.
- **Proposed Fix:**
  Uncomment and activate the conversation lookup and redirect in `conversation/[id]/page.tsx`:
  ```tsx
  const conv = await getConversation(userId, id);
  if (!conv || !conv.documentIds || conv.documentIds.length === 0) {
    redirect(`/conversation?conv=${id}`);
  }
  const docId = conv.documentIds[0];
  redirect(`/conversation?doc=${docId}&conv=${id}`);
  ```

---

### ISSUE-02: Conversation Title Rename Fails Silently in Chat Header
- **Severity:** 🟡 Medium
- **Files Affected:**
  - [`src/features/chat/chat-view.tsx:L67-L75`](file:///c:/Users/pvn/Desktop/docsy/src/features/chat/chat-view.tsx#L67-L75)
  - [`src/features/chat/components/chat-header.tsx:L33-L40`](file:///c:/Users/pvn/Desktop/docsy/src/features/chat/components/chat-header.tsx#L33-L40)
- **Problem Description:**
  `ChatHeader` declares `onRenameTitle?: (newTitle: string) => void` in its props and calls it when the user saves a new title via the pencil button or the 3-dots "Rename" option. However, `ChatView` renders `<ChatHeader />` without passing `onRenameTitle`.
- **User Impact:**
  The user edits the title in the chat header, presses Enter or clicks checkmark, the input closes, but the new title is **never saved to the server or local cache**. On next navigation or refresh, the title reverts to the old one.
- **Proposed Fix:**
  In `src/features/chat/chat-view.tsx`:
  ```tsx
  const { mutate: renameConversation } = useRenameConversation();

  <ChatHeader
    conversationId={activeConvId || ""}
    conversationTitle={title || "Summarize the key findings"}
    documentName={documentName}
    pageCount={pageCount}
    lastUpdated="2 hours ago"
    isViewerOpen={isViewerOpen}
    onToggleViewer={onToggleViewer}
    onRenameTitle={(newTitle) => {
      if (activeConvId) {
        renameConversation({ convId: activeConvId, newTitle });
      }
    }}
  />
  ```

---

### ISSUE-03: Assistant Message "Share" Button Missing from UI
- **Severity:** 🟡 Medium
- **Files Affected:**
  - [`src/features/chat/components/chat-message-item.tsx:L8-L36, L173-L206`](file:///c:/Users/pvn/Desktop/docsy/src/features/chat/components/chat-message-item.tsx#L8-L36)
  - [`src/features/chat/chat-view.tsx:L92`](file:///c:/Users/pvn/Desktop/docsy/src/features/chat/chat-view.tsx#L92)
  - [`src/features/chat/utils/chat-message.utils.ts:L9-L21`](file:///c:/Users/pvn/Desktop/docsy/src/features/chat/utils/chat-message.utils.ts#L9-L21)
- **Problem Description:**
  `shareMessageContent` is fully implemented in `chat-message.utils.ts` and piped through `useChatConversation` -> `ChatView` -> `MessageList` -> `MessageRow` -> `ChatMessageItem (onShare)`. However, `ChatMessageItem` only renders "Copy" and "Regenerate" buttons in the action toolbar; the "Share" button was omitted.
- **User Impact:**
  The user cannot share an individual assistant answer/citation response, despite the backend and clipboard formatting utility already existing.
- **Proposed Fix:**
  Add a Share button in `ChatMessageItem` next to the Copy and Regenerate buttons:
  ```tsx
  {onShare && (
    <button
      type="button"
      onClick={() => onShare(message)}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-zinc-400"
    >
      <Share2 className="h-3.5 w-3.5" />
      <span className="text-xs">Share</span>
    </button>
  )}
  ```

---

### ISSUE-04: Missing "Delete PDF" Action on Homepage Recent Documents Cards
- **Severity:** 🟢 Low
- **Files Affected:**
  - [`src/features/dashboard/components/recent-document-card.tsx:L58-L67`](file:///c:/Users/pvn/Desktop/docsy/src/features/dashboard/components/recent-document-card.tsx#L58-L67)
  - [`src/features/dashboard/components/recent-documents-section.tsx:L16-L42`](file:///c:/Users/pvn/Desktop/docsy/src/features/dashboard/components/recent-documents-section.tsx#L16-L42)
  - [`app/(app)/(main)/page.tsx:L161`](file:///c:/Users/pvn/Desktop/docsy/app/%28app%29/%28main%29/page.tsx#L161)
- **Problem Description:**
  On the home dashboard, `RecentDocumentCard` renders `DocumentOptionsMenu`, but does not pass `onDelete`. `DocumentOptionsMenu` checks `if (!onDelete) return undefined;` for `destructiveAction`, resulting in the 3-dots menu showing only "Favorites" and "Conversations", but no delete option.
- **User Impact:**
  Users can delete recent conversations directly from the home dashboard, but cannot delete documents without navigating to the `/documents` page first.
- **Proposed Fix:**
  Wire `useDeleteDocument()` in `HomePage` or `RecentDocumentCard`, passing `onDelete` to `DocumentOptionsMenu` with `DeleteDocumentDialog` confirmation.

---

### ISSUE-05: `/conversation?conv=:id` URL Drops Document Context
- **Severity:** 🟡 Medium
- **Files Affected:**
  - [`app/(app)/(workspace)/conversation/page.tsx:L37-L55`](file:///c:/Users/pvn/Desktop/docsy/app/%28app%29/%28workspace%29/conversation/page.tsx#L37-L55)
- **Problem Description:**
  In `ConversationWorkspace`, the synchronization effect immediately checks:
  ```tsx
  if (!docId) {
    if (currentActive !== null) {
      setActiveConversation(null);
    }
    return;
  }
  ```
  If a user visits `/conversation?conv=<id>` (without explicit `&doc=`), `docId` is `null`, causing the page to reset the active conversation and show the empty "Select a Document" screen, even if the conversation already has an associated document in the query cache.
- **User Impact:**
  Bookmarking or opening URLs with only the `conv` parameter fails to load the chat session and document.
- **Proposed Fix:**
  When `convId` is present and `docId` is missing, look up the conversation in `conversations` query data to resolve `conv.documentIds[0]` and redirect/set active document automatically:
  ```tsx
  if (!docId && convId) {
    const targetConv = conversations.find((c) => c.id === convId);
    if (targetConv?.documentIds?.[0]) {
      router.replace(`/conversation?doc=${targetConv.documentIds[0]}&conv=${convId}`);
      return;
    }
  }
  ```
