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

## API Integrations

### 1. Tavily API

**Purpose**: Real-time web search for product discovery

**Endpoint**: `https://api.tavily.com/search`

**Authentication**: API key in request body

**Request Format**:

```json
{
  "api_key": "tvly-xxx",
  "query": "waterproof backpacks under $200",
  "max_results": 5,
  "search_depth": "basic",
  "include_answer": false,
  "include_raw_content": false
}
```

**Response Format**:

```json
{
  "results": [
    {
      "title": "Page Title",
      "url": "https://...",
      "snippet": "Brief excerpt...",
      "score": 0.95
    }
  ],
  "query": "original query"
}
```

**Rate Limits**:

- Free tier: 1,000 requests/month
- Response time: ~500-2000ms

**Error Handling**:

- 429: Rate limit exceeded → return empty array
- 401: Invalid API key → log error, return empty array
- Timeout: 10s → abort and return empty array

---

### 2. Jina Reader API

**Purpose**: Extract clean, readable text from web pages

**Endpoint**: `https://r.jina.ai/{url}`

**Authentication**: None (public service)

**Request Format**:

```
GET https://r.jina.ai/outdoorgear.com/backpacks
Headers:
  User-Agent: Mozilla/5.0 (compatible; ChatCommerceBot/1.0)
  Accept: text/plain
```

**Response Format**:

```
Plain text content of the page, stripped of:
- HTML tags
- JavaScript
- CSS
- Navigation elements
- Ads
```

**Rate Limits**:

- Unknown (public service)
- Response time: ~1000-3000ms

**Error Handling**:

- 403: Blocked by site → return empty string
- 404: Page not found → return empty string
- Timeout: 10s → return empty string
- Empty response → return empty string

**Optimization**:

- Truncate to 12,000 characters
- Cache results for 24 hours

---

### 3. OpenAI API

**Purpose**: AI model for intent understanding and product extraction

**Endpoints Used**:

1. `/v1/chat/completions` (via AI SDK)

**Authentication**: Bearer token

**Model**: gpt-4o-mini

**Use Cases**:

#### A. Chat Orchestration (via AI SDK)

- Handled by AI SDK automatically
- Tool calling enabled
- Streaming responses

#### B. Product Extraction

**Request Format**:

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "You are a JSON-only product extractor..."
    },
    {
      "role": "user",
      "content": "Extract products from: [raw text]"
    }
  ],
  "temperature": 0.3,
  "max_tokens": 1000
}
```

**Response Format**:

```json
{
  "choices": [
    {
      "message": {
        "content": "[{\"name\":\"...\",\"price\":...}]"
      }
    }
  ]
}
```

**Rate Limits**:

- Tier 1: 3 RPM, 200 RPD
- Tier 2+: Higher limits
- Response time: ~1000-4000ms

**Error Handling**:

- 429: Rate limit → retry with exponential backoff
- 401: Invalid API key → log error, return empty array
- Timeout: 30s → return empty array
- Parse error → return empty array

---

### 4. Supabase API

**Purpose**: Database for storing queries and products

**Endpoints**: REST API (auto-generated)

**Authentication**: Anon key (Row Level Security optional)

**Tables**:

#### A. queries

```sql
POST /rest/v1/queries
Body: {
  query: string,
  results: jsonb,
  latency_ms: number
}
```

#### B. products

```sql
POST /rest/v1/products
Body: {
  name: string,
  price: number,
  url: string,
  image: string,
  sku: string,
  source: string
}
```

**Rate Limits**:

- Free tier: 50,000 monthly active users
- Connection pooling: Up to 15 connections

**Error Handling**:

- Connection error → log but don't fail request
- Insert error → log but continue
- Non-blocking (queueMicrotask)

---

## Database Design

### Schema Diagram

```
┌─────────────────────────────────────────┐
│             queries                      │
├─────────────────────────────────────────┤
│ id (UUID, PK)                           │
│ user_id (UUID, nullable)                │
│ query (TEXT, NOT NULL)                  │
│ results (JSONB, nullable)               │
│ latency_ms (INTEGER, nullable)          │
│ error (TEXT, nullable)                  │
│ created_at (TIMESTAMPTZ, default NOW()) │
└─────────────────────────────────────────┘
                 │
                 │ 1:N (logical)
                 ▼
