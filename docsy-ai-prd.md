# Docsy AI — Project Requirements Document

**Version:** 2.0  
**Status:** Draft  
**Project Type:** AI-powered full-stack portfolio project

## 1. Product Overview

Docsy AI is a web application that allows authenticated users to upload PDF documents and have grounded, citation-aware conversations with them using Retrieval-Augmented Generation (RAG).

The architecture follows the general principles of the reference project:

**durable-llm-streams**  
https://github.com/joschan21/durable-llm-streams

The application uses Next.js as the full-stack framework, PostgreSQL as the relational source of truth, Pinecone for vector search, Gemini for AI generation, and Upstash QStash/Workflow for asynchronous document processing.

---

## 2. Goals

### Product goals

- Upload and process PDF documents.
- Process PDFs asynchronously.
- Extract and chunk document text.
- Generate embeddings and index them in Pinecone.
- Retrieve relevant context for user questions.
- Generate grounded answers with Gemini.
- Stream AI responses to the client.
- Provide page-level source citations.
- Persist conversations and messages.
- Enforce strict per-user authorization.
- Support multi-document conversations after the MVP.

### Portfolio goals

Demonstrate practical knowledge of:

- Next.js and React.
- TypeScript.
- PostgreSQL and relational database design.
- Drizzle ORM.
- Authentication and authorization.
- Background workflows.
- Vector databases.
- Embeddings.
- RAG.
- LLM integration.
- Streaming.
- Cloud deployment.
- Testing and observability.

---

## 3. Non-Goals

The MVP will not include:

- LLM fine-tuning.
- Custom model training.
- Kubernetes.
- Kafka.
- Microservices.
- Complex autonomous agents.
- Voice interaction.
- Image generation.
- Enterprise billing.
- Team collaboration.
- Real-time collaborative editing.
- OCR for scanned/image-only PDFs.

---

## 4. Technology Stack

| Layer                 | Technology                        | Purpose                        |
| --------------------- | --------------------------------- | ------------------------------ |
| Framework             | Next.js + TypeScript              | Full-stack application         |
| UI                    | React                             | User interface                 |
| Styling               | Tailwind CSS                      | Styling                        |
| Components            | shadcn/ui                         | Reusable UI                    |
| PDF Viewer            | PDF.js                            | In-browser PDF viewing         |
| Database              | PostgreSQL                        | Relational application data    |
| ORM                   | Drizzle ORM                       | Type-safe database access      |
| Vector DB             | Pinecone                          | Embeddings and semantic search |
| RAG                   | LangChain.js                      | RAG orchestration              |
| LLM                   | Google Gemini                     | Answer generation              |
| Embeddings            | Gemini-compatible embedding model | Vector generation              |
| Background Processing | Upstash QStash / Workflow         | Async document processing      |
| AI Streaming          | Vercel AI SDK                     | Streaming responses            |
| Authentication        | Auth.js or secure custom auth     | Authentication                 |
| Object Storage        | Supabase Storage or Cloudinary    | PDF storage                    |
| Deployment            | Vercel + managed services         | Hosting                        |

Provider pricing and free-tier limits must be verified at implementation/deployment time.

---

## 5. Architecture Principles

Each service has a clear responsibility:

```text
PostgreSQL
├── Users
├── Documents
├── Conversations
├── Conversation ↔ Document relationships
└── Messages

Pinecone
├── Document chunk embeddings
└── Vector metadata

Upstash QStash / Workflow
├── Async jobs
├── Workflow steps
└── Retries

Gemini
├── LLM generation
└── Embeddings where applicable

Object Storage
└── Original PDF files
```

PostgreSQL is the source of truth for application state. Pinecone is the source of truth for vector indexing/search.

---

## 6. High-Level Architecture

```text
                         ┌──────────────────────┐
                         │       Next.js        │
                         │                      │
                         │ React UI             │
                         │ Server Components    │
                         │ Route Handlers       │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
        ┌───────────┐         ┌───────────┐        ┌───────────┐
        │ PostgreSQL│         │ Pinecone  │        │  Gemini   │
        │           │         │           │        │           │
        │ App data  │         │ Vectors   │        │ LLM       │
        └───────────┘         └───────────┘        └───────────┘


PDF INGESTION

User
 │
 ▼
Next.js API
 │
 ├── Upload PDF → Object Storage
 ├── Create Document → PostgreSQL
 │
 ▼
Upstash QStash / Workflow
 │
 ▼
Document Processing
 │
 ├── Download PDF
 ├── Extract text
 ├── Split into chunks
 ├── Generate embeddings
 ├── Upsert vectors → Pinecone
 └── Update document → PostgreSQL
```

