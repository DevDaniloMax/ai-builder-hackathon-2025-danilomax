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
