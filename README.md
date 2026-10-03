# Docsy AI

An AI-powered document chat application. Upload PDFs and have citation-aware, grounded conversations with your documents using RAG.

## Tech Stack

| Layer            | Technology                           |
| ---------------- | ------------------------------------ |
| Framework        | Next.js 16 + TypeScript              |
| UI               | React 19, Tailwind CSS v4, shadcn/ui |
| Auth             | Clerk                                |
| Database         | PostgreSQL + Drizzle ORM             |
| Vector DB        | Pinecone                             |
| LLM / Embeddings | Google Gemini (via Vercel AI SDK)    |
| RAG              | LangChain.js                         |
| Async Processing | Upstash QStash + Workflow            |
| Realtime         | Upstash Redis + Realtime             |
| Storage          | Supabase Storage                     |
| Billing          | Stripe                               |
| Testing          | Vitest, Playwright                   |

## Features

- **PDF upload & processing** — async pipeline: extract → chunk → embed → index
- **Citation-aware chat** — answers grounded in document context with page-level source links
- **PDF viewer** — in-app viewer with citation-to-page navigation
- **Multi-document conversations** — query across multiple PDFs in one conversation
- **Conversation history** — persistent chat history with document associations
- **Billing** — usage quotas and Stripe-powered subscription management
- **Realtime status** — live document processing progress via Upstash Realtime

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Accounts/API keys for: Clerk, Pinecone, Google AI, Upstash, Supabase, Stripe

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env.local` and fill in all required values:

```bash
cp .env.example .env.local
```

Required variables (see `.env` for the full list):

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
DATABASE_URL=

# Pinecone
PINECONE_API_KEY=
PINECONE_INDEX=

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=

# Upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
QSTASH_TOKEN=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Database

```bash
# Push schema (dev)
npm run db:push

# Or run migrations
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router (pages + API routes)
├── features/               # Feature-sliced modules
│   ├── billing/
│   ├── chat/
│   ├── conversations/
│   ├── dashboard/
│   ├── documents/
│   ├── pdf-viewer/
│   └── settings/
├── components/             # Shared UI components
├── db/                     # Drizzle schema + migrations
├── lib/                    # Singletons (ai, pinecone, qstash, storage)
├── services/               # Business logic layer
├── stores/                 # Zustand stores
├── types/                  # Shared TypeScript types
└── workers/                # Background worker scripts
```

## Document Processing Pipeline

```
POST /api/documents
  → Upload PDF to Supabase Storage
  → Insert document record (status: PROCESSING)
  → Publish QStash/Workflow job
  → Return 202

Workflow:
  → Download PDF
  → Extract text (page-by-page)
  → Split into chunks (~1000 tokens, 150 overlap)
  → Generate embeddings (Gemini)
  → Upsert vectors to Pinecone (namespace: userId)
  → Update document status → READY
```

## RAG Chat Flow

```
User question
  → Validate auth + conversation ownership
  → Embed query
  → Pinecone similarity search (topK=5, filtered to conversation docs)
  → Build context
  → Stream Gemini response via Vercel AI SDK
  → Persist assistant message + source metadata
```

## Scripts

```bash
npm run dev               # Start dev server
npm run build             # Production build
npm run test              # Run unit tests (Vitest)
npm run test:e2e          # Run E2E tests (Playwright)
npm run db:generate       # Generate Drizzle migrations
npm run db:push           # Push schema to DB (dev only)
npm run db:migrate        # Run migrations
npm run db:studio         # Drizzle Studio UI
npm run worker:quota      # Run quota sync worker
```

## Architecture Notes

- **PostgreSQL** is the source of truth for all application state.
- **Pinecone** is the source of truth for vector search, namespaced per user.
- Vector retrieval is always filtered to the documents in the current conversation — no cross-user leakage possible.
- LLM is instructed to answer only from retrieved context and to cite sources; it will fall back gracefully when context is insufficient.
- Processing errors are surfaced as `status = FAILED` with a user-safe message; transient failures are retried by QStash.