---

## 7. Recommended Project Structure

```text
Docsy-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── documents/
│   │   │   ├── conversations/
│   │   │   ├── chat/
│   │   │   └── workflows/
│   │   │       └── process-document/
│   │   ├── dashboard/
│   │   ├── chat/
│   │   ├── login/
│   │   ├── register/
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── chat/
│   │   ├── documents/
│   │   ├── pdf/
│   │   ├── layout/
│   │   └── ui/
│   │
│   ├── db/
│   │   ├── index.ts
│   │   ├── schema/
│   │   │   ├── users.ts
│   │   │   ├── documents.ts
│   │   │   ├── conversations.ts
│   │   │   ├── conversation-documents.ts
│   │   │   └── messages.ts
│   │   └── migrations/
│   │
│   ├── lib/
│   │   ├── ai.ts
│   │   ├── rag.ts
│   │   ├── embeddings.ts
│   │   ├── pinecone.ts
│   │   ├── qstash.ts
│   │   ├── storage.ts
│   │   └── auth.ts
│   │
│   ├── services/
│   │   ├── document.service.ts
│   │   ├── conversation.service.ts
│   │   ├── rag.service.ts
│   │   └── processing.service.ts
│   │
│   ├── types/
│   └── utils/
│
├── drizzle.config.ts
├── public/
├── .env.example
├── package.json
├── next.config.ts
└── README.md
```

---

## 8. Functional Requirements

### FR-01 — User Registration

Users must be able to create an account using:

- Name
- Email
- Password

Requirements:

- Validate email.
- Validate password strength.
- Hash passwords securely.
- Prevent duplicate email addresses.
- Store user data in PostgreSQL.

### FR-02 — Authentication

Users must be able to:

- Sign in.
- Sign out.
- Maintain an authenticated session.
- Access protected application routes.

Use secure session handling and httpOnly cookies where applicable.

---

## 9. PDF Upload

### FR-03 — Upload PDF

Authenticated users can upload PDF files.

Initial limits:

- PDF only.
- Configurable maximum file size, initially 10 MB.
- Validate MIME type and extension.
- Store the original file in object storage.
- Create a PostgreSQL document record.
- Trigger asynchronous processing.

Flow:

```text
Upload
 ↓
Object Storage
 ↓
PostgreSQL Document
 ↓
QStash / Workflow
```

Endpoint:

```text
POST /api/documents
```

Response:

```json
{
  "documentId": "document_id",
  "status": "PROCESSING"
}
```

Return `202 Accepted`.

---

## 10. Document Management

### FR-04 — List Documents

Users can view documents they own.

Display:

- Filename.
- File size.
- Upload date.
- Page count.
- Processing status.
- Processing progress.
- Error state.

### FR-05 — Document Details

```text
GET /api/documents/:id
```

The API must verify ownership.

### FR-06 — Delete Document

Deleting a document should remove:

1. PostgreSQL metadata.
2. Object storage file.
3. Associated Pinecone vectors.

---

## 11. Asynchronous Document Processing

### FR-07 — Background Workflow

PDF processing must not block the upload request.

Upload flow:

```text
POST /api/documents
        ↓
Validate
        ↓
Store PDF
        ↓
Insert PostgreSQL record
        ↓
Publish QStash/Workflow job
        ↓
Return 202
```

### FR-08 — Processing Pipeline

```text
Download PDF
      ↓
Extract text
      ↓
Preserve page metadata
      ↓
Split into chunks
      ↓
Generate embeddings
      ↓
Upsert Pinecone vectors
      ↓
Update PostgreSQL
      ↓
READY
```

### FR-09 — Processing States

```text
UPLOADING
PROCESSING
READY
FAILED
```

Optional detailed stages:

```text
EXTRACTING
CHUNKING
EMBEDDING
INDEXING
```

### FR-10 — Retries

