# Docsy AI — Implementation Checklist

> **Progress:** 39 / 48 Items Complete (~81%)  
> **Type Integrity:** `npx tsc --noEmit` passing with 0 errors  
> **Last Updated:** September 4, 2026

---

### 1. Database & Persistence Layer (PostgreSQL + Drizzle)
- [x] **PostgreSQL Connection Pool**: Type-safe connection via `postgres` & Drizzle ORM (`src/db/index.ts`, `drizzle.config.ts`)
- [x] **Relational Schemas**: Typed tables with foreign keys and indexes (`users`, `documents`, `conversations`, `conversation_documents`, `messages`)
- [x] **Migration Pipeline**: Drizzle Kit scripts configured (`db:generate`, `db:push`, `db:migrate`, `db:studio`)
- [x] **Data Access Services**: Server-side repositories with strict `userId` scoping (`document.service.ts`, `conversation.service.ts`, `user.service.ts`)

---

### 2. Authentication & Authorization (Clerk)
- [x] **User Registration**: Embedded Clerk `<SignUp />` with catch-all routing (`app/register/[[...sign-up]]/page.tsx`)
- [x] **User Login**: Embedded Clerk `<SignIn />` with catch-all routing (`app/login/[[...sign-in]]/page.tsx`)
- [x] **Session State & Profile Sync**: Lazy DB user sync on first access (`app/api/auth/me/route.ts`, `src/services/user.service.ts`)
- [x] **Route Protection Middleware**: Next.js Clerk middleware securing dashboard, documents, conversation, and API routes (`middleware.ts`)
- [x] **User Menu & Avatar**: Hydrated Clerk user profile with sign-out action (`src/components/layout/user-menu.tsx`)

---

### 3. PDF Upload & Object Storage (Supabase)
- [x] **Object Storage Client**: Supabase Storage upload, public URL generation, and file deletion (`src/lib/storage.ts`)
- [x] **Multipart Upload Endpoint**: Validates PDF MIME type, enforces 10MB limit, uploads to Supabase, creates DB record, and dispatches QStash job (`POST /api/documents`)
- [x] **Upload Modal & Drag-and-Drop**: File dropzone with real upload integration and multi-stage status polling (`src/features/documents/upload-modal.tsx`)

---

### 4. Background Processing Pipeline (QStash + LangChain + Gemini)
- [x] **Job Dispatcher & Webhook Receiver**: Upstash QStash job publishing and signature-verified webhook handler (`src/lib/qstash.ts`, `app/api/workflows/process-document/route.ts`)
- [x] **PDF Text Extraction**: Page-by-page text extraction preserving page numbers using `unpdf` (`src/lib/pdf-parser.ts`)
- [x] **Text Chunking**: Recursive character text splitting (~1000 chars, ~150 overlap) with page metadata (`src/lib/chunking.ts`)
- [x] **Embeddings Generation**: Google Gemini embeddings (`text-embedding-004`) via LangChain (`src/lib/embeddings.ts`)
- [x] **Pipeline State Machine**: Document transitions (`UPLOADING` → `EXTRACTING` → `CHUNKING` → `EMBEDDING` → `INDEXING` → `READY` / `FAILED`)

---

### 5. Vector Database (Pinecone)
- [x] **Pinecone Client**: Target index client configuration for 768-dim vectors (`src/lib/pinecone.ts`)
- [x] **Namespaced Vector Upserts**: Vectors stored under `userId` namespace with page and snippet metadata
- [x] **Vector Deletion**: Automatic removal of all vectors for a document upon document deletion

---

### 6. Document Management
- [x] **Document Listing & Filters**: User documents with size, status, chunk counts, search, and status filtering (`app/documents/page.tsx`, `GET /api/documents`)
- [x] **Document Details & Status Polling**: Single document endpoint with live status updates (`GET /api/documents/:id`)
- [x] **Document Deletion**: Cascading deletion across PostgreSQL, Supabase Storage, and Pinecone (`DELETE /api/documents/:id`)
- [x] **Document Reprocessing**: Re-trigger background pipeline for failed documents (`POST /api/documents/:id/reprocess`)
- [x] **Centralized Document Store**: Zustand store with optimistic updates and API syncing (`src/stores/document-store.ts`)

---

