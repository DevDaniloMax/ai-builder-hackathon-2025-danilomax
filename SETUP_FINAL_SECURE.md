# ✅ ChatCommerce AI - Setup Final (Produção Segura)

## ⚠️ SEGURANÇA IMPLEMENTADA

Este guia agora inclui **Row Level Security (RLS)** obrigatório no Supabase para proteger o database contra acesso não autorizado.

---

## 🎯 Status Atual

✅ **Repositório GitHub:** https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax  
✅ **Credenciais Supabase:** Configuradas  
✅ **API Keys:** OpenAI e Tavily prontas  
✅ **SQL Schema:** Atualizado com RLS habilitado  
✅ **Security:** Row Level Security policies configuradas  

---

## 📋 AÇÕES NECESSÁRIAS (5 minutos)

### 1️⃣ Executar SQL SEGURO no Supabase (2 min)

1. **Acesse:** https://supabase.com/dashboard/project/akwnbczoupvwkasylrtf/sql/new

2. **Cole o SQL completo do arquivo `chatcommerce-ai/supabase.sql`:**

O SQL agora inclui:
- ✅ Row Level Security (RLS) habilitado
- ✅ Policies que permitem apenas INSERT de dados anônimos
- ✅ Proteção contra UPDATE/DELETE não autorizados
- ✅ Todos os índices para performance

3. **Clique em "Run"** (ou Ctrl+Enter)

4. **Resultado esperado:** "Success. No rows returned"

5. **Verificar segurança:**

Execute esta query no SQL Editor para confirmar que RLS está ativo:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('queries', 'products');
```

**Resultado esperado:**
```
queries    | true
products   | true
```

---

### 2️⃣ Deploy Seguro na Vercel (3 min)

1. **Acesse:** https://vercel.com/new

2. **Import Git Repository:**
   - Busque: `ai-builder-hackathon-2025-danilomax`
   - Clique em "Import"

3. **Configure:**
   - **Project Name:** `chatcommerce-ai`
   - **Framework:** Next.js (detectado automaticamente)
   - **Root Directory:** `chatcommerce-ai` ⚠️ **IMPORTANTE!**
   - **Build Command:** `npm run build`

4. **Environment Variables:**

⚠️ **NÃO use as credenciais deste documento diretamente em produção!**

As credenciais abaixo são apenas para referência. **Recomendado:**
- Gere novas API keys após o setup inicial
- Use Vercel Secrets para produção
- Rotacione credenciais regularmente

```
SUPABASE_URL
https://akwnbczoupvwkasylrtf.supabase.co

SUPABASE_ANON_KEY
[Use a anon key do Supabase Dashboard]

