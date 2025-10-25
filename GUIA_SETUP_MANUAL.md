# 📘 Guia de Setup Manual - ChatCommerce AI

## ⚠️ Importante
Os tokens fornecidos não têm permissões para criar projetos via API. Siga este guia para configurar manualmente.

---

## 🗄️ PARTE 1: Configurar Supabase

### Passo 1: Criar Projeto

1. **Acesse:** https://supabase.com/dashboard
2. **Clique em:** "New Project" (botão verde)
3. **Preencha:**
   - **Name:** `chatcommerce-ai`
   - **Database Password:** (crie uma senha forte e **ANOTE**)
   - **Region:** `US East (N. Virginia)` ou a mais próxima de você
   - **Pricing Plan:** Free
4. **Clique em:** "Create new project"
5. **Aguarde:** ~2 minutos para o projeto ser criado

### Passo 2: Obter Credenciais

1. No dashboard do projeto, clique em **⚙️ Project Settings** (canto inferior esquerdo)
2. Vá para **API** na barra lateral
3. **Anote as seguintes informações:**

```
Project URL: https://[seu-projeto-id].supabase.co
anon/public key: eyJh... (começa com eyJ)
service_role key: eyJh... (mantenha SECRETA)
```

### Passo 3: Executar Schema SQL

1. No dashboard, clique em **SQL Editor** (ícone 🗄️ na barra lateral)
2. Clique em **"New query"**
3. **Cole EXATAMENTE este SQL:**

```sql
-- ============================================================================
-- CHATCOMMERCE AI DATABASE SCHEMA
-- ============================================================================

-- Tabela de queries (histórico de buscas)
CREATE TABLE IF NOT EXISTS queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  query TEXT NOT NULL,
  results JSONB,
  latency_ms INTEGER,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de products (produtos descobertos)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT,
  name TEXT NOT NULL,
  price NUMERIC(10, 2),
  url TEXT,
  image TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_queries_created_at ON queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_queries_user_id ON queries(user_id);
CREATE INDEX IF NOT EXISTS idx_queries_latency ON queries(latency_ms) WHERE latency_ms IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_source ON products(source) WHERE source IS NOT NULL;

-- Comentários
COMMENT ON TABLE queries IS 'Histórico de queries de busca com analytics';
COMMENT ON TABLE products IS 'Catálogo de produtos descobertos via AI';
COMMENT ON COLUMN queries.latency_ms IS 'Latência da query em milissegundos';
COMMENT ON COLUMN queries.results IS 'Resultados da busca em formato JSONB';
```

4. **Clique em:** "Run" (ou Ctrl+Enter)
5. **Verifique:** Deve aparecer "Success. No rows returned"

### Passo 4: Verificar Tabelas

1. Clique em **Table Editor** (ícone 📊 na barra lateral)
2. Você deve ver as tabelas:
   - ✅ `queries`
   - ✅ `products`

---

## 🚀 PARTE 2: Configurar Vercel

### Passo 1: Conectar Repositório GitHub

1. **Acesse:** https://vercel.com/new
2. **Faça login** com sua conta GitHub
3. **Autorize** Vercel a acessar seus repositórios
4. **Busque por:** `ai-builder-hackathon-2025-danilomax`
5. **Clique em:** "Import"

### Passo 2: Configurar Projeto

1. **Configure as informações:**
   - **Project Name:** `chatcommerce-ai` (ou mantenha o padrão)
   - **Framework Preset:** Next.js (detectado automaticamente ✅)
   - **Root Directory:** `./` (padrão)
   - **Build Command:** `npm run build` (padrão)
   - **Output Directory:** `.next` (padrão)

### Passo 3: Adicionar Environment Variables

**⚠️ IMPORTANTE:** Adicione TODAS estas variáveis antes de fazer deploy!

Clique em **"Environment Variables"** e adicione:

#### 1. Supabase (obrigatório)
```
Name: SUPABASE_URL
Value: https://[seu-projeto-id].supabase.co
Environments: ✅ Production ✅ Preview ✅ Development
```

```
Name: SUPABASE_ANON_KEY
Value: eyJh... (sua anon key do Supabase)
Environments: ✅ Production ✅ Preview ✅ Development
```

#### 2. OpenAI (obrigatório)
```
Name: OPENAI_API_KEY
Value: sk-proj-[sua-key-openai]
Environments: ✅ Production ✅ Preview ✅ Development
```