┌─────────────────────────────────────────┐
│            products                      │
├─────────────────────────────────────────┤
│ id (UUID, PK)                           │
│ sku (TEXT, nullable)                    │
│ name (TEXT, NOT NULL)                   │
│ price (NUMERIC, nullable)               │
│ url (TEXT, nullable)                    │
│ image (TEXT, nullable)                  │
│ source (TEXT, nullable)                 │
│ created_at (TIMESTAMPTZ, default NOW()) │
└─────────────────────────────────────────┘
```

### Indexes

**queries table**:

- `idx_queries_created_at` on `created_at DESC`
  - Purpose: Fast retrieval of recent queries
  - Use case: Analytics, debugging
- `idx_queries_user_id` on `user_id` (partial: WHERE user_id IS NOT NULL)
  - Purpose: User-specific query history
  - Use case: Future personalization feature

**products table**:

- `idx_products_source` on `source`
  - Purpose: Group products by retailer
  - Use case: Analytics by source
- `idx_products_price` on `price` (partial: WHERE price IS NOT NULL)
  - Purpose: Price-based queries
  - Use case: Price analytics
- `idx_products_created_at` on `created_at DESC`
  - Purpose: Recently discovered products
  - Use case: Trending products

### Query Patterns

#### 1. Log New Query

```sql
INSERT INTO queries (query, results, latency_ms)
VALUES ($1, $2::jsonb, $3)
RETURNING id;
```

**Frequency**: Every chat request
**Expected Performance**: < 50ms

#### 2. Store Products

```sql
INSERT INTO products (name, price, url, image, sku, source)
VALUES ($1, $2, $3, $4, $5, $6);
```

**Frequency**: When products extracted
**Expected Performance**: < 100ms (bulk insert)

#### 3. Analytics - Recent Queries

```sql
SELECT
  query,
  jsonb_array_length(results) as product_count,
  latency_ms,
  created_at
FROM queries
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 100;
```

**Frequency**: Dashboard views
**Expected Performance**: < 200ms

#### 4. Analytics - Popular Products

```sql
SELECT
  source,
  COUNT(*) as product_count,
  AVG(price) as avg_price
FROM products
WHERE created_at > NOW() - INTERVAL '7 days'
  AND price IS NOT NULL
GROUP BY source
ORDER BY product_count DESC
LIMIT 10;
```

**Frequency**: Weekly reports
**Expected Performance**: < 500ms

---

## AI SDK Integration

### streamText Architecture

```
streamText() Call
├── Configuration
│   ├── model: openai("gpt-4o-mini")
│   ├── messages: [...history]
│   ├── system: "You are..."
│   └── tools: { searchWeb, fetchPage, extractProducts }
├── Execution Flow
│   ├── 1. AI analyzes user intent
│   ├── 2. AI decides to call tool(s)
│   ├── 3. Tool execution (async)
│   ├── 4. Results returned to AI
│   ├── 5. AI generates response
│   └── 6. Response streamed to client
└── Callbacks
    ├── onFinish: Database logging
    └── onError: Error handling
```

### Tool Calling Mechanism

**How AI SDK Tools Work**:

1. **Tool Registration**:

```typescript
tools: {
  searchWeb: tool({
    description: "Search the web...",
    parameters: z.object({
      query: z.string(),
      maxResults: z.number().optional()
    }),
    execute: async ({ query, maxResults }) => {
      // Tool implementation
      return { success: true, results: [...] };
    }
  })
}
```

2. **AI Decision Process**:

- AI reads tool descriptions
- Analyzes user intent
- Decides which tool(s) to call
- Generates parameters for tools

3. **Tool Execution**:

- AI SDK intercepts tool call
- Validates parameters (Zod schema)
- Executes function
- Returns results to AI

4. **AI Response Generation**:

- AI receives tool results
- May call more tools if needed
- Generates natural language response
- Response is streamed to client

### Streaming Protocol

**Server-Sent Events (SSE)**:

```
Client Request → Server Process → Stream Response

