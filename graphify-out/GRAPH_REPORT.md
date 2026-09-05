# Graph Report - .  (2026-09-04)

## Corpus Check
- Corpus is ~36,161 words - fits in a single context window. You may not need a graph.

## Summary
- 209 nodes · 207 edges · 74 communities detected
- Extraction: 75% EXTRACTED · 25% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.82)
- Token cost: 1,200 input · 450 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Conversation API & User Routing|Conversation API & User Routing]]
- [[_COMMUNITY_RAG & Embedding Pipeline|RAG & Embedding Pipeline]]
- [[_COMMUNITY_Document Lifecycle & Reprocessing|Document Lifecycle & Reprocessing]]
- [[_COMMUNITY_Architecture & Specification Model|Architecture & Specification Model]]
- [[_COMMUNITY_Document Upload Interface|Document Upload Interface]]
- [[_COMMUNITY_Conversation Renaming Workflow|Conversation Renaming Workflow]]
- [[_COMMUNITY_Supabase Object Storage Service|Supabase Object Storage Service]]
- [[_COMMUNITY_Conversation Creation & Selection|Conversation Creation & Selection]]
- [[_COMMUNITY_Pinecone Vector Indexing|Pinecone Vector Indexing]]
- [[_COMMUNITY_Chat Header Actions|Chat Header Actions]]
- [[_COMMUNITY_UI Badge Components|UI Badge Components]]
- [[_COMMUNITY_Date & Time Formatting|Date & Time Formatting]]
- [[_COMMUNITY_Landing Page & Citation Handling|Landing Page & Citation Handling]]
- [[_COMMUNITY_Root Application Layout|Root Application Layout]]
- [[_COMMUNITY_Chat Redirect Handler|Chat Redirect Handler]]
- [[_COMMUNITY_Conversation ID Redirect Handler|Conversation ID Redirect Handler]]
- [[_COMMUNITY_Settings Page & Config|Settings Page & Config]]
- [[_COMMUNITY_Theme Provider Setup|Theme Provider Setup]]
- [[_COMMUNITY_Main Shell App Layout|Main Shell App Layout]]
- [[_COMMUNITY_Top Navigation Header|Top Navigation Header]]
- [[_COMMUNITY_Main Navigation Sidebar|Main Navigation Sidebar]]
- [[_COMMUNITY_Dialog UI Component|Dialog UI Component]]
- [[_COMMUNITY_Progress UI Component|Progress UI Component]]
- [[_COMMUNITY_Chat View Interface|Chat View Interface]]
- [[_COMMUNITY_Citation Pill Component|Citation Pill Component]]
- [[_COMMUNITY_Chat Input Composer|Chat Input Composer]]
- [[_COMMUNITY_Chat Message Item|Chat Message Item]]
- [[_COMMUNITY_Citation List Component|Citation List Component]]
- [[_COMMUNITY_Empty Chat State View|Empty Chat State View]]
- [[_COMMUNITY_Chat State Provider|Chat State Provider]]
- [[_COMMUNITY_Document Conversations Dialog|Document Conversations Dialog]]
- [[_COMMUNITY_Conversation Workspace Layout|Conversation Workspace Layout]]
- [[_COMMUNITY_Delete Conversation Dialog|Delete Conversation Dialog]]
- [[_COMMUNITY_Mobile Pane Switcher|Mobile Pane Switcher]]
- [[_COMMUNITY_PDF Document Viewer|PDF Document Viewer]]
- [[_COMMUNITY_PDF Page Canvas Renderer|PDF Page Canvas Renderer]]
- [[_COMMUNITY_Structured Logging Utility|Structured Logging Utility]]
- [[_COMMUNITY_CSS Utility Helpers|CSS Utility Helpers]]
- [[_COMMUNITY_UI Theme Store|UI Theme Store]]
- [[_COMMUNITY_Agent Guidelines & Rules|Agent Guidelines & Rules]]
- [[_COMMUNITY_Drizzle Database Configuration|Drizzle Database Configuration]]
- [[_COMMUNITY_ESLint Configuration|ESLint Configuration]]
- [[_COMMUNITY_Authentication Middleware|Authentication Middleware]]
- [[_COMMUNITY_Next.js Environment Declarations|Next.js Environment Declarations]]
- [[_COMMUNITY_Next.js Engine Configuration|Next.js Engine Configuration]]
- [[_COMMUNITY_PostCSS Styling Setup|PostCSS Styling Setup]]
- [[_COMMUNITY_Conversation Fallback Page|Conversation Fallback Page]]
- [[_COMMUNITY_Login Entrypoint Page|Login Entrypoint Page]]
- [[_COMMUNITY_Clerk SignIn Catchall|Clerk SignIn Catchall]]
- [[_COMMUNITY_Register Entrypoint Page|Register Entrypoint Page]]
- [[_COMMUNITY_Clerk SignUp Catchall|Clerk SignUp Catchall]]
- [[_COMMUNITY_Sidebar Header Component|Sidebar Header Component]]
- [[_COMMUNITY_Sidebar Navigation Items|Sidebar Navigation Items]]
- [[_COMMUNITY_User Profile Menu|User Profile Menu]]
- [[_COMMUNITY_Button UI Component|Button UI Component]]
- [[_COMMUNITY_Application Logo Component|Application Logo Component]]
- [[_COMMUNITY_Tabs UI Component|Tabs UI Component]]
- [[_COMMUNITY_Theme Toggle Component|Theme Toggle Component]]
- [[_COMMUNITY_Conversation Documents Schema|Conversation Documents Schema]]
- [[_COMMUNITY_Conversations Relational Schema|Conversations Relational Schema]]
- [[_COMMUNITY_Documents Relational Schema|Documents Relational Schema]]
- [[_COMMUNITY_Database Schema Barrel|Database Schema Barrel]]
- [[_COMMUNITY_Messages Relational Schema|Messages Relational Schema]]
- [[_COMMUNITY_Users Relational Schema|Users Relational Schema]]
- [[_COMMUNITY_Chat Message List|Chat Message List]]
- [[_COMMUNITY_Active Document Banner|Active Document Banner]]
- [[_COMMUNITY_Conversation Sidebar Header|Conversation Sidebar Header]]
- [[_COMMUNITY_New Conversation Button|New Conversation Button]]
- [[_COMMUNITY_PDF Page Thumbnails|PDF Page Thumbnails]]
- [[_COMMUNITY_PDF Viewer Toolbar|PDF Viewer Toolbar]]
- [[_COMMUNITY_Mock Data Fixtures|Mock Data Fixtures]]
- [[_COMMUNITY_Conversation Zustand Store|Conversation Zustand Store]]
- [[_COMMUNITY_Document Zustand Store|Document Zustand Store]]
- [[_COMMUNITY_Application TypeScript Definitions|Application TypeScript Definitions]]