Transient failures should be retried through QStash/Workflow.

Permanent failures should result in:

```text
status = FAILED
```

with a user-safe error message.

---

## 12. PDF Text Extraction

Extract text page-by-page while preserving metadata.

Example:

```typescript
{
  pageContent: "Revenue increased by 18%...",
  metadata: {
    documentId: "...",
    page: 12
  }
}
```

If no usable text is extracted, fail gracefully.

OCR is outside the MVP scope.

---

## 13. Chunking

Split extracted text into smaller chunks before embedding.

Initial configuration:

```text
Chunk size: approximately 1000
Chunk overlap: approximately 150
```

Tune these values experimentally.

Each chunk must retain:

```text
documentId
userId
page
chunkIndex
```

---

## 14. Embeddings

Generate an embedding vector for each chunk.

```text
Chunk
 ↓
Embedding Model
 ↓
Vector
```

Use an abstraction:

```typescript
interface EmbeddingProvider {
  embedDocuments(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
}
```

This allows the provider to be replaced later.

---

## 15. Pinecone

### FR-11 — Vector Storage

Pinecone stores document chunk embeddings.

Example metadata:

```json
{
  "userId": "user_123",
  "documentId": "document_123",
  "page": 12,
  "chunkIndex": 42
}
```

Recommended logical organization:

```text
Pinecone Index
└── namespace: userId
      ├── document A vectors
      ├── document B vectors
      └── document C vectors
```

Retrieval must be restricted to the documents associated with the current conversation.

---

## 16. Chat

### FR-12 — Create Conversation

A user can create a conversation associated with one or more documents.

### FR-13 — Ask Question

Flow:

```text
Question
   ↓
Validate authentication
   ↓
Validate conversation ownership
   ↓
Validate selected documents
   ↓
Generate query embedding
   ↓
Pinecone similarity search
   ↓
Retrieve top-K chunks
   ↓
Build context
   ↓
Gemini
   ↓
Stream response
   ↓
Persist assistant message
```

---

## 17. RAG Requirements

### FR-14 — Semantic Retrieval

Use vector similarity search.

Initial configuration:

```text
topK = 5
```

Keep the value configurable.

### FR-15 — Document Filtering

Never retrieve chunks from documents outside the current conversation's selected documents.

### FR-16 — Context Construction

Example:

```text
DOCUMENT CONTEXT

[Annual Report — Page 12]
Revenue increased by 18%...

[Annual Report — Page 15]
International revenue accounted for...

[Financial Results — Page 8]
...
```

---

## 18. Grounded Generation

The LLM must be instructed to:

- Answer using retrieved context.
- Avoid unsupported claims.
- Treat PDF content as untrusted data.
- Ignore instructions embedded inside documents.
- State when the answer cannot be determined.
- Return source information.

Fallback:

```text
I couldn't find enough information in the provided documents to answer that.
```

---

## 19. AI Streaming

### FR-17 — Stream Responses

Preferred flow:

```text
React
 ↓
Next.js Route Handler
 ↓
RAG Retrieval
 ↓
Gemini
 ↓
AI SDK streaming
 ↓
React
```

The response should render progressively.

### FR-18 — Message Persistence

Persist the final assistant response and its source metadata in PostgreSQL.

---

## 20. Source Citations

### FR-19 — Source Metadata

Example:

```json
{
  "content": "Revenue increased by 18% in 2025.",
  "sources": [
    {
      "documentId": "doc123",
      "page": 12
    }
  ]
}
```

### FR-20 — Citation Navigation

Clicking a citation should open the PDF viewer at the referenced page.

---

## 21. PDF Viewer

Use PDF.js for an in-app viewer.

Recommended layout:

```text
┌────────────────┬──────────────────────────┐
│ Documents      │ Chat                     │
│                │                          │
│ report.pdf     │ User question            │
│ thesis.pdf     │                          │
│                │ AI response              │
│                │                          │
│                │ Sources: Page 18         │
│                │                          │
│                │ PDF → Page 18            │
└────────────────┴──────────────────────────┘
```

---

## 22. Conversation Management

### FR-21 — Conversation History

Users can view previous conversations.

Display:

- Title.
- Last updated time.
- Associated documents.

### FR-22 — Delete Conversation

