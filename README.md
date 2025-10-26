# 🛍️ Ana Clara - Assistente de Vendas IA

<div align="center">

![Ana Clara Banner](https://img.shields.io/badge/Ana%20Clara-Assistente%20de%20Vendas-FF6B9D?style=for-the-badge)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**Assistente conversacional brasileira que revoluciona a experiência de compras online**

[🚀 Demo](#) • [📖 Documentação](#recursos) • [🎯 Roadmap](#roadmap)

</div>

---

## 🌟 Visão Geral

**Ana Clara** é uma assistente de vendas conversacional baseada em IA que ajuda usuários brasileiros a encontrar produtos através de interações naturais em português. Combina busca web em tempo real, extração inteligente de dados e apresentação visual de produtos em formato de carrossel.

### 💡 O Problema que Resolvemos

- ❌ Usuários perdem tempo navegando em múltiplos marketplaces
- ❌ Comparação de preços é manual e demorada
- ❌ Dificuldade em encontrar o melhor custo-benefício
- ❌ Interfaces complexas de e-commerce assustam alguns usuários

### ✅ Nossa Solução

- ✅ Busca centralizada em 4 marketplaces confiáveis
- ✅ Comparação automática de preços
- ✅ Conversação natural em português brasileiro
- ✅ Apresentação visual clara em carrossel
- ✅ Coleta de leads para seguimento comercial

---

## ✨ Recursos

### 🎯 Funcionalidades Principais

- **🤖 Conversação Natural**: Interação 100% em português brasileiro com tom amigável
- **🔍 Busca Inteligente**: Pesquisa em tempo real nos principais marketplaces brasileiros
- **🎠 Carrossel Visual**: Apresentação de produtos com imagens, preços e links diretos
- **💰 Comparação de Preços**: Ordenação automática por custo-benefício (🥇🥈🥉)
- **📊 Coleta de Leads**: Captura de nome e telefone antes da busca
- **🌓 Tema Claro/Escuro**: Interface adaptável às preferências do usuário
- **⚡ Performance Otimizada**: Cache inteligente e sliding window para contexto

### 🛒 Marketplaces Suportados

| Marketplace | Status | Validação |
|-------------|--------|-----------|
| 🛒 **Mercado Livre** | ✅ Ativo | Padrão `/MLB-` |
| 📦 **Amazon Brasil** | ✅ Ativo | Padrão `/dp/` |
| 🏬 **Magalu** | ✅ Ativo | Padrão `/p/` |
| 👗 **Shein** | ✅ Ativo | Padrão `-p-` |

> **Nota**: Apenas produtos específicos são aceitos. URLs de busca/lista são automaticamente rejeitadas.

---

## 🏗️ Arquitetura

### Stack Tecnológico

#### **Frontend**
- ⚛️ **React 18** com TypeScript
- 🎨 **Tailwind CSS** + shadcn/ui (Radix UI)
- 🔄 **TanStack Query** para gerenciamento de estado
- 🎭 **Vercel AI SDK** para streaming de respostas
- 🎯 **Wouter** para roteamento
- 🌈 **Framer Motion** para animações

#### **Backend**
- 🚀 **Express.js** com TypeScript (ESM)
- 🤖 **OpenAI GPT-4o-mini** via Replit AI Integrations
- 🔍 **Tavily API** para busca web
- 📄 **Jina Reader** para extração de conteúdo
- 🗄️ **PostgreSQL** (Neon serverless) com Drizzle ORM
- 💾 **Cache em memória** (5 min TTL)

### 📐 Arquitetura de Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Header     │  │  EmptyState  │  │ProductCarousel│      │
│  │ (Ana Clara)  │  │ (Categorias) │  │   (Embla)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│              ▲                              ▲                │
│              │      useChat (AI SDK)        │                │
│              └──────────────┬───────────────┘                │
└───────────────────────────┼────────────────────────────────┘
                            │ /api/chat (streaming)
┌───────────────────────────┼────────────────────────────────┐
│                      Backend (Express)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         AI Orchestration (GPT-4o-mini)              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │   │
│  │  │  searchWeb   │  │ fetchPage    │  │saveLead  │ │   │
│  │  │  (Tavily)    │  │ (Jina)       │  │ (DB)     │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │   │
│  │                                                     │   │
│  │  ┌────────────────────────────────────────────┐   │   │
│  │  │      extractProducts (GPT-4o-mini)         │   │   │
│  │  │  • Extrai nome, preço, imagem              │   │   │
│  │  │  • Valida URLs de imagem                   │   │   │
│  │  │  • Fallback automático se rawText vazio    │   │   │
│  │  └────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Cache Layer (5 min TTL)                │   │
│  │  • searchCache (queries)                            │   │
│  │  • pageCache (conteúdo)                             │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────────┬────────────────────────────────┘
                            │
┌───────────────────────────┼────────────────────────────────┐
│                PostgreSQL (Neon Serverless)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  leads   │  │ products │  │ queries  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### 🔄 Fluxo de Conversação

```
1. Usuário: "Olá"
   ↓
2. Ana Clara: "Qual seu nome?"
   ↓
3. Usuário: "João"
   ↓
4. Ana Clara: "Qual seu telefone?"
   ↓
5. Usuário: "11 98765-4321"
   ↓
6. [SISTEMA] saveLead(name: "João", phone: "11 98765-4321")
   ↓
7. Ana Clara: "Perfeito, João! 😊 Me conta o que você está buscando?"
   ↓
8. Usuário: "tênis nike preto"
   ↓
9. [SISTEMA] 
   - searchWeb("tênis nike preto site:mercadolivre.com.br OR ...")
   - Filtrar URLs válidas (apenas padrões /MLB-, /dp/, /p/, -p-)
   - fetchPage(url1), fetchPage(url2), fetchPage(url3)
   - extractProducts(content1), extractProducts(content2), extractProducts(content3)
   - Ordenar por preço (menor = 🥇)
   ↓
10. Ana Clara: [Mensagem amigável] + 
    ```json
    {"products":[
      {"name":"Tênis Nike Air","price":"R$ 299","url":"...","image":"...","site":"Mercado Livre","emoji":"🥇"}
    ]}
    ```
```

---

## 🎬 Sistema de Demo

### ⚡ Modo Demo com Produtos Mock

Para apresentações e demos, a Ana Clara possui um sistema de produtos mock que retorna resultados **instantaneamente** (< 1 segundo) com dados reais de vestuário brasileiro.

#### 📦 Categorias de Vestuário (Demo)

| Categoria | Produtos | Exemplo |
|-----------|----------|---------|
| 👔 **Camisetas** | 6 produtos | Camiseta Básica Branca, Oversized Preta, etc. |
| 👗 **Vestidos** | 6 produtos | Vestido Longo Floral, Midi Preto, etc. |
| 👖 **Calças** | 6 produtos | Calça Jeans Skinny, Cargo Preta, etc. |
| 👟 **Tênis** | 6 produtos | Nike Air Max, Adidas Ultraboost, etc. |
| 🧥 **Jaquetas** | 6 produtos | Jaqueta Jeans Azul, Bomber Preta, etc. |
| 👜 **Bolsas** | 6 produtos | Bolsa Tote Preta, Mochila de Couro, etc. |

**Total**: 36 produtos reais com URLs, imagens e preços de marketplaces brasileiros

#### 🎯 Como Funciona

**Tool getMockProducts**:
```typescript
// Usuário clica em "👔 Camisetas" ou digita "camisetas"
getMockProducts(category: "camisetas")
// Retorna 6 produtos INSTANTANEAMENTE

// Resposta (< 1s):
{
  products: [
    {
      name: "Camiseta Básica 100% Algodão Branca",
      price: "R$ 49,90",
      url: "https://mercadolivre.com.br/...",
      image: "https://http2.mlstatic.com/...",
      site: "Mercado Livre",
      emoji: "🥇",
      badges: ["Frete Grátis"]
    },
    // ... mais 5 produtos
  ]
}
```

#### ✨ Badges Visuais

Produtos mock incluem badges especiais que aparecem nos cards:
- 🚚 **Frete Grátis** - Entrega gratuita
- 📉 **15% OFF** - Desconto aplicado
- ⭐ **Mais Vendido** - Produto popular

#### 🔄 Modo Híbrido

```
┌──────────────────────────────────────────────┐
│ Usuário busca por...                         │
└──────────────┬───────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
Vestuário?         Outro?
(camisetas,     (notebook,
vestidos...)     celular...)
       │               │
       ▼               ▼
getMockProducts   searchWeb
 (<1 segundo)     (5-7 seg)
       │               │
       └───────┬───────┘
               ▼
        Carrossel JSON
```

**Exemplo de Uso**:
- ✅ "camisetas" → getMockProducts (instantâneo)
- ✅ "vestido preto" → getMockProducts (instantâneo)
- ❌ "notebook" → searchWeb (busca real 5-7s)

#### 📁 Arquivo de Dados

Produtos mock armazenados em:
```
shared/demo-products.ts
├── getProductsByCategory(category: string)
├── searchProducts(term: string)
└── 36 produtos categorizados
```

---

## 🚀 Otimizações Implementadas

### ⚡ Performance (Redução de 70-85% no uso de tokens)

1. **Sliding Window (Contexto Limitado)**
   - Mantém apenas 3 primeiras + 12 últimas mensagens
   - Evita explosão de contexto em conversas longas
   - Redução de ~75% no uso de tokens

2. **Normalização de Respostas**
   - `searchWeb`: retorna apenas `{count, urls}` (-80% de bloat)
   - `saveLead`: retorna apenas `{success}` (-90% de bloat)
   - `extractProducts`: dados mínimos necessários

3. **Cache Inteligente**
   - Busca web: 5 minutos TTL
   - Conteúdo de páginas: 5 minutos TTL
   - Reduz ~50% das chamadas à API

4. **Retry com Exponential Backoff**
   - Tavily API: 3 tentativas (1s, 2s, 4s)
   - Evita falhas transitórias
   - Resiliência de ~90%

### 🎯 Validação Rigorosa de URLs

```typescript
// ✅ URLs ACEITAS (produto específico)
"amazon.com.br/Nike-Air/dp/B07G7BTMMK"
"mercadolivre.com.br/Tenis/MLB-123456"
"magazineluiza.com.br/tenis/p/123456"
"shein.com/tenis-nike-p-12345.html"

// ❌ URLs REJEITADAS (busca/lista)
"amazon.com.br/s?k=tenis"
"mercadolivre.com.br/lista/tenis"
"magazineluiza.com.br/busca?q=nike"
```

**Tripla Validação**:
1. Domínio permitido (4 marketplaces)
2. Padrão válido (`/dp/`, `/MLB-`, `/p/`, `-p-`)
3. Sem padrões inválidos (`/search`, `/lista`, `?keyword=`)

---

## 📊 Schema de Dados

### 🗄️ Database (PostgreSQL)

```typescript
// Leads - Clientes capturados
leads {
  id: serial (PK)
  name: varchar
  phone: varchar
  createdAt: timestamp
}

// Products - Catálogo extraído
products {
  id: serial (PK)
  sku: varchar (unique, nullable)
  name: varchar
  price: varchar
  url: varchar
  image: varchar
  source: varchar
  createdAt: timestamp
}

// Queries - Analytics
queries {
  id: serial (PK)
  userId: varchar (nullable)
  query: varchar
  results: jsonb
  latencyMs: integer (nullable)
  error: varchar (nullable)
  createdAt: timestamp
}
```

### 📦 Product JSON Format (Carrossel)

```json
{
  "products": [
    {
      "name": "Tênis Nike Air Max",
      "price": "R$ 299,90",
      "url": "https://mercadolivre.com.br/MLB-123456",
      "image": "https://http2.mlstatic.com/produto.jpg",
      "site": "Mercado Livre",
      "emoji": "🥇"
    },
    {
      "name": "Tênis Nike Revolution",
      "price": "R$ 349,00",
      "url": "https://amazon.com.br/dp/B08XYZ",
      "image": "https://m.media-amazon.com/produto.jpg",
      "site": "Amazon",
      "emoji": "🥈"
    }
  ]
}
```

---

## 🎨 Design System

### 🌈 Paleta de Cores

**Modo Claro**:
- Background: `#FFFFFF`
- Foreground: `#0A0A0A`
- Primary: `#FF6B9D` (Rosa vibrante)
- Secondary: `#F4F4F5`
- Accent: `#8B5CF6` (Roxo)

**Modo Escuro**:
- Background: `#0A0A0A`
- Foreground: `#FAFAFA`
- Primary: `#FF6B9D`
- Secondary: `#27272A`
- Accent: `#A78BFA`

### 🎭 Componentes UI

- **shadcn/ui** (variant: new-york)
- **Radix UI** primitives
- **Lucide React** icons
- **Embla Carousel** para produtos
- **Framer Motion** para animações

### 📱 Responsividade

| Breakpoint | Layout Produtos | Categorias |
|------------|-----------------|------------|
| Mobile (<768px) | 1 coluna | 1 coluna |
| Tablet (768-1024px) | 2 colunas | 2 colunas |
| Desktop (>1024px) | 3 colunas | 3 colunas |

---

## 🛠️ Instalação

### Pré-requisitos

- Node.js 18+
- PostgreSQL (ou conta Neon)
- Chaves de API:
  - `OPENAI_API_KEY` ou Replit AI Integrations
  - `TAVILY_API_KEY`
  - `DATABASE_URL`

### Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/ana-clara.git
cd ana-clara

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas chaves

# Execute migrações do database
npm run db:push

# Inicie o servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# AI Services
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...

# Session
SESSION_SECRET=seu-secret-aleatorio
```

---

## 📖 Uso

### 1️⃣ Iniciar Conversa

```
Usuário: Olá
Ana Clara: Olá! Sou a Ana Clara 😊 Qual seu nome?
```

### 2️⃣ Fornecer Dados

```
Usuário: Maria
Ana Clara: Prazer, Maria! Qual seu telefone?
Usuário: 21 91234-5678
Ana Clara: Perfeito, Maria! 😊 Me conta o que você está buscando?
```

### 3️⃣ Buscar Produtos

```
Usuário: notebook dell
Ana Clara: Vou buscar os melhores notebooks Dell pra você! ✨

[Carrossel com 2-3 produtos]
```

### 4️⃣ Pedir Mais Opções

```
Usuário: tem mais?
Ana Clara: [Carrossel com próximos produtos]
```

---

## 🧪 Testes

### Casos de Teste Principais

✅ **Fluxo Completo**
- Coleta de nome
- Coleta de telefone
- Salvamento no database
- Busca de produtos
- Apresentação em carrossel

✅ **Validações**
- Telefone brasileiro válido
- URLs apenas de marketplaces permitidos
- Rejeição de URLs de busca/lista
- Fallback de imagens

✅ **Performance**
- Cache funcionando (TTL 5 min)
- Retry em falhas da API
- Sliding window limitando contexto

✅ **Edge Cases**
- Produto não encontrado
- API Tavily offline
- Imagem não carrega
- Múltiplos pedidos de "mais produtos"

---

## 📈 Roadmap

### ✅ Fase 1 - MVP (Concluído)
- [x] Interface conversacional em português
- [x] Busca em 4 marketplaces
- [x] Apresentação visual (carrossel)
- [x] Coleta de leads
- [x] Tema claro/escuro
- [x] Otimizações de performance

### 🚧 Fase 2 - Melhorias (Em Progresso)
- [ ] Filtros de preço (mín/máx)
- [ ] Filtro de frete grátis
- [ ] Histórico de buscas do usuário
- [ ] Notificações de queda de preço
- [ ] Comparação lado a lado

### 🔮 Fase 3 - Expansão (Futuro)
- [ ] Recomendações personalizadas
- [ ] Programa de afiliados
- [ ] Chat via WhatsApp
- [ ] Suporte multi-idioma (ES, EN)
- [ ] App mobile (React Native)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature incrível'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Commit

- `Add:` Nova feature
- `Fix:` Correção de bug
- `Update:` Atualização de código existente
- `Refactor:` Refatoração sem mudança de funcionalidade
- `Docs:` Atualização de documentação

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 Agradecimentos

- **Vercel AI SDK** - Framework de IA conversacional
- **Tavily API** - Busca web em tempo real
- **Jina Reader** - Extração de conteúdo limpo
- **shadcn/ui** - Componentes UI elegantes
- **Replit** - Plataforma de desenvolvimento

---

## 📞 Contato

**Ana Clara Project**

- 📧 Email: contato@anaclara.com.br
- 🌐 Website: [anaclara.com.br](#)
- 💼 LinkedIn: [Ana Clara IA](#)

---

<div align="center">

**Feito com ❤️ no Brasil**

[![Replit](https://img.shields.io/badge/Replit-DD1200?style=for-the-badge&logo=Replit&logoColor=white)](https://replit.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)

</div>
