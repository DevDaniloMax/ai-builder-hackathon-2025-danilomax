# 🔄 CI/CD Setup - ChatCommerce AI

## ✅ O que foi configurado

### GitHub Actions Workflows

1. **CI - Build & Type Check** (`.github/workflows/ci.yml`)
   - ✅ Executa em cada push e PR
   - ✅ Type checking com TypeScript
   - ✅ Linting do código
   - ✅ Build verification
   - ✅ Security scan

2. **Deploy to Vercel** (`.github/workflows/deploy.yml`)
   - ✅ Deploy automático em push para `main`
   - ✅ Deploy para produção na Vercel
   - ✅ Comentário automático no commit com URL

3. **Preview Deployment** (`.github/workflows/preview.yml`)
   - ✅ Deploy de preview para cada PR
   - ✅ URL única para cada PR
   - ✅ Comentário automático no PR com link

---

## 🔑 Secrets Necessários no GitHub

Para os workflows funcionarem, você precisa adicionar 3 secrets no GitHub:

### Como adicionar secrets:

1. Acesse: https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax/settings/secrets/actions
2. Clique em "New repository secret"
3. Adicione cada secret abaixo:

### 1. VERCEL_TOKEN
**Nome:** `VERCEL_TOKEN`  
**Valor:** Seu token da Vercel (já existe em Replit secrets)

**Como obter:**
- Acesse: https://vercel.com/account/tokens
- Clique em "Create Token"
- Nome: "ChatCommerce CI/CD"
- Scope: Full Account
- Copie o token

### 2. VERCEL_ORG_ID
**Nome:** `VERCEL_ORG_ID`  
**Valor:** ID da sua organização/usuário Vercel

**Como obter:**
```bash
# Método 1: Via CLI
cd chatcommerce-ai
vercel link
cat .vercel/project.json
# Copie o valor de "orgId"

# Método 2: Via dashboard
# Vercel Dashboard → Settings → General → Team ID
```

### 3. VERCEL_PROJECT_ID
**Nome:** `VERCEL_PROJECT_ID`  
**Valor:** ID do projeto na Vercel

**Como obter:**
```bash
# Método 1: Via CLI
cd chatcommerce-ai
vercel link
cat .vercel/project.json
# Copie o valor de "projectId"

# Método 2: Via dashboard
# Vercel Dashboard → Project Settings → General → Project ID
```

---

## 🚀 Como funciona o CI/CD

### 1. Desenvolvimento Local

```bash
git checkout -b feature/nova-funcionalidade
# Faça suas alterações
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin feature/nova-funcionalidade
```

### 2. Pull Request

1. Crie PR no GitHub
2. ✅ **CI workflow** executa automaticamente:
   - Type check
   - Lint
   - Build
   - Security scan
3. ✅ **Preview workflow** cria deploy de preview:
   - URL única gerada
   - Comentário automático no PR com link
4. Revise o preview deployment
5. Merge quando aprovado

### 3. Deploy Automático

1. Merge para `main`:
```bash
git checkout main
git pull origin main
```

2. ✅ **Deploy workflow** executa automaticamente:
   - Build na Vercel
   - Deploy para produção
   - Comentário no commit com URL de produção

---

## 📊 Status Badges

Adicione ao README.md para mostrar status dos workflows:

```markdown
![CI](https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax/workflows/CI%20-%20Build%20%26%20Type%20Check/badge.svg)
![Deploy](https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax/workflows/Deploy%20to%20Vercel/badge.svg)
```

---

## 🔍 Verificações do CI

### Type Check
```bash
npm run type-check
# ou
npx tsc --noEmit
```

### Lint
```bash
npm run lint
# ou
npx next lint
```

### Build
```bash
npm run build
```

### Security Audit
```bash
npm audit --audit-level=moderate
```

---

## 🛠️ Configuração Avançada

### Ambientes de Deploy

**Production:**
- Branch: `main`
- URL: https://chatcommerce-ai.vercel.app
- Environment variables: Production

**Preview:**
- Branches: PR branches
- URL: https://chatcommerce-ai-git-[branch]-[user].vercel.app
- Environment variables: Preview

### Proteção de Branches

Recomendado configurar em GitHub Settings → Branches:

```
Branch protection rules for 'main':
✅ Require pull request reviews before merging
✅ Require status checks to pass before merging
   - build
   - security
✅ Require branches to be up to date before merging
```

---

## 🐛 Troubleshooting

### CI falha com "Type check failed"
**Causa:** Erros de TypeScript  
**Solução:** Execute localmente `npm run type-check` e corrija erros

### Deploy falha com "VERCEL_TOKEN invalid"
**Causa:** Token expirado ou inválido  
**Solução:** Regenere token na Vercel e atualize secret no GitHub

### "VERCEL_ORG_ID not found"
**Causa:** Secret não configurado  
**Solução:** Execute `vercel link` e adicione o orgId aos secrets

### Preview deployment não aparece no PR
**Causa:** Workflow pode ter falhado  
**Solução:** Veja Actions tab no GitHub para logs detalhados

---

## 📋 Checklist de Setup

- [ ] Workflows criados em `.github/workflows/`
- [ ] VERCEL_TOKEN adicionado aos GitHub secrets
- [ ] VERCEL_ORG_ID adicionado aos GitHub secrets
- [ ] VERCEL_PROJECT_ID adicionado aos GitHub secrets
- [ ] Primeiro PR testado com preview deployment
- [ ] Deploy automático para main testado
- [ ] Status badges adicionados ao README (opcional)
- [ ] Branch protection configurado (recomendado)

---

## 🎯 Fluxo Completo

```
1. Developer cria branch
   ↓
2. Commits e push
   ↓
3. Cria PR
   ↓
4. CI executa (build, type-check, lint)
   ↓
5. Preview deployment criado
   ↓
6. Review e aprovação
   ↓
7. Merge para main
   ↓
8. Deploy automático para produção
   ↓
9. Comentário no commit com URL
```

---

## 📚 Recursos

**GitHub Actions Docs:**
https://docs.github.com/en/actions

**Vercel CLI Docs:**
https://vercel.com/docs/cli

**Vercel GitHub Integration:**
https://vercel.com/docs/git/vercel-for-github

---

## 🎉 Benefícios do CI/CD

✅ **Deploy automático** - Sem deploy manual  
✅ **Previews instantâneos** - Teste antes de mergear  
✅ **Type safety** - Erros detectados antes do merge  
✅ **Segurança** - Security scans automáticos  
✅ **Confiança** - Build testado antes de produção  
✅ **Velocidade** - Deploy em ~2 minutos  
✅ **Rastreabilidade** - Histórico completo de deploys  

---

**Última atualização:** ${new Date().toLocaleString('pt-BR')}