### 7. Conversations Management
- [x] **Create Conversation**: Create conversation linked to documents with optimistic client UUID (`POST /api/conversations`)
- [x] **Conversation History**: Chronological list with snippet previews, document badges, and search (`app/conversations/page.tsx`, `GET /api/conversations`)
- [x] **Message History Endpoint**: Retrieve messages with citations for active conversation (`GET /api/conversations/:id/messages`)
- [x] **Rename Conversation**: Update conversation title manually or auto-name from first query (`PATCH /api/conversations/:id`)
- [x] **Delete Conversation**: Delete conversation & messages while preserving documents (`DELETE /api/conversations/:id`)
- [x] **Multi-Document Linkage**: Junction table supporting multiple documents per conversation (`conversation_documents`)
- [x] **Centralized Conversation Store**: Zustand store with draft saving, optimistic routing, and streaming state (`src/stores/conversation-store.ts`)

---

### 8. AI Chat & RAG Streaming Engine
- [x] **Semantic Vector Retrieval**: Query embedding & similarity search scoped strictly to conversation documents (`src/services/rag.service.ts`)
- [x] **Context Construction & Guardrails**: System prompt strictly grounding responses in context and blocking prompt injection (`src/lib/prompt-templates.ts`)
- [x] **Token Streaming Endpoint**: Vercel AI SDK text streaming via Google Gemini 2.0 Flash (`POST /api/conversations/:id/messages/stream`)
- [x] **Real-Time Citations**: Stream response headers (`x-sources`) passing citations immediately to the client
- [x] **Message & Citation Persistence**: Automatic persistence of assistant messages and citation JSONB upon stream completion
- [x] **Daily Query Quota**: Enforce user limits, increment counters, and block queries when exceeded

---

### 9. Source Citations & PDF Viewer (Phase 4 Target)
- [x] **Citation Badges & Popover**: Interactive citation pills (`Page X`, relevance score, snippet) rendered under messages
- [x] **Citation Spotlight Navigation**: Clicking citation jumps viewer to target page, highlights text, and syncs active document
- [ ] **Real PDF.js In-Browser Canvas**: Install & configure `react-pdf` / `pdfjs-dist` with Next.js web worker handling
- [ ] **Authenticated Storage URL Streaming**: Stream uploaded PDF binary/signed URL from Supabase Storage into the viewer
- [ ] **Real PDF Page Thumbnails**: Dynamic thumbnail preview strip rendered directly from the loaded PDF pages
- [ ] **Bounding-Box Citation Spotlight**: Overlay visual highlight rects on the exact citation coordinates within the PDF canvas

---

### 10. UI/UX & Layout
- [x] **Split-Pane Workspace**: Side-by-side desktop layout (PDF left, Chat right) with mobile pane switcher
- [x] **Dark / Light Theme**: High-contrast dark mode, light mode, and system preference detection
- [x] **Marketing Landing Page**: Hero, interactive demo sandbox, feature cards, and architecture overview (`app/page.tsx`)
- [x] **Dashboard Overview**: Recent documents, active conversations, quick dropzone, and daily query quota gauge (`app/dashboard/page.tsx`)

---

### 11. Security, Resilience & Logging
- [x] **Cross-Tenant Vector Isolation**: Pinecone queries and upserts partitioned strictly by `userId` namespace
- [x] **Prompt Injection Shield**: Document content isolated and treated as untrusted data
- [x] **Webhook Security**: Cryptographic verification of QStash signatures
- [x] **Structured Lifecycle Logging**: JSON logger across upload, processing, retrieval, and chat milestones (`src/lib/logger.ts`)
- [x] **Streaming Resilience**: Client stream reader with error notice fallbacks on connection or quota interruptions

---

### 12. Environment, Testing & Deployment
- [x] **Environment Template**: Fully documented `.env.example`
- [x] **Strict TypeScript Verification**: Zero compilation errors (`npx tsc --noEmit`)
- [ ] **Live Credentials Configuration**: Populate `.env` with live keys (Aiven PostgreSQL, Clerk, Supabase, Gemini, Pinecone, QStash)
- [ ] **Database Schema Push**: Run `npm run db:push` to apply tables and indexes to live Aiven PostgreSQL
- [ ] **Automated Unit Tests**: Vitest suite for chunking, prompt templates, and PDF text extraction
- [ ] **Security & Multi-Tenant Tests**: Automated verification of cross-tenant data isolation
- [ ] **End-to-End Smoke Test**: Live file upload → QStash background processing → Pinecone vector upsert → streaming chat with citations