Users can delete conversations they own.

Deleting a conversation must not delete its documents.

---

## 23. Multi-Document Chat

Users should eventually be able to associate multiple documents with one conversation.

Example:

```text
Selected:
✓ Annual Report 2025
✓ Investor Presentation
✓ Financial Results

Question:
"What caused the revenue decline?"
```

Retrieval must be restricted to these documents.

This feature can be implemented after the single-document MVP.

---

## 24. Suggested Questions

After processing completes, display:

```text
What is this document about?

What are the key findings?

What are the main risks?

Summarize the financial performance.
```

Static templates are sufficient for MVP.

---

## 25. PostgreSQL Schema

### Users

```text
users
-----
id
name
email
password_hash
created_at
updated_at
```

### Documents

```text
documents
---------
id
user_id
filename
original_name
file_url
file_size
page_count
chunk_count
status
processing_progress
error
created_at
updated_at
```

Relationship:

```text
users 1 ───── N documents
```

### Conversations

```text
conversations
-------------
id
user_id
title
created_at
updated_at
```

### Conversation Documents

```text
conversation_documents
----------------------
conversation_id
document_id
created_at
```

Relationship:

```text
conversations N ───── N documents
```

Use a composite primary key:

```text
(conversation_id, document_id)
```

### Messages

```text
messages
--------
id
conversation_id
role
content
sources
created_at
```

Relationship:

```text
conversations 1 ───── N messages
```

For PostgreSQL, `sources` may use `jsonb` because source metadata is naturally semi-structured.

---

## 26. PostgreSQL Indexes

Recommended initial indexes:

```text
users.email UNIQUE

documents.user_id
documents.user_id + documents.created_at

conversations.user_id
conversations.user_id + conversations.updated_at

messages.conversation_id + messages.created_at

conversation_documents.document_id
conversation_documents.conversation_id
```

Add or modify indexes based on real query patterns.

---

## 27. API Requirements

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Documents

```text
POST   /api/documents
GET    /api/documents
GET    /api/documents/:id
DELETE /api/documents/:id
POST   /api/documents/:id/reprocess
```

### Conversations

```text
POST   /api/conversations
GET    /api/conversations
GET    /api/conversations/:id
DELETE /api/conversations/:id
```

### Messages

```text
GET  /api/conversations/:id/messages
POST /api/conversations/:id/messages
```

### Streaming

```text
POST /api/conversations/:id/messages/stream
```

### Workflow

```text
POST /api/workflows/process-document
```

The workflow endpoint must verify QStash/Workflow signatures.

---

## 28. Authorization Model

Every protected resource must be scoped to the authenticated user.

```text
Request
   ↓
Authenticated user
   ↓
Resource lookup
   ↓
Verify resource.user_id
   ↓
Allow / Reject
```

Never trust a client-provided `userId`.

The server must derive identity from the authenticated session.

---

## 29. Security Requirements

The application must:

- Hash passwords securely.
- Use secure session/authentication cookies.
- Validate uploaded files.
- Enforce file size limits.
- Keep API keys server-side.
- Validate API request bodies.
- Verify resource ownership.
- Prevent cross-user document access.
- Prevent cross-user Pinecone retrieval.
- Protect workflow endpoints.
- Treat PDF content as untrusted input.
- Protect against prompt injection.
- Avoid exposing secrets/internal errors.

---

## 30. Error Handling

Handle:

```text
Invalid PDF
Large PDF
Corrupted PDF
Empty PDF
Image-only PDF
Storage failure
Text extraction failure
Embedding failure
Pinecone failure
Gemini failure
QStash failure
Authentication failure
Authorization failure
Network timeout
```

Example:

```text
Document processing failed.

We couldn't extract usable text from this PDF.

[Try Again]
```

---

## 31. Performance Targets

Initial engineering targets:

| Operation              |    Target |
| ---------------------- | --------: |
| Upload API response    |   < 2 sec |
| Document status lookup |  < 500 ms |
| Vector retrieval       |   < 1 sec |
| First AI token         | < 3–5 sec |
| Standard API request   |  < 500 ms |

Measure actual performance after deployment.

---

## 32. Cost Requirements

Prefer free/low-cost infrastructure:

```text
Next.js             → Vercel
PostgreSQL          → managed free/low-cost PostgreSQL
Pinecone            → free/starter tier
Gemini              → developer/free tier where available
Upstash             → QStash/Workflow free/low-cost tier
Object Storage      → free/low-cost tier
```

Do not introduce infrastructure without a clear technical purpose.

Do not add Redis + BullMQ solely for PDF processing when QStash/Workflow already satisfies the requirement.

---

## 33. Testing

### Unit Tests

Test:

- Chunking.
- Metadata creation.
- Prompt construction.
- Retrieval filtering.
- Authentication utilities.
- Authorization checks.
- Database services.

### Integration Tests

Test:

```text
PDF upload
 ↓
PostgreSQL record
 ↓
Workflow trigger
 ↓
Document processing
 ↓
Pinecone indexing
 ↓
Question
 ↓
Retrieval
 ↓
Gemini response
```

### Security Tests

Verify:

```text
User A cannot access User B's documents.
User A cannot access User B's conversations.
User A cannot retrieve User B's vectors.
Unauthenticated users cannot access protected APIs.
Unauthorized users cannot invoke internal workflows.
```

---

## 34. RAG Evaluation

Create a small evaluation dataset:

```text
Question
Expected answer
Expected source page
```

Evaluate:

- Retrieval relevance.
- Answer correctness.
- Citation correctness.
- Unsupported/hallucinated answers.
- Response latency.

Use actual measured results in the final README and resume.

Never fabricate metrics.

---

## 35. Observability

Log important events:

```text
document.uploaded
document.processing.started
document.processing.completed
document.processing.failed
embedding.completed
vector.indexed
chat.started
chat.completed
chat.failed
```

Potential metrics:

- PDF processing duration.
- Number of chunks.
- Embedding duration.
- Pinecone retrieval latency.
- Time to first token.
- Total response latency.
- Processing failure rate.

---

## 36. Durable Streaming — Future Phase

Inspired by the reference architecture, investigate:

```text
AI generation
     ↓
Durable stream
     ↓
Persisted stream state
     ↓
Client disconnect
     ↓
Client reconnect
     ↓
Resume stream
```

Potential technologies:

```text
Upstash Realtime
Durable Streams
Vercel AI SDK
```

This is not required for the MVP.

First implement standard AI SDK streaming.

---

## 37. Development Roadmap

### Phase 1 — Foundation

```text
1. Create Next.js project
2. Configure TypeScript
3. Configure Tailwind/shadcn
4. Configure PostgreSQL
5. Configure Drizzle ORM
6. Create schema
7. Run migrations
8. Implement authentication
9. Build dashboard
```

### Phase 2 — Documents

```text
10. PDF upload
11. Object storage
12. Document records
13. Document listing
14. Document status
15. Document deletion
16. PDF extraction
```

### Phase 3 — RAG

```text
17. Text chunking
18. Embedding provider
19. Pinecone configuration
20. Vector metadata
21. Vector upsert
22. Semantic retrieval
23. Document filtering
```

### Phase 4 — Background Processing

```text
24. Configure QStash/Workflow
25. Process-document workflow
26. Processing state updates
27. Retries
28. Failure handling
29. Reprocessing
```

### Phase 5 — AI Chat

```text
30. Conversations
31. Messages
32. RAG prompt
33. Gemini integration
34. Streaming
35. Source citations
36. Message persistence
```

### Phase 6 — UX

```text
37. PDF viewer
38. Citation navigation
39. Upload progress
40. Processing progress
41. Suggested questions
42. Multi-document support
43. Responsive UI
```

### Phase 7 — Production

```text
44. Security hardening
45. Error handling
46. Unit tests
47. Integration tests
48. RAG evaluation
49. Performance testing
50. Deployment
51. README
52. Architecture diagram
53. Screenshots
54. Demo video
```

---

## 38. MVP Definition of Done

A new user must be able to:

```text
Register
   ↓
Login
   ↓
Upload PDF
   ↓
Receive 202 response
   ↓
Document enters PROCESSING
   ↓
QStash/Workflow processes PDF
   ↓
Text is extracted
   ↓
Text is chunked
   ↓
Embeddings are generated
   ↓
Vectors are stored in Pinecone
   ↓
Document becomes READY
   ↓
User creates conversation
   ↓
User asks question
   ↓
Relevant chunks are retrieved
   ↓
Gemini generates grounded response
   ↓
Response streams to UI
   ↓
Sources are displayed
   ↓
Conversation is persisted in PostgreSQL
```