OPENAI_API_KEY
[Crie nova key em https://platform.openai.com/api-keys]

TAVILY_API_KEY
[Copie do dashboard Tavily]

NEXT_PUBLIC_APP_NAME
ChatCommerce AI
```

5. **Clique em "Deploy"**

---

## 🔒 Políticas de Segurança Implementadas

### RLS (Row Level Security) Habilitado

**Tabela `queries`:**
- ✅ INSERT permitido para anônimos (logging de queries)
- ❌ UPDATE bloqueado para anônimos
- ❌ DELETE bloqueado para anônimos
- ⚠️ SELECT bloqueado (descomente policy se precisar analytics públicos)

**Tabela `products`:**
- ✅ INSERT permitido para anônimos (AI salva produtos)
- ❌ UPDATE bloqueado para anônimos
- ❌ DELETE bloqueado para anônimos
- ⚠️ SELECT bloqueado (descomente policy se precisar catálogo público)

### Por que RLS é Obrigatório?

A `SUPABASE_ANON_KEY` é exposta no frontend (necessário para o cliente JS). Sem RLS:
- ❌ Qualquer usuário poderia **deletar** todos os dados
- ❌ Qualquer usuário poderia **modificar** registros existentes
- ❌ Banco de dados completamente exposto

Com RLS:
- ✅ Usuários anônimos só podem **criar** novos registros
- ✅ Dados existentes protegidos contra modificação
- ✅ Controle granular de acesso

---

## 🔐 Rotação de Credenciais (Recomendado)

Após o deploy inicial, rotacione as credenciais:

### 1. OpenAI API Key
- Acesse: https://platform.openai.com/api-keys
- **Revogue** a key atual
- Crie nova key
- Atualize na Vercel: Settings → Environment Variables

### 2. Tavily API Key
- Acesse: https://tavily.com/
- Gere nova API key
- Atualize na Vercel

### 3. Supabase Keys (opcional, mas recomendado)
Se as credentials vazaram (ex: commits acidentais):
- Supabase Dashboard → Settings → API
- Clique em "Reset database password"
- Anon key será regenerada automaticamente
- Atualize na Vercel

---

## 🧪 Testar a Aplicação

### 1. Acesse a URL
`https://chatcommerce-ai.vercel.app`

### 2. Teste queries:
```
Find me wireless headphones under $100
```

### 3. Verificar segurança:

No Supabase SQL Editor, tente modificar um registro existente como anônimo:
```sql
-- Esta query deve FALHAR (RLS bloqueando)
UPDATE queries SET query = 'hacked' WHERE id = '[algum-uuid]';
```

**Resultado esperado:** "new row violates row-level security policy"

---

## 📊 Monitoramento de Segurança

### Verificar RLS Status

```sql
-- Ver todas as policies ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Analytics Seguros (Service Role)

Use service_role key (nunca anon key) para queries administrativas:

```sql
SELECT 
  COUNT(*) as total_queries,
  AVG(latency_ms) as avg_latency,
  COUNT(*) FILTER (WHERE error IS NOT NULL) as errors
FROM queries
WHERE created_at > NOW() - INTERVAL '1 day';
```

---

## ⚠️ NUNCA COMMITE CREDENCIAIS

O arquivo `.env.local` já está no `.gitignore`. **Verifique sempre:**

```bash
cd chatcommerce-ai
git status  # .env.local NÃO deve aparecer
```

Se aparecer:
```bash
git rm --cached .env.local
git commit -m "Remove leaked credentials"
```

Depois **ROTACIONE TODAS AS KEYS IMEDIATAMENTE!**

---

## 🐛 Troubleshooting de Segurança

### Erro: "new row violates row-level security policy"
**Causa:** Tentativa de operação não permitida pela RLS policy  
**Solução:** Isso é esperado! RLS está funcionando corretamente  
**Ação:** Revise as policies se precisar permitir a operação

### Erro: "permission denied for table queries"
**Causa:** RLS habilitado mas nenhuma policy permite a operação  
**Solução:** Verifique se executou TODO o SQL do supabase.sql

### Dados não aparecem no frontend
**Causa:** SELECT não permitido para anônimos (por design)  
**Solução:** Descomente as policies de SELECT no SQL se quiser dados públicos

---

## ✅ Checklist de Segurança

- [ ] SQL executado com RLS policies
- [ ] RLS verificado: `rowsecurity = true` para ambas tabelas
- [ ] Tentativa de UPDATE como anônimo bloqueada
- [ ] `.env.local` não commitado no git
- [ ] Environment variables configuradas na Vercel
- [ ] Credenciais rotacionadas após setup inicial
- [ ] Deploy funcionando e seguro

---

## 🎉 Próximos Passos Pós-Deploy

1. **Monitoramento:** Configure alertas no Supabase para queries suspeitas
2. **Backup:** Ative backups automáticos no Supabase (Settings → Database)
3. **Rate Limiting:** Considere implementar rate limiting adicional
4. **Analytics:** Habilite SELECT policies se quiser dashboard público
5. **Logs:** Configure logging de audit trail

---

## 📞 Recursos de Segurança

**Supabase Security Best Practices:**
https://supabase.com/docs/guides/auth/row-level-security

**Vercel Security:**
https://vercel.com/docs/security

**OpenAI API Security:**
https://platform.openai.com/docs/guides/safety-best-practices

---

**🎊 Setup completo com SEGURANÇA HABILITADA! ✅**

*Última atualização: ${new Date().toLocaleString('pt-BR')}*
