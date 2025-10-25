# ChatCommerce AI - Technical Architecture

**Version**: 1.0
**Last Updated**: October 2025

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [API Integrations](#api-integrations)
6. [Database Design](#database-design)
7. [AI SDK Integration](#ai-sdk-integration)
8. [Edge Runtime](#edge-runtime)
9. [Caching Strategy](#caching-strategy)
10. [Security Considerations](#security-considerations)
11. [Performance Optimizations](#performance-optimizations)
12. [Deployment Architecture](#deployment-architecture)

---

## System Overview

ChatCommerce AI is a serverless, edge-optimized conversational commerce platform built on Next.js 14 with the App Router. The system uses AI-powered tools to search the web, extract product information, and deliver structured responses through a streaming chat interface.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Next.js React Components (Browser)                      │   │
│  │  - Chat UI (app/page.tsx)                                │   │
│  │  - useChat() hook (Vercel AI SDK)                        │   │
│  │  - Server-Sent Events (SSE) consumer                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS/SSE
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Vercel Edge)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  API Route: /api/chat                                    │   │
│  │  - streamText() orchestrator                             │   │
│  │  - Tool routing and execution                            │   │
│  │  - Response streaming                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       BUSINESS LOGIC LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐    │
│  │  lib/web.ts  │  │lib/extract.ts│  │   lib/db.ts       │    │
│  │              │  │              │  │                   │    │
│  │ - webSearch  │  │ - extract    │  │ - Supabase       │    │
│  │ - fetchClean │  │   Products   │  │   client         │    │
│  │ - Cache      │  │              │  │                   │    │
│  └──────────────┘  └──────────────┘  └───────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES LAYER                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │  Tavily API │  │  Jina Reader │  │   OpenAI API       │    │
│  │             │  │              │  │                    │    │
│  │  Web Search │  │  Content     │  │  GPT-4o-mini       │    │
│  │             │  │  Extraction  │  │  Product Parsing   │    │
│  └─────────────┘  └──────────────┘  └────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Supabase (Postgres)                        │    │
│  │  - queries table                                        │    │
│  │  - products table                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture Principles

### 1. Serverless-First

- No server management
- Automatic scaling
- Pay-per-execution model
- Zero idle costs

### 2. Edge-Optimized

- Vercel Edge Functions for low latency
- Global CDN distribution
- Streaming responses for better UX
- Minimal cold start times

### 3. Tool-Based AI Architecture

- Modular tool design (searchWeb, fetchPage, extractProducts)
- AI decides when and how to use tools
- Easy to add new capabilities
- Clear separation of concerns

### 4. Real-Time Streaming

- Server-Sent Events (SSE) for response streaming
- Progressive UI updates
- Better perceived performance
- User sees results as they're generated

### 5. Defensive Programming

- Graceful error handling
- Fallback strategies
- Timeout protection
- Input validation

---

## Component Architecture

### Frontend Components

#### 1. Chat Interface (`app/page.tsx`)

```
ChatPage Component
├── useChat() Hook
│   ├── messages state
│   ├── input state
│   ├── isLoading state
│   └── handleSubmit()
├── Message List
│   ├── User messages (right-aligned, blue)
│   ├── Assistant messages (left-aligned, white)
│   └── Auto-scroll behavior
└── Input Form
    ├── Text input
    └── Submit button
```

**Responsibilities**:

- Render chat interface
- Manage message state
- Handle user input
- Display streaming responses
- Auto-scroll to new messages

**Key Features**:

- Real-time streaming via SSE
- Markdown rendering (links, bold)
- Loading indicators
- Error display
- Suggested queries

---

### Backend Components

#### 2. API Route (`app/api/chat/route.ts`)

```
POST /api/chat
├── Request Validation
├── streamText() Setup
│   ├── Model: GPT-4o-mini
│   ├── System Prompt
│   ├── Messages History
│   └── Tools Configuration
├── Tool Execution
│   ├── searchWeb
│   ├── fetchPage
│   └── extractProducts
└── Response Streaming
    └── onFinish Hook
```

**Responsibilities**:

- Receive chat messages
- Orchestrate AI tools
- Stream responses
- Log queries and results
- Error handling

**Configuration**:

- Runtime: Edge
- Model: gpt-4o-mini
- Temperature: 0.7 (default)
- Max tokens: Auto

---

#### 3. Web Search Module (`lib/web.ts`)

```
web.ts
├── webSearch()
│   ├── Cache check
│   ├── Tavily API call
│   ├── Result mapping
│   └── Cache storage
├── fetchClean()
│   ├── Cache check
│   ├── Jina Reader proxy
│   ├── Content truncation
│   └── Cache storage
└── Cache Management
    ├── In-memory Map
    ├── TTL checking
    └── Size limiting
```

**Responsibilities**:

- Search web via Tavily
- Fetch clean page content via Jina
- Cache results for performance
- Handle API failures gracefully

---

#### 4. Product Extraction Module (`lib/extract.ts`)

```
extract.ts
└── extractProducts()
    ├── Input validation
    ├── Prompt construction
    ├── OpenAI API call
    ├── JSON parsing
    ├── Data validation
    └── Type mapping
```

**Responsibilities**:

- Extract products from raw text
- Parse LLM JSON output
- Validate product data
- Return typed Product array

---

#### 5. Database Module (`lib/db.ts`)

```
db.ts
├── Supabase Client
│   ├── URL configuration
│   ├── Anon key auth
│   └── No session persistence
└── Type Definitions
    ├── Query type
    └── Product type
```

**Responsibilities**:

- Initialize Supabase client
- Provide database access
- Define database types
- Environment validation

---

## Data Flow

### Complete Request Flow

```
User Input → Client → API → AI → Tools → External APIs → Response

Step-by-step:

1. USER TYPES MESSAGE
   Input: "Find me waterproof backpacks under $200"
   ↓
2. CLIENT (useChat hook)
   POST /api/chat
   Body: { messages: [{ role: "user", content: "..." }] }
   ↓
3. API ROUTE
   Receives request, starts streamText()
   ↓
4. AI MODEL (GPT-4o-mini)
   Analyzes intent, decides to use searchWeb tool
   ↓
5. TOOL: searchWeb
   Query: "waterproof backpacks under $200"
   ↓
6. TAVILY API
   Returns: [{ title, url, snippet }, ...]
   ↓
7. AI MODEL
   Decides to fetch content from top URLs
   ↓
8. TOOL: fetchPage
   URL: "https://example.com/backpacks"
   ↓
9. JINA READER
   Returns: Clean text content (12k chars)
   ↓
10. TOOL: extractProducts
    Input: Raw text
    ↓
11. OPENAI API (GPT-4o-mini)
    Returns: [{ name, price, url, image }, ...]
    ↓
12. DATABASE INSERT
    Store products in Supabase
    ↓
13. AI MODEL
    Generates natural language response with products
    ↓
14. RESPONSE STREAM
    Streams tokens to client via SSE
    ↓
15. CLIENT RENDERS
    Updates UI progressively as tokens arrive
    ↓
16. DATABASE LOG
    onFinish: Store query and results
```

---

### Data Structures at Each Layer

#### Layer 1: Client Message

```typescript
{
  id: "msg_abc123",
  role: "user",
  content: "Find me waterproof backpacks under $200",
  createdAt: Date
}
```

#### Layer 2: API Request

```typescript
{
  messages: [
    {
      role: "user",
      content: "Find me waterproof backpacks under $200",
    },
  ];
}
```

#### Layer 3: Tool Invocation (searchWeb)

```typescript
{
  tool: "searchWeb",
  parameters: {
    query: "waterproof backpacks under $200",
    maxResults: 5
  }
}
```

#### Layer 4: Tavily Response

```typescript
{
  results: [
    {
      title: "Best Waterproof Backpacks 2025",
      url: "https://outdoorgear.com/backpacks",
      snippet: "Top rated waterproof backpacks starting at $149...",
      score: 0.95,
    },
    // ... more results
  ];
}
```

#### Layer 5: Tool Invocation (fetchPage)

```typescript
{
  tool: "fetchPage",
  parameters: {
    url: "https://outdoorgear.com/backpacks"
  }
}
```

#### Layer 6: Jina Reader Response

```typescript
{
  content: "OutdoorGear.com\n\nWaterproof Backpack Collection\n\n1. Trail Pro Backpack\nPrice: $189.99\n40L capacity, fully waterproof...\n\n2. Adventure Pack\nPrice: $175.00\n...";
}
```

#### Layer 7: Tool Invocation (extractProducts)

```typescript
{
  tool: "extractProducts",
  parameters: {
    rawText: "OutdoorGear.com\n\nWaterproof Backpack Collection\n\n1. Trail Pro..."
  }
}
```

#### Layer 8: OpenAI Extraction Response

```typescript
[
  {
    name: "Trail Pro Waterproof Backpack",
    price: 189.99,
    url: "https://outdoorgear.com/trail-pro",
    image: "https://cdn.outdoorgear.com/trail-pro.jpg",
    sku: "TP-40L-001",
    source: "outdoorgear.com",
  },
  {
    name: "Adventure Pack 45L",
    price: 175.0,
    url: "https://outdoorgear.com/adventure-pack",
    image: "https://cdn.outdoorgear.com/adventure.jpg",
    sku: "AP-45L-002",
    source: "outdoorgear.com",
  },
];
```

#### Layer 9: Database Storage (products)

```sql
INSERT INTO products (name, price, url, image, sku, source)
VALUES
  ('Trail Pro Waterproof Backpack', 189.99, 'https://...', 'https://...', 'TP-40L-001', 'outdoorgear.com'),
  ('Adventure Pack 45L', 175.00, 'https://...', 'https://...', 'AP-45L-002', 'outdoorgear.com');
```

#### Layer 10: AI Response (Streamed)

```
"I found 3 great waterproof backpacks under $200 for you:

1. **Trail Pro Waterproof Backpack** - $189.99
   40L capacity with fully sealed seams
   [View Product →](https://outdoorgear.com/trail-pro)

2. **Adventure Pack 45L** - $175.00
   Perfect for multi-day hiking
   [View Product →](https://outdoorgear.com/adventure-pack)

3. **Storm Defender Backpack** - $159.99
   Lightweight and durable
   [View Product →](https://outdoorgear.com/storm)"
```

#### Layer 11: Database Log (queries)

```sql
INSERT INTO queries (query, results, latency_ms)
VALUES (
  'Find me waterproof backpacks under $200',
  '[{...}, {...}, {...}]'::jsonb,
  4520
);
```

---
