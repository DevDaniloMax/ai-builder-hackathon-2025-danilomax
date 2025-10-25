# 🚀 Push CI/CD para GitHub - Guia Manual

## ⚠️ Git Bloqueado no Replit

O sistema Replit bloqueia operações git automáticas. Você precisa fazer o push manualmente.

---

## 📋 Arquivos Criados

✅ **Workflows GitHub Actions:**
- `chatcommerce-ai/.github/workflows/ci.yml` - Build & Type Check
- `chatcommerce-ai/.github/workflows/deploy.yml` - Deploy automático
- `chatcommerce-ai/.github/workflows/preview.yml` - Preview deployments
- `chatcommerce-ai/.github/CODEOWNERS` - Code review automation

✅ **Documentação:**
- `CICD_SETUP.md` - Guia completo de CI/CD

---

## 🔧 Como Fazer o Push (2 minutos)

### Opção 1: Via Replit Shell

```bash
cd chatcommerce-ai

# Configure git
git config user.name "DevDaniloMax"
git config user.email "devdanilomax@users.noreply.github.com"

# Adicione os workflows
git add .github/

# Commit
git commit -m "ci: Add GitHub Actions CI/CD workflows

- Add CI workflow for build verification
- Add deploy workflow for Vercel
- Add preview workflow for PRs
- Add CODEOWNERS file"

# Push para GitHub
git push origin main
```

### Opção 2: Via Git Local (Desktop)

Se você tem o repositório clonado localmente:

```bash
# Clone ou pull
git clone https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax.git
cd ai-builder-hackathon-2025-danilomax

# Copie os arquivos do Replit manualmente ou baixe:
# - chatcommerce-ai/.github/workflows/ci.yml
# - chatcommerce-ai/.github/workflows/deploy.yml  
# - chatcommerce-ai/.github/workflows/preview.yml
# - chatcommerce-ai/.github/CODEOWNERS

# Commit e push
git add chatcommerce-ai/.github/
git commit -m "ci: Add GitHub Actions CI/CD workflows"
git push origin main
```

---

## 🔑 Configurar Secrets no GitHub (3 minutos)

Após fazer o push, configure os secrets:

### 1. Acesse GitHub Secrets

https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax/settings/secrets/actions

### 2. Adicione 3 Secrets

#### Secret 1: VERCEL_TOKEN
```
Nome: VERCEL_TOKEN
Valor: [Token da Vercel - crie em https://vercel.com/account/tokens]
```

**Como obter:**
1. Acesse: https://vercel.com/account/tokens
2. Clique "Create Token"
3. Nome: "ChatCommerce CI/CD"
4. Scope: Full Account
5. Copie o token e cole no GitHub secret

#### Secret 2: VERCEL_ORG_ID
```
Nome: VERCEL_ORG_ID
Valor: [ID da sua org Vercel]
```

**Como obter:**

**Método A - Via Vercel CLI (recomendado):**
```bash
cd chatcommerce-ai
npx vercel link
cat .vercel/project.json | grep orgId
```

**Método B - Via Dashboard:**
1. Vercel Dashboard → Settings → General
2. Copie o "Team ID" ou "User ID"

#### Secret 3: VERCEL_PROJECT_ID
```
Nome: VERCEL_PROJECT_ID
Valor: [ID do projeto Vercel]
```

**Como obter:**

**Método A - Via Vercel CLI (recomendado):**
```bash
cd chatcommerce-ai
npx vercel link
cat .vercel/project.json | grep projectId
```

**Método B - Via Dashboard:**
1. Vercel → Projeto → Settings → General
2. Copie o "Project ID"

---

## ✅ Verificar que funcionou

### 1. Workflows aparecem no GitHub

Acesse: https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax/actions

Você deve ver:
- ✅ CI - Build & Type Check
- ✅ Deploy to Vercel
- ✅ Preview Deployment

### 2. Testar CI Workflow

Faça qualquer commit:
```bash
echo "# Test" >> README.md
git add README.md
git commit -m "test: trigger CI"
git push origin main
```

Verifique em Actions que o workflow executou.

### 3. Testar Deploy Workflow

Após push para main, o deploy automático deve:
1. ✅ Buildar na Vercel
2. ✅ Deploy para produção
3. ✅ Comentar no commit com URL

### 4. Testar Preview Deployment

1. Crie uma branch: `git checkout -b test/preview`
2. Faça commit: `git commit -m "test" --allow-empty`
3. Push: `git push origin test/preview`
4. Crie PR no GitHub
5. ✅ Preview deployment deve aparecer nos comentários

---

## 🔍 Troubleshooting

### "git push" pede senha
**Solução:** Use Personal Access Token como senha
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Selecione scopes: `repo`, `workflow`
4. Use o token como senha

### Workflows não executam
**Causa:** Secrets não configurados ou workflows não commitados
**Solução:** 
1. Verifique que arquivos `.yml` estão no GitHub
2. Verifique secrets em Settings → Secrets → Actions

### Deploy workflow falha
**Causa:** VERCEL_TOKEN, VERCEL_ORG_ID ou VERCEL_PROJECT_ID incorretos
**Solução:** 
1. Verifique logs em Actions tab
2. Reconfigure secrets com valores corretos

---

## 📊 O que Cada Workflow Faz

### CI - Build & Type Check (`ci.yml`)
**Executa em:** Cada push e PR  
**Faz:**
- ✅ Type checking (TypeScript)
- ✅ Linting (ESLint)
- ✅ Build verification
- ✅ Security audit

### Deploy to Vercel (`deploy.yml`)
**Executa em:** Push para `main`  
**Faz:**
- ✅ Build na Vercel
- ✅ Deploy para produção
- ✅ Comenta no commit com URL

### Preview Deployment (`preview.yml`)
**Executa em:** Pull Requests  
**Faz:**
- ✅ Cria preview deployment
- ✅ Comenta no PR com URL única
- ✅ Atualiza a cada novo commit no PR

---

## 🎯 Checklist Completo

- [ ] Push dos workflows para GitHub (via shell ou local)
- [ ] VERCEL_TOKEN adicionado aos secrets
- [ ] VERCEL_ORG_ID adicionado aos secrets
- [ ] VERCEL_PROJECT_ID adicionado aos secrets
- [ ] CI workflow executou com sucesso
- [ ] Deploy workflow executou e deployou
- [ ] Preview workflow testado em PR (opcional)

---

## 🎉 Resultado Final

Após configuração completa, você terá:

✅ **CI/CD Totalmente Automatizado**
- Builds verificados automaticamente
- Deploy automático em cada merge
- Previews para cada PR
- Type safety garantido
- Security scanning ativo

✅ **Fluxo de Trabalho Moderno**
```
Código → Push → CI Check → PR → Review → Merge → Deploy Automático
```

✅ **Zero Deploy Manual**
- Push para main = Deploy automático
- PR aberto = Preview automático
- Comentários automáticos com URLs

---

**📘 Guia detalhado:** Veja `CICD_SETUP.md` para mais informações

**Última atualização:** ${new Date().toLocaleString('pt-BR')}