Security must ensure:

```text
User A
 ├── cannot access User B's PDFs
 ├── cannot access User B's conversations
 └── cannot retrieve User B's vectors
```

---

## 39. Final Target Architecture

```text
                         ┌─────────────────────────┐
                         │         Next.js         │
                         │                         │
                         │ React + TypeScript      │
                         │ Server Components       │
                         │ Route Handlers          │
                         └────────────┬────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            │                         │                         │
            ▼                         ▼                         ▼
     ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
     │ PostgreSQL   │         │   Pinecone   │         │    Gemini    │
     │              │         │              │         │              │
     │ Users        │         │ Embeddings   │         │ LLM          │
     │ Documents    │         │ Metadata     │         │ Generation   │
     │ Conversations│         │ Vector Search│         │ Embeddings   │
     │ Messages     │         │              │         │              │
     └──────────────┘         └──────────────┘         └──────────────┘
            ▲                         ▲
            │                         │
            └─────────────┬───────────┘
                          │
                   ┌──────▼───────┐
                   │ RAG / App    │
                   │ Layer        │
                   │              │
                   │ LangChain    │
                   │ Services     │
                   │ AI SDK       │
                   └──────┬───────┘
                          │
                   ┌──────▼───────┐
                   │   Upstash    │
                   │ QStash /     │
                   │ Workflow     │
                   └──────┬───────┘
                          │
                          ▼
                  Document Processing
                          │
                 ┌────────┼────────┐
                 ▼        ▼        ▼
               PDF     Chunking  Embedding
             Extractor
                          │
                          ▼
                      Pinecone


                 PDF FILE STORAGE
                          │
                          ▼
                    Object Storage
```

---

## 40. Portfolio Positioning

### Project Title

**Docsy AI — RAG-Powered Document Assistant**

### Description

A full-stack AI document assistant that enables users to upload PDFs and interact with their contents through grounded, citation-aware conversations.

### Technical Stack

```text
Next.js
TypeScript
React
PostgreSQL
Drizzle ORM
Pinecone
LangChain
Gemini
Upstash QStash/Workflow
Vercel AI SDK
PDF.js
```

### Technical Story

The project demonstrates:

- Relational database design.
- Secure multi-user architecture.
- Asynchronous document processing.
- Vector search.
- Retrieval-Augmented Generation.
- LLM integration.
- Streaming AI responses.
- Citation-aware answers.
- Cloud deployment.

---

## 41. Resume Metrics

Only use metrics measured from the completed implementation.

Potential metrics:

```text
Number of PDFs processed
Number of chunks indexed
Average PDF processing time
Average retrieval latency
Average time to first token
Average response latency
Processing success rate
RAG evaluation accuracy
```

Example format:

```text
• Built a RAG-powered document assistant using Next.js, PostgreSQL,
  Pinecone, LangChain and Gemini, processing X+ document chunks
  with citation-aware semantic retrieval.

• Implemented asynchronous PDF ingestion using Upstash Workflow,
  moving extraction and embedding generation out of the upload
  request and reducing upload response time by X%.

• Implemented streaming AI responses with page-level citations,
  allowing users to trace generated answers back to source PDF pages.
```

Replace all placeholder metrics with real measurements.

---

## 42. Success Criteria

### Functional

- Reliable PDF upload.
- Reliable asynchronous processing.
- Accurate vector retrieval.
- Grounded AI answers.
- Streaming responses.
- Source citations.
- Persistent conversations.
- Multi-user authorization.

### Technical

- PostgreSQL is the relational source of truth.
- Drizzle provides type-safe database access.
- Pinecone handles vector search.
- Upstash handles asynchronous processing.
- LangChain provides useful RAG orchestration.
- Gemini provides AI generation.
- Next.js provides the application/API layer.
- Secrets remain server-side.

### Portfolio

- Public GitHub repository.
- Live demo.
- Architecture diagram.
- High-quality README.
- Screenshots.
- Short demo video.
- Measured performance/evaluation results.