Format:
0:"metadata"
1:"token"
1:" by"
1:" token"
2:{"toolCall":"searchWeb","args":{...}}
3:{"toolResult":{...}}
1:" based"
1:" on"
1:" results"
```

**Stream Event Types**:

- `0`: Metadata (request ID, etc.)
- `1`: Text token
- `2`: Tool call started
- `3`: Tool result
- `error`: Error occurred
- `done`: Stream complete

---

## Edge Runtime

### What is Edge Runtime?

Vercel Edge Runtime is a lightweight JavaScript runtime that runs closer to users geographically.

**Key Differences from Node.js**:

- No access to Node.js APIs (fs, path, etc.)
- No native modules
- Smaller bundle size limits
- Lower cold start times
- Better global distribution

### Why Edge for ChatCommerce AI?

1. **Lower Latency**:

   - Requests handled at nearest edge location
   - ~50-100ms faster than serverless functions

2. **Better Streaming**:

   - Optimized for SSE/streaming responses
   - No buffering delays

3. **Cost Efficiency**:
   - Faster execution = lower costs
   - Better scalability

### Configuration

```typescript
// app/api/chat/route.ts
export const runtime = "edge";
```

### Limitations and Workarounds

**Limitation**: No Node.js `fs` module
**Workaround**: Not needed (serverless architecture)

**Limitation**: Some npm packages incompatible
**Workaround**: Use edge-compatible alternatives or remove runtime config

**Limitation**: 10s timeout (Hobby plan)
**Workaround**: Optimize tool execution, implement caching

---

## Caching Strategy

### In-Memory Cache

**Implementation**:

```typescript
const CACHE = new Map<string, CacheEntry>();

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};
```

### Cache Layers

```
┌────────────────────────────────────────┐
│  Cache Layer 1: Tavily Search Results  │
│  TTL: 1 hour                           │
│  Key: `tavily:${query}:${maxResults}`  │
│  Hit Rate Target: 60%                  │
└────────────────────────────────────────┘
                  ↓
┌────────────────────────────────────────┐
│  Cache Layer 2: Jina Page Content      │
│  TTL: 24 hours                         │
│  Key: `jina:${url}`                    │
│  Hit Rate Target: 80%                  │
└────────────────────────────────────────┘
```

### Cache Invalidation

**Time-based (TTL)**:

- Search results: 1 hour (products change frequently)
- Page content: 24 hours (more stable)

**Size-based**:

```typescript
const MAX_CACHE_SIZE = 100;

if (CACHE.size >= MAX_CACHE_SIZE) {
  // Evict oldest entry (FIFO)
  const firstKey = CACHE.keys().next().value;
  CACHE.delete(firstKey);
}
```

### Performance Impact

**Without Cache**:

- Search query: ~4500ms
- Breakdown:
  - Tavily: 1500ms
  - Jina: 2000ms
  - OpenAI: 1000ms

**With Cache (hit)**:

- Search query: ~1200ms
- Breakdown:
  - Tavily: 2ms (cached)
  - Jina: 2ms (cached)
  - OpenAI: 1000ms (not cached)
  - Improvement: ~73% faster

### Future: Distributed Cache

For production at scale, consider:

- **Redis** (Upstash for edge compatibility)
- **Vercel KV** (native edge KV store)
- **Cloudflare KV**

Benefits:

- Shared across all edge locations
- Persistent across deployments
- Higher hit rates

---

## Security Considerations

### 1. API Key Protection

**Problem**: API keys must not be exposed to client

**Solution**:

```typescript
// ✅ CORRECT: Server-side only
process.env.OPENAI_API_KEY; // Only accessible in API routes

