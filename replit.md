# ChatCommerce AI

## Overview

ChatCommerce AI is a conversational shopping assistant that enables users to discover and explore products through natural language interactions. The application combines AI-powered chat capabilities with real-time web search to provide an intuitive shopping experience. Users can describe what they're looking for in plain language, and the system searches the web, extracts product information, and presents relevant options in a clean, visual format.

The system demonstrates the emerging paradigm of conversational commerce, where complex e-commerce interfaces are replaced with natural chat interactions guided by an intelligent virtual shopping assistant.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**UI Component Strategy**: The application uses shadcn/ui components (Radix UI primitives) with a "new-york" style variant, providing a modern, accessible component library. The design system emphasizes minimalism inspired by Linear, ChatGPT/Claude conversational UI patterns, and professional e-commerce platforms.

**Styling Approach**: Tailwind CSS with CSS variables for theming, supporting both light and dark modes. Custom design tokens are defined for colors, spacing, and typography. The typography system uses Inter for interface elements and JetBrains Mono for monospaced content like prices and SKUs.

**State Management**: TanStack Query (React Query) for server state management with custom query client configuration. The chat interface uses Vercel AI SDK's `useChat` hook for streaming AI responses.

**Routing**: Wouter for lightweight client-side routing, with a simple single-page chat interface as the primary view.

**Layout Strategy**: Maximum width containers (max-w-4xl for chat, max-w-7xl for headers), responsive grid layouts for product displays (1 column mobile, 2 columns tablet, 3 columns desktop), and a fixed bottom input bar with scrollable message area.

**Product Display**: ProductCarousel component with embla-carousel-react displays products in a visual carousel format. Each product card shows:
- Product image (aspect-square) with lazy loading, or fallback placeholder (Package icon + "Produto" text) if image fails to load
- Product name, price, and marketplace site
- Medal emoji (🥇🥈🥉) for cost-benefit ranking
- Direct link button to the specific product page
- Navigation via arrow buttons and position indicators
- Smooth fade-in animation when carousel is ready
- Image error state resets when new products arrive to ensure fresh attempts

### Backend Architecture

**Server Framework**: Express.js with TypeScript running in ESM mode, handling both API routes and serving the Vite-built frontend in production.

**AI Integration**: Vercel AI SDK with OpenAI-compatible endpoints (using Replit's AI Integrations service). The system uses GPT-4o-mini for conversational interactions and tool orchestration.

**Tool-Based Architecture**: The AI uses three primary tools:
- `searchWeb`: Searches for products using Tavily API, returning URLs and snippets
- `fetchPage`: Retrieves full content from product pages to extract accurate product details
- `saveLead`: Saves customer name and phone to the leads database table

**Product Response Format**: Ana Clara returns products **EXCLUSIVELY** in a structured JSON format within code blocks:
```json
{"products":[{"name":"Product Name","price":"R$ 199","url":"https://direct-product-link","image":"https://product-image.jpg","site":"Shopee","emoji":"🥇"}]}
```
- **CRITICAL**: Products NEVER appear as text links - ALWAYS in carousel JSON format
- Even when user asks "more products" multiple times, always use carousel
- Links must be DIRECT to the specific product page (not generic search results)
- Images must be actual product photo URLs from the product page
- Price format: "R$ XX,XX" (always with space after R$)
- 2-3 products displayed per carousel

**Caching Strategy**: In-memory caching for both search results and page content to reduce external API calls and improve response times.

**Streaming Responses**: The `/api/chat` endpoint uses streaming text responses via the AI SDK, providing real-time feedback to users as the AI processes their queries.

**Error Handling**: Comprehensive error handling with structured error responses and appropriate HTTP status codes.

### Data Storage

**Database**: PostgreSQL via Neon serverless database with WebSocket support for optimal connection pooling.

**ORM**: Drizzle ORM with both HTTP and WebSocket client configurations, using the neon-serverless adapter for production efficiency.

**Schema Design**:
- **leads**: Customer contact information collected during chat (id, name, phone, createdAt)
  - Ana Clara always collects name and phone BEFORE showing products
  - Saved via `saveLead` tool immediately after collection
- **products**: Extracted product catalog (id, sku, name, price, url, image, source, createdAt)
- **queries**: Search history and analytics (id, userId, query, results as JSONB, latencyMs, error, createdAt)

**Migration Strategy**: Drizzle Kit for schema migrations with PostgreSQL dialect, storing migration files in `/migrations` directory.

### External Dependencies

**AI Services**:
- Replit AI Integrations (OpenAI-compatible API) for GPT-4o-mini model access
- Vercel AI SDK (@ai-sdk/openai, @ai-sdk/react, ai) for streaming chat and tool orchestration

**Search & Web Scraping**:
- Tavily API for real-time web search functionality
- Custom page content fetching with caching layer

**Database & Storage**:
- Neon Postgres (serverless) via @neondatabase/serverless
- Drizzle ORM for type-safe database operations
- WebSocket connections for optimal performance

**UI Components & Styling**:
- Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling
- shadcn/ui component collection (new-york variant)
- Lucide React for icons

**Development Tools**:
- TypeScript for type safety across frontend and backend
- Vite for fast development and optimized production builds
- tsx for TypeScript execution in development
- esbuild for server-side bundling

**Validation & Forms**:
- Zod for runtime schema validation
- React Hook Form with @hookform/resolvers for form management
- drizzle-zod for generating Zod schemas from Drizzle tables

**Design System**:
- Google Fonts: Inter (interface), JetBrains Mono (monospace)
- class-variance-authority for component variant management
- tailwind-merge and clsx for className composition