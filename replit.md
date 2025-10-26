# Ana Clara - Assistente de Vendas AI

## Overview

Ana Clara é uma assistente de vendas conversacional brasileira que ajuda usuários a encontrar produtos através de interações em linguagem natural. A aplicação combina capacidades de chat com IA e busca web em tempo real para oferecer uma experiência de compra intuitiva e didática. Os usuários descrevem o que procuram em português brasileiro simples, e o sistema busca na web, extrai informações de produtos e apresenta opções relevantes em formato visual de carrossel.

O sistema demonstra o paradigma emergente do comércio conversacional, onde interfaces complexas de e-commerce são substituídas por interações naturais de chat guiadas por uma assistente de vendas inteligente. A interface é totalmente em português brasileiro, com suporte a tema claro e escuro, categorias populares do mercado brasileiro e validação rigorosa de URLs para garantir que apenas produtos específicos (não páginas de busca/filtro) sejam exibidos.

## User Preferences

**Comunicação**: Português brasileiro simples e cotidiano
**Visual**: Assistente de vendas intuitiva e didática
**Tema**: Suporte a modo claro e escuro com persistência

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**UI Component Strategy**: The application uses shadcn/ui components (Radix UI primitives) with a "new-york" style variant, providing a modern, accessible component library. The design system emphasizes minimalism inspired by Linear, ChatGPT/Claude conversational UI patterns, and professional Brazilian e-commerce platforms (Mercado Livre, Shopee).

**Styling Approach**: Tailwind CSS with CSS variables for theming, supporting both light and dark modes with toggle button in header. Custom design tokens are defined for colors, spacing, and typography. The typography system uses Inter for interface elements and JetBrains Mono for monospaced content like prices and SKUs.

**Theme System**: ThemeProvider context with localStorage persistence allows users to toggle between light (white background) and dark (dark gray background) modes. The toggle button displays Moon icon in light mode and Sun icon in dark mode.

**State Management**: TanStack Query (React Query) for server state management with custom query client configuration. The chat interface uses Vercel AI SDK's `useChat` hook for streaming AI responses.

**Routing**: Wouter for lightweight client-side routing, with a simple single-page chat interface as the primary view.

**Layout Strategy**: Maximum width containers (max-w-4xl for chat, max-w-7xl for headers), responsive grid layouts for product displays (1 column mobile, 2 columns tablet, 3 columns desktop), and a fixed bottom input bar with scrollable message area.

**Header Design**: Features "Ana Clara" branding with Sparkles icon, title "Ana Clara", badge "Assistente de Vendas", and theme toggle button. Uses backdrop-blur for glassmorphism effect.

**Empty State Design**: Welcoming message "Olá! Sou a Ana Clara" with 6 popular Brazilian e-commerce categories:
- Moda & Vestuário
- Eletrônicos
- Casa & Decoração
- Beleza & Saúde
- Livros & Papelaria
- Esportes & Fitness

Each category is a clickable card with icon and label, arranged in responsive grid (1 col mobile, 2 cols tablet, 3 cols desktop).

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