**Como obter:**
- Acesse: https://platform.openai.com/api-keys
- Clique em "Create new secret key"
- Copie a key (só aparece uma vez!)

#### 3. Tavily (obrigatório)
```
Name: TAVILY_API_KEY
Value: tvly-[sua-key-tavily]
Environments: ✅ Production ✅ Preview ✅ Development
```

**Como obter:**
- Acesse: https://tavily.com/
- Crie uma conta gratuita
- Copie sua API key do dashboard

#### 4. App Name (opcional)
```
Name: NEXT_PUBLIC_APP_NAME
Value: ChatCommerce AI
Environments: ✅ Production ✅ Preview ✅ Development
```

### Passo 4: Deploy!

1. **Clique em:** "Deploy"
2. **Aguarde:** ~2-3 minutos
3. **Resultado:** Você verá "Congratulations! 🎉"

### Passo 5: Testar Deploy

1. **Clique em:** "Visit" ou acesse `https://chatcommerce-ai.vercel.app`
2. **Teste a aplicação:**
   - Digite: "Find me wireless headphones under $100"
   - Aguarde a resposta da AI
   - Verifique se produtos aparecem

---

## 📋 CHECKLIST FINAL

### Supabase ✅
- [ ] Projeto criado
- [ ] SQL schema executado
- [ ] Tabelas `queries` e `products` existem
- [ ] SUPABASE_URL anotada
- [ ] SUPABASE_ANON_KEY anotada

### Vercel ✅
- [ ] Repositório importado
- [ ] Environment variables configuradas:
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY
  - [ ] OPENAI_API_KEY
  - [ ] TAVILY_API_KEY
  - [ ] NEXT_PUBLIC_APP_NAME
- [ ] Deploy realizado com sucesso
- [ ] Aplicação funcionando em produção

---

## 🔧 Desenvolvimento Local (Opcional)

Se quiser rodar localmente:

### 1. Clone o repositório
```bash
git clone https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax.git
cd ai-builder-hackathon-2025-danilomax
```

### 2. Instale dependências
```bash
npm install
```

### 3. Configure .env.local
Crie o arquivo `.env.local` na raiz:

```env
# Supabase
SUPABASE_URL=https://[seu-projeto-id].supabase.co
SUPABASE_ANON_KEY=eyJh...

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Tavily
TAVILY_API_KEY=tvly-...

# App
NEXT_PUBLIC_APP_NAME=ChatCommerce AI
```

### 4. Execute
```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🐛 Troubleshooting

### Erro: "Failed to fetch"
- **Causa:** Environment variables não configuradas
- **Solução:** Verifique se TODAS as env vars estão no Vercel
- **Como verificar:** Vercel Dashboard → Project → Settings → Environment Variables

### Erro: "Database connection failed"
- **Causa:** SUPABASE_URL ou SUPABASE_ANON_KEY incorretas
- **Solução:** Copie novamente do Supabase Dashboard → Settings → API

### Erro: "OpenAI API key invalid"
- **Causa:** OPENAI_API_KEY inválida ou sem créditos
- **Solução:** 
  1. Verifique em https://platform.openai.com/api-keys
  2. Adicione créditos se necessário (mínimo $5)

### Deploy falhou
- **Causa:** Build error
- **Solução:** 
  1. Vá para Vercel → Deployments → Clique no deploy que falhou
  2. Veja os logs de erro
  3. Geralmente é falta de env var

### Supabase SQL não executou
- **Causa:** Erro de sintaxe ou permissões
- **Solução:**
  1. Certifique-se de estar no SQL Editor
  2. Cole TODO o SQL de uma vez
  3. Clique em Run
  4. Se der erro, delete as tabelas e tente novamente

---

## 📞 Suporte

### Links Úteis
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Repositório GitHub:** https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax

### Documentação
- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

## 🎉 Pronto!

Após seguir todos os passos, você terá:

✅ **Supabase** configurado com database PostgreSQL  
✅ **Vercel** com deploy automático do GitHub  
✅ **ChatCommerce AI** rodando em produção  
✅ **Environment variables** configuradas  
✅ **Database schema** criado e indexado  

**URL do projeto:** https://chatcommerce-ai.vercel.app (ou similar)

---

**Última atualização:** ${new Date().toLocaleDateString('pt-BR')}
