# 🛒 ChatCommerce AI

> **AI-Powered Conversational Shopping Assistant**  
> Built for AI Builder Hackathon 2025

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai)](https://openai.com/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-5.0-black)](https://sdk.vercel.ai/)

ChatCommerce AI é um assistente de compras conversacional inteligente que combina busca web em tempo real, extração de produtos com IA e interface de chat streaming para ajudar usuários a encontrar produtos online de forma natural e eficiente.

## ✨ Funcionalidades

### 🤖 **AI-Powered Conversation**
- Respostas em tempo real com streaming via Vercel AI SDK
- Modelo GPT-4o-mini da OpenAI para compreensão natural
- 3 ferramentas AI especializadas integradas

### 🔍 **Smart Product Discovery**
- **Busca Web:** Tavily API para resultados relevantes em tempo real
- **Content Fetching:** Jina Reader para extração limpa de conteúdo
- **Product Extraction:** OpenAI GPT-4o-mini para estruturação de dados

### 💾 **Data Analytics**
- Supabase PostgreSQL database
- Logging automático de queries
- Rastreamento de produtos descobertos
- Métricas de performance

### ⚡ **Performance Otimizada**
- Edge Runtime habilitado
- Sistema de cache inteligente (1h search, 24h pages)
- Rate limiting (10 req/min por IP)
- Timeout protection (10s)
- LRU cache com limite de 100 entradas

## 🏗️ Arquitetura

```
ChatCommerce AI
│
├── Frontend (Next.js 15)
│   ├── App Router
│   ├── TypeScript
│   ├── Tailwind CSS
│   └── AI SDK React Hooks
│
├── Backend API
│   ├── Edge Runtime
│   ├── Vercel AI SDK
│   └── 3 AI Tools:
│       ├── searchWeb (Tavily)
│       ├── fetchPage (Jina Reader)
│       └── extractProducts (OpenAI)
│
├── Database (Supabase)
│   ├── queries table
│   └── products table
│
└── External APIs
    ├── OpenAI GPT-4o-mini
    ├── Tavily Search API
    └── Jina Reader API
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm ou yarn
- Contas nas seguintes plataformas:
  - [OpenAI](https://platform.openai.com/) (para GPT-4o-mini)
  - [Tavily](https://tavily.com/) (para busca web)
  - [Supabase](https://supabase.com/) (para database)

### Installation

1. **Clone o repositório**
```bash
git clone https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax.git
cd ai-builder-hackathon-2025-danilomax
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY

# Tavily API Configuration
TAVILY_API_KEY=tvly-YOUR_ACTUAL_KEY

# Supabase Configuration
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=YOUR_ACTUAL_ANON_KEY

# Application Configuration
NEXT_PUBLIC_APP_NAME=ChatCommerce AI
```

4. **Configure o banco de dados**

Execute o SQL no Supabase Dashboard (SQL Editor):

```sql
-- Arquivo: supabase.sql
-- Cria as tabelas queries e products com índices otimizados
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse http://localhost:3000

## 📁 Estrutura do Projeto

```
chatcommerce-ai/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API endpoint principal
│   ├── globals.css               # Estilos globais
│   ├── layout.tsx                # Layout raiz
│   └── page.tsx                  # Interface de chat
├── lib/
│   ├── db.ts                     # Cliente Supabase
│   ├── extract.ts                # Extração de produtos (OpenAI)
│   ├── rate-limit.ts             # Rate limiting
│   └── web.ts                    # Busca web + cache
├── types/
│   ├── product.ts                # TypeScript types
│   └── _check.ts                 # Validação de tipos
├── .env.local                    # Variáveis de ambiente
├── package.json                  # Dependências
├── supabase.sql                  # Schema do database
├── tailwind.config.js            # Configuração Tailwind
└── tsconfig.json                 # Configuração TypeScript
```

## 🛠️ Tech Stack

### Core
- **Next.js 15** - React framework com App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling

### AI & APIs
- **Vercel AI SDK** - Streaming e tool calling
- **OpenAI GPT-4o-mini** - Product extraction
- **Tavily API** - Web search
- **Jina Reader** - Content fetching

### Database
- **Supabase** - PostgreSQL database
- **Drizzle Zod** - Schema validation

### Performance
- **Edge Runtime** - Fast cold starts
- **LRU Cache** - Smart caching
- **Rate Limiting** - API protection

## 📊 Database Schema

### `queries` Table
```sql
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  query TEXT NOT NULL,
  results JSONB,
  latency_ms INTEGER,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `products` Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT,
  name TEXT NOT NULL,
  price NUMERIC,
  url TEXT,
  image TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🎯 Como Funciona

1. **Usuário faz uma pergunta** no chat
   - Ex: "Find me waterproof backpacks under $200"

2. **AI decide quais tools usar**
   - `searchWeb`: Busca no Tavily API
   - `fetchPage`: Extrai conteúdo com Jina Reader
   - `extractProducts`: Estrutura dados com OpenAI

3. **Streaming de resposta**
   - Resposta é transmitida em tempo real
   - Produtos formatados com links clicáveis

4. **Armazenamento**
   - Query e produtos salvos no Supabase
   - Analytics e métricas disponíveis

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório GitHub ao Vercel
2. Configure as environment variables
3. Deploy automático em cada push!

```bash
# Via CLI
npm install -g vercel
vercel --prod
```

### Environment Variables (Vercel)

Configure no Vercel Dashboard:
- `OPENAI_API_KEY`
- `TAVILY_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_NAME`

## 📈 Performance Metrics

**Targets:**
- Average latency: ≤ 5000ms
- P50 latency: ≤ 4000ms
- P95 latency: ≤ 7000ms
- Cache hit rate: > 50%

**Monitoramento:**
```sql
SELECT
  AVG(latency_ms) as avg_latency,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms) as p50,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95
FROM queries
WHERE created_at > NOW() - INTERVAL '1 day';
```

## 🔒 Security

- ✅ API keys via environment variables
- ✅ Rate limiting (10 req/min)
- ✅ Input validation com Zod
- ✅ Edge runtime isolation
- ✅ Timeout protection

## 🛣️ Roadmap

- [ ] Autenticação de usuários
- [ ] Carrinho de compras
- [ ] Integração com Stripe/Pix
- [ ] Dashboard administrativo
- [ ] Filtros avançados
- [ ] Histórico de conversas
- [ ] Suporte multi-idioma
- [ ] App mobile (React Native)

## 📝 License

MIT

## 🙏 Acknowledgments

Construído para o **AI Builder Hackathon 2025**

### Technologies
- [Next.js](https://nextjs.org/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [OpenAI](https://openai.com/)
- [Tavily](https://tavily.com/)
- [Jina AI](https://jina.ai/)
- [Supabase](https://supabase.com/)

---

**Built with ❤️ by DevDaniloMax**
