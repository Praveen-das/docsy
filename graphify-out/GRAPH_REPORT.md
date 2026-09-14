# Graph Report - docsy  (2026-09-08)

## Corpus Check
- 104 files · ~56,570 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 227 nodes · 319 edges · 53 communities
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 66 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App Pages & View Composition
- API Route Handlers
- Redis Caching & Status Pipeline
- RAG Core, Gemini & Document Processing
- Conversation & Document Management
- Cloud Storage & Supabase Client
- User Service & Profile Persistence
- Document Upload Modal & Workflow
- Pinecone Vector Database Service
- Conversation List & Selection

## God Nodes (most connected - your core abstractions)
1. `POST()` - 27 edges
2. `GET()` - 18 edges
3. `invalidateCache()` - 15 edges
4. `setCached()` - 9 edges
5. `getStorageClient()` - 8 edges
6. `getBucket()` - 8 edges
7. `deleteDocument()` - 8 edges
8. `executeRAG()` - 7 edges
9. `getRedisClient()` - 6 edges
10. `getConversation()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `getDocumentStatusesPipeline()` --calls--> `GET()`  [INFERRED]
  src/lib/cache.ts → app/api/webhooks/supabase/storage/route.ts
- `GET()` --calls--> `getDocument()`  [INFERRED]
  app/api/webhooks/supabase/storage/route.ts → src/services/document.service.ts
- `GET()` --calls--> `listDocuments()`  [INFERRED]
  app/api/webhooks/supabase/storage/route.ts → src/services/document.service.ts
- `GET()` --calls--> `getUserProfile()`  [INFERRED]
  app/api/webhooks/supabase/storage/route.ts → src/services/user.service.ts
- `POST()` --calls--> `createConversation()`  [INFERRED]
  app/api/webhooks/supabase/storage/route.ts → src/services/conversation.service.ts

## Import Cycles
- None detected.

## Communities (53 total, 0 thin omitted)

### Community 0 - "App Pages & View Composition"
Cohesion: 0.07
Nodes (3): handleDelete(), handleForceCheck(), handleReprocess()

### Community 1 - "API Route Handlers"
Cohesion: 0.12
Nodes (11): fetchEnrichedConversations(), getConversation(), getConversationDocumentIds(), getMessages(), listConversations(), persistMessage(), getDocumentStatuses(), log() (+3 more)

### Community 2 - "Redis Caching & Status Pipeline"
Cohesion: 0.19
Nodes (20): getCached(), getDocumentStatusesPipeline(), getDocumentStatusKey(), getRedisClient(), invalidateCache(), invalidateDocumentStatus(), setCached(), setDocumentStatus() (+12 more)

### Community 3 - "RAG Core, Gemini & Document Processing"
Cohesion: 0.18
Nodes (8): getDocumentById(), embedDocuments(), embedQuery(), getGoogleClient(), optimizedGoogleModel(), buildContextBlock(), buildPromptMessages(), executeRAG()

### Community 4 - "Conversation & Document Management"
Cohesion: 0.18
Nodes (6): handleSaveRename(), deleteConversation(), renameConversation(), DELETE(), PATCH(), deleteUser()

### Community 5 - "Cloud Storage & Supabase Client"
Cohesion: 0.53
Nodes (9): createSignedUploadUrl(), deletePdf(), downloadPdf(), getBucket(), getPublicUrl(), getSignedPdfUrl(), getStorageClient(), uploadPdf() (+1 more)

### Community 7 - "User Service & Profile Persistence"
Cohesion: 0.39
Nodes (7): createUser(), ensureUser(), getUserById(), getUserProfile(), incrementQueryCount(), updateUser(), upsertUser()

### Community 8 - "Document Upload Modal & Workflow"
Cohesion: 0.48
Nodes (6): handleClose(), handleDrop(), handleFileChange(), handleStartUpload(), resetState(), validateAndSetFile()

### Community 9 - "Pinecone Vector Database Service"
Cohesion: 0.73
Nodes (5): deleteDocumentVectors(), getIndexName(), getPineconeClient(), queryVectors(), upsertVectors()

### Community 11 - "Conversation List & Selection"
Cohesion: 0.40
Nodes (3): handleCreate(), createConversation(), handleCreateNewConversation()

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `POST()` connect `API Route Handlers` to `Redis Caching & Status Pipeline`, `RAG Core, Gemini & Document Processing`, `Conversation & Document Management`, `Cloud Storage & Supabase Client`, `User Service & Profile Persistence`, `Conversation List & Selection`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Why does `deleteDocument()` connect `Redis Caching & Status Pipeline` to `App Pages & View Composition`, `Pinecone Vector Database Service`, `Conversation & Document Management`, `Cloud Storage & Supabase Client`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `handleDelete()` connect `App Pages & View Composition` to `Redis Caching & Status Pipeline`, `Conversation & Document Management`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Are the 17 inferred relationships involving `POST()` (e.g. with `createConversation()` and `getConversation()`) actually correct?**
  _`POST()` has 17 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `GET()` (e.g. with `getDocumentStatusesPipeline()` and `getConversation()`) actually correct?**
  _`GET()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `invalidateCache()` (e.g. with `createConversation()` and `deleteConversation()`) actually correct?**
  _`invalidateCache()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `setCached()` (e.g. with `getConversation()` and `getMessages()`) actually correct?**
  _`setCached()` has 6 INFERRED edges - model-reasoned connections that need verification._