## God Nodes (most connected - your core abstractions)
1. `POST()` - 20 edges
2. `GET()` - 14 edges
3. `processDocument()` - 11 edges
4. `deleteDocument()` - 7 edges
5. `executeRAG()` - 7 edges
6. `reprocessDocument()` - 6 edges
7. `Docsy AI System Architecture` - 6 edges
8. `getStorageClient()` - 5 edges
9. `getBucket()` - 5 edges
10. `getConversation()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `listDocuments()`  [INFERRED]
  app\api\documents\[id]\route.ts → src\services\document.service.ts
- `POST()` --calls--> `createDocument()`  [INFERRED]
  app\api\workflows\process-document\route.ts → src\services\document.service.ts
- `GET()` --calls--> `listConversations()`  [INFERRED]
  app\api\documents\[id]\route.ts → src\services\conversation.service.ts
- `GET()` --calls--> `getDocument()`  [INFERRED]
  app\api\documents\[id]\route.ts → src\services\document.service.ts
- `POST()` --calls--> `createConversation()`  [INFERRED]
  app\api\workflows\process-document\route.ts → src\services\conversation.service.ts

## Hyperedges (group relationships)
- **RAG Document Ingestion Pipeline** — docsy_ai_prd_document_processing, docsy_ai_prd_pinecone_vector_db, docsy_ai_prd_gemini_llm, docsy_ai_prd_qstash_workflow [INFERRED 0.85]

## Communities

### Community 0 - "Conversation API & User Routing"
Cohesion: 0.16
Nodes (12): getConversation(), getConversationDocumentIds(), getMessages(), listConversations(), persistMessage(), DynamicConversationPage(), GET(), POST() (+4 more)

### Community 1 - "RAG & Embedding Pipeline"
Cohesion: 0.14
Nodes (12): chunkText(), getDocumentById(), updateDocumentMetadata(), embedDocuments(), embedQuery(), getEmbeddingsModel(), extractTextFromPdf(), extractFilePathFromUrl() (+4 more)

### Community 2 - "Document Lifecycle & Reprocessing"
Cohesion: 0.17
Nodes (11): deleteConversation(), createDocument(), deleteDocument(), extractFilePathFromUrl(), getDocument(), listDocuments(), reprocessDocument(), updateDocumentStatus() (+3 more)

### Community 3 - "Architecture & Specification Model"
Cohesion: 0.14
Nodes (13): Citations & Conversation Engine, Async Document Processing Workflow, PostgreSQL & Drizzle Persistence, Gemini AI & Embeddings, Docsy AI System Architecture, Pinecone Vector Store, Upstash QStash Orchestration, RAG Retrieval Pipeline (+5 more)

### Community 4 - "Document Upload Interface"
Cohesion: 0.39
Nodes (6): handleClose(), handleDrop(), handleFileChange(), handleStartConversation(), resetState(), validateAndSetFile()

### Community 5 - "Conversation Renaming Workflow"
Cohesion: 0.29
Nodes (3): handleSaveRename(), renameConversation(), PATCH()

### Community 6 - "Supabase Object Storage Service"
Cohesion: 0.67
Nodes (6): deletePdf(), downloadPdf(), getBucket(), getSignedPdfUrl(), getStorageClient(), uploadPdf()

### Community 7 - "Conversation Creation & Selection"
Cohesion: 0.33
Nodes (3): handleCreate(), createConversation(), handleCreateNewConversation()

### Community 8 - "Pinecone Vector Indexing"
Cohesion: 0.73
Nodes (5): deleteDocumentVectors(), getIndexName(), getPineconeClient(), queryVectors(), upsertVectors()

### Community 9 - "Chat Header Actions"
Cohesion: 0.4
Nodes (0): 

### Community 10 - "UI Badge Components"
Cohesion: 0.5
Nodes (0): 

### Community 11 - "Date & Time Formatting"
Cohesion: 0.5
Nodes (0): 

### Community 12 - "Landing Page & Citation Handling"
Cohesion: 0.67
Nodes (0): 

### Community 13 - "Root Application Layout"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Chat Redirect Handler"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Conversation ID Redirect Handler"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Settings Page & Config"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Theme Provider Setup"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Main Shell App Layout"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Top Navigation Header"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Main Navigation Sidebar"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Dialog UI Component"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Progress UI Component"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Chat View Interface"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Citation Pill Component"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Chat Input Composer"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Chat Message Item"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Citation List Component"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Empty Chat State View"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Chat State Provider"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Document Conversations Dialog"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Conversation Workspace Layout"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Delete Conversation Dialog"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Mobile Pane Switcher"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "PDF Document Viewer"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "PDF Page Canvas Renderer"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Structured Logging Utility"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "CSS Utility Helpers"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "UI Theme Store"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Agent Guidelines & Rules"
Cohesion: 1.0
Nodes (2): Next.js Agent Guidelines, Claude Agent Config

### Community 40 - "Drizzle Database Configuration"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "ESLint Configuration"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Authentication Middleware"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Next.js Environment Declarations"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Next.js Engine Configuration"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "PostCSS Styling Setup"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Conversation Fallback Page"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Login Entrypoint Page"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Clerk SignIn Catchall"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Register Entrypoint Page"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Clerk SignUp Catchall"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Sidebar Header Component"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Sidebar Navigation Items"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "User Profile Menu"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "Button UI Component"
Cohesion: 1.0
Nodes (0): 

### Community 55 - "Application Logo Component"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "Tabs UI Component"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "Theme Toggle Component"
Cohesion: 1.0
Nodes (0): 

### Community 58 - "Conversation Documents Schema"
Cohesion: 1.0
Nodes (0): 

### Community 59 - "Conversations Relational Schema"
Cohesion: 1.0
Nodes (0): 

### Community 60 - "Documents Relational Schema"
Cohesion: 1.0
Nodes (0): 

### Community 61 - "Database Schema Barrel"
Cohesion: 1.0
Nodes (0): 

### Community 62 - "Messages Relational Schema"
Cohesion: 1.0
Nodes (0): 

### Community 63 - "Users Relational Schema"
Cohesion: 1.0
Nodes (0): 

### Community 64 - "Chat Message List"
Cohesion: 1.0
Nodes (0): 

### Community 65 - "Active Document Banner"
Cohesion: 1.0
Nodes (0): 

### Community 66 - "Conversation Sidebar Header"
Cohesion: 1.0
Nodes (0): 

### Community 67 - "New Conversation Button"
Cohesion: 1.0
Nodes (0): 

### Community 68 - "PDF Page Thumbnails"
Cohesion: 1.0
Nodes (0): 

### Community 69 - "PDF Viewer Toolbar"
Cohesion: 1.0
Nodes (0): 

### Community 70 - "Mock Data Fixtures"
Cohesion: 1.0
Nodes (0): 

### Community 71 - "Conversation Zustand Store"
Cohesion: 1.0
Nodes (0): 

### Community 72 - "Document Zustand Store"
Cohesion: 1.0
Nodes (0): 

### Community 73 - "Application TypeScript Definitions"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **5 isolated node(s):** `Citations & Conversation Engine`, `Implementation Roadmap & Status`, `Next.js Agent Guidelines`, `Claude Agent Config`, `DocuChat Project Readme`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Root Application Layout`** (2 nodes): `layout.tsx`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Chat Redirect Handler`** (2 nodes): `page.tsx`, `ChatRedirectPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Conversation ID Redirect Handler`** (2 nodes): `page.tsx`, `ChatIdRedirectPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Settings Page & Config`** (2 nodes): `page.tsx`, `handleSaveConfig()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Theme Provider Setup`** (2 nodes): `theme-provider.tsx`, `ThemeProvider()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Main Shell App Layout`** (2 nodes): `AppLayout()`, `app-layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Top Navigation Header`** (2 nodes): `Header()`, `header.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Main Navigation Sidebar`** (2 nodes): `handleUploadClick()`, `sidebar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dialog UI Component`** (2 nodes): `Dialog()`, `dialog.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Progress UI Component`** (2 nodes): `Progress()`, `progress.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Chat View Interface`** (2 nodes): `ChatView()`, `chat-view.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Citation Pill Component`** (2 nodes): `CitationPill()`, `citation-pill.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Chat Input Composer`** (2 nodes): `ChatComposer()`, `chat-composer.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Chat Message Item`** (2 nodes): `handleCopy()`, `chat-message-item.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Citation List Component`** (2 nodes): `CitationList()`, `citation-list.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Empty Chat State View`** (2 nodes): `EmptyChatState()`, `empty-chat-state.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Chat State Provider`** (2 nodes): `ChatProvider()`, `chat-context.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Document Conversations Dialog`** (2 nodes): `DocumentConversationsDialog()`, `document-conversations-dialog.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Conversation Workspace Layout`** (2 nodes): `ConversationLayout()`, `conversation-layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Delete Conversation Dialog`** (2 nodes): `DeleteConversationDialog()`, `delete-conversation-dialog.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mobile Pane Switcher`** (2 nodes): `MobilePaneSwitcher()`, `mobile-pane-switcher.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PDF Document Viewer`** (2 nodes): `PdfViewer()`, `pdf-viewer.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PDF Page Canvas Renderer`** (2 nodes): `PdfPageCanvas()`, `pdf-page-canvas.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Structured Logging Utility`** (2 nodes): `log()`, `logger.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `CSS Utility Helpers`** (2 nodes): `utils.ts`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Theme Store`** (2 nodes): `ui-store.ts`, `applyTheme()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agent Guidelines & Rules`** (2 nodes): `Next.js Agent Guidelines`, `Claude Agent Config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Drizzle Database Configuration`** (1 nodes): `drizzle.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ESLint Configuration`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Authentication Middleware`** (1 nodes): `middleware.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Environment Declarations`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Engine Configuration`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PostCSS Styling Setup`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Conversation Fallback Page`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Login Entrypoint Page`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Clerk SignIn Catchall`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Register Entrypoint Page`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Clerk SignUp Catchall`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sidebar Header Component`** (1 nodes): `sidebar-header.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sidebar Navigation Items`** (1 nodes): `sidebar-navigation.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `User Profile Menu`** (1 nodes): `user-menu.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Button UI Component`** (1 nodes): `button.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Application Logo Component`** (1 nodes): `logo.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tabs UI Component`** (1 nodes): `tabs.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Theme Toggle Component`** (1 nodes): `theme-toggle.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Conversation Documents Schema`** (1 nodes): `conversation-documents.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Conversations Relational Schema`** (1 nodes): `conversations.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Documents Relational Schema`** (1 nodes): `documents.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Database Schema Barrel`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Messages Relational Schema`** (1 nodes): `messages.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Users Relational Schema`** (1 nodes): `users.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Chat Message List`** (1 nodes): `message-list.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Active Document Banner`** (1 nodes): `active-document-banner.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Conversation Sidebar Header`** (1 nodes): `conversation-sidebar-header.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `New Conversation Button`** (1 nodes): `new-conversation-button.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PDF Page Thumbnails`** (1 nodes): `pdf-thumbnails.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PDF Viewer Toolbar`** (1 nodes): `pdf-toolbar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mock Data Fixtures`** (1 nodes): `mock-data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Conversation Zustand Store`** (1 nodes): `conversation-store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Document Zustand Store`** (1 nodes): `document-store.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Application TypeScript Definitions`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `POST()` connect `Conversation API & User Routing` to `RAG & Embedding Pipeline`, `Document Lifecycle & Reprocessing`, `Architecture & Specification Model`, `Supabase Object Storage Service`, `Conversation Creation & Selection`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Why does `processDocument()` connect `RAG & Embedding Pipeline` to `Conversation API & User Routing`, `Pinecone Vector Indexing`, `Document Lifecycle & Reprocessing`, `Supabase Object Storage Service`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `executeRAG()` connect `RAG & Embedding Pipeline` to `Conversation API & User Routing`, `Pinecone Vector Indexing`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `POST()` (e.g. with `ensureUser()` and `createConversation()`) actually correct?**
  _`POST()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `GET()` (e.g. with `ensureUser()` and `getUserProfile()`) actually correct?**
  _`GET()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 9 inferred relationships involving `processDocument()` (e.g. with `POST()` and `getDocumentById()`) actually correct?**
  _`processDocument()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `deleteDocument()` (e.g. with `DELETE()` and `handleDelete()`) actually correct?**
  _`deleteDocument()` has 4 INFERRED edges - model-reasoned connections that need verification._