// ❌ WRONG: Client-exposed
process.env.NEXT_PUBLIC_OPENAI_KEY; // Visible in browser
```

**Implementation**:

- All API keys in server-side env vars
- No `NEXT_PUBLIC_` prefix for sensitive keys
- Keys never sent to client

### 2. Input Validation

**Problem**: Users can send malicious input

**Solution**:

```typescript
// Zod validation for tool parameters
parameters: z.object({
  query: z.string().max(500), // Limit length
  maxResults: z.number().min(1).max(10), // Bounded range
});
```

**Protection Against**:

- SQL injection (using parameterized queries)
- XSS (React escapes by default)
- Prompt injection (limited by model safeguards)

### 3. Rate Limiting

**Problem**: Abuse can exhaust API quotas

**Solution**:

```typescript
// Simple IP-based rate limiting
if (!rateLimit(ip, 10, 60000)) {
  // 10 req/min
  return new Response("Rate limit exceeded", { status: 429 });
}
```

**Future Improvements**:

- User-based limiting (after auth)
- Token bucket algorithm
- Redis-backed distributed limiting

### 4. Data Privacy

**Current State**: No personal data collected

- No user authentication
- No cookies (beyond Next.js essentials)
- Anonymous query logging

**Future** (with auth):

- Implement Row Level Security (RLS) in Supabase
- Encrypt sensitive user data
- GDPR compliance (data export/deletion)

### 5. Content Security

**Problem**: Extracted content may contain malicious code

**Solution**:

- React automatically escapes HTML
- Product URLs are not auto-navigated
- External links have `rel="noopener noreferrer"`

### 6. API Abuse Prevention

**Measures**:

1. Environment validation (keys exist)
2. Timeout protection (10s for external APIs)
3. Error handling (don't leak internal errors)
4. Logging (monitor for abuse patterns)

---

## Performance Optimizations

### 1. Response Time Breakdown

**Target**: ≤ 5 seconds total

```
Total: 4520ms
├── Tavily API:        1500ms (33%)
├── Jina Reader:       2000ms (44%)
├── OpenAI Extract:    1000ms (22%)
└── Database:            20ms (0.4%)
```

### 2. Optimization Strategies

#### A. Parallel API Calls

**Before** (sequential):

```typescript
const search = await webSearch(query);      // 1500ms
const content = await fetchClean(url);      // 2000ms
Total: 3500ms
```

**After** (parallel):

```typescript
const [search, content] = await Promise.all([
  webSearch(query),      // 1500ms
  fetchClean(url)        // 2000ms
]);
Total: 2000ms (max of both)
```

#### B. Content Truncation

```typescript
// Limit to 12k characters
const trimmed = text.slice(0, 12000);
```

**Impact**:

- Reduces OpenAI token usage
- Faster processing
- Lower costs

#### C. Aggressive Caching

```typescript
// Cache search results (1 hour)
// Cache page content (24 hours)
```

**Impact**:

- 73% faster on cache hits
- Reduced API costs
- Better rate limit management

#### D. Streaming Responses

```typescript
// Start streaming before all tools complete
return streamText({ ... });
```

**Impact**:

- Better perceived performance
- User sees progress immediately
- Lower time-to-first-token

### 3. Database Optimization

#### A. Non-Blocking Inserts

```typescript
queueMicrotask(async () => {
  await supabase.from("products").insert(products);
});
```

**Impact**:

- Doesn't slow down response
- User gets results faster

#### B. Batch Inserts

```typescript
// Insert all products at once
await supabase.from("products").insert(products); // Array
```

**Impact**:

- Single round-trip vs multiple
- Faster than individual inserts

### 4. Bundle Size Optimization

**Next.js Automatic**:

- Code splitting
- Tree shaking
- Minification

**Manual**:

```typescript
// Use dynamic imports for heavy components
const HeavyComponent = dynamic(() => import("./Heavy"));
```

### 5. Edge Runtime Benefits

**Cold Start**:

- Node.js: ~500-1000ms
- Edge: ~50-100ms
- **10x faster cold starts**

**Geographic Distribution**:

- User in São Paulo → edge in São Paulo
- User in Tokyo → edge in Tokyo
- **Lower latency everywhere**

---

## Deployment Architecture

### Vercel Platform Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Global Network                 │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Edge: US-E  │  │ Edge: EU-W  │  │ Edge: AP-SE │    │
│  │             │  │             │  │             │    │
│  │ /api/chat   │  │ /api/chat   │  │ /api/chat   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │                 │                 │           │
│         └─────────────────┴─────────────────┘           │
│                          │                               │
└──────────────────────────┼───────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Static Assets (CDN)                    │
│  - Next.js pages (HTML, CSS, JS)                        │
│  - Public files                                          │
│  - Build artifacts                                       │
└─────────────────────────────────────────────────────────┘
```

### Deployment Process

```
git push → GitHub → Vercel Build → Deploy to Edge

1. Code Push
   Developer pushes to GitHub
   ↓
2. Webhook
   Vercel notified of new commit
   ↓
3. Build
   - npm install
   - npm run build
   - Next.js compilation
   ↓
4. Deploy
   - Static assets → CDN
   - API routes → Edge functions
   - Environment vars injected
   ↓
5. Activate
   - DNS updates
   - Traffic switched to new version
   - Zero downtime
```

### Environment Management

```
Development    → .env.local (not committed)
Preview        → Vercel Dashboard (branch deploys)
Production     → Vercel Dashboard (main branch)
```

**Best Practices**:

- Use different API keys per environment
- Test in preview deployments first
- Monitor production logs
- Set up alerts for errors

### Monitoring and Observability

**Built-in Vercel Analytics**:

- Request count
- Error rate
- Response time
- Geographic distribution

**Logging**:

```typescript
console.log("[INFO] ..."); // Show in Vercel logs
console.error("[ERROR] ..."); // Trigger alerts
```

**Custom Metrics**:

```typescript
// Log to Supabase for custom analytics
await supabase.from("queries").insert({
  query,
  latency_ms,
  created_at: new Date(),
});
```

### Scaling Considerations

**Automatic Scaling**:

- Vercel handles automatically
- No configuration needed
- Scales to zero when idle

**Limits (Hobby Plan)**:

- 100 GB bandwidth/month
- 100 hours function execution/month
- 10s function timeout
- 1,000 edge requests/day

**When to Upgrade**:

- Consistent >1000 requests/day
- Need longer timeouts
- Need team collaboration
- Need advanced analytics

---
