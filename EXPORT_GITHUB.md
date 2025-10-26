# 🚀 Guia: Exportar para GitHub

## Repositório Destino
**URL**: https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax.git

---

## Método 1: Interface Git do Replit (Mais Fácil) ⭐

### Passo a Passo:

1. **Abra a aba Git**
   - Clique no ícone de "Tools" na barra lateral esquerda
   - Clique no "+" para adicionar ferramentas
   - Selecione "Git"

2. **Configure o Repositório Remoto**
   - Na interface Git, procure por "Remote"
   - Adicione: `https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax.git`

3. **Faça o Push**
   - Clique em "Push" na interface
   - Autentique com sua conta GitHub quando solicitado
   - ✅ Pronto! Todos os commits serão enviados

---

## Método 2: Shell/Terminal do Replit

### 🔐 Passo 1: Criar Token GitHub

1. Vá em: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Classic"
3. Selecione permissões: `repo` (todas)
4. Gere e **COPIE** o token (você não verá novamente!)

### 📝 Passo 2: Executar Comandos

Abra o **Shell** do Replit e execute:

```bash
# 1. Remover lock do git (se necessário)
rm -f .git/index.lock

# 2. Verificar status atual
git status

# 3. Adicionar todos os arquivos novos (se houver)
git add README.md ana-clara-requirements.md EXPORT_GITHUB.md

# 4. Fazer commit dos novos arquivos (se houver)
git commit -m "Add: Documentação completa do projeto"

# 5. Adicionar o repositório remoto do GitHub
git remote add github https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax.git

# 6. Fazer push de TODOS os commits
# Substitua <SEU_TOKEN> pelo token que você copiou
git push https://DevDaniloMax:<SEU_TOKEN>@github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax.git main --force
```

### ⚡ Comando Simplificado (Tudo de Uma Vez):

```bash
# Cole este comando de uma vez (substitua <SEU_TOKEN>)
rm -f .git/index.lock && \
git add -A && \
git commit -m "Add: Documentação e configuração completa" || true && \
git remote add github https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax.git 2>/dev/null || true && \
git push https://DevDaniloMax:<SEU_TOKEN>@github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax.git main --force
```

---

## Método 3: Usar Secrets do Replit (Mais Seguro) 🔒

### Passo 1: Adicionar Secret

1. Na barra lateral do Replit, clique em "Tools" → "Secrets"
2. Adicione uma nova secret:
   - **Nome**: `GITHUB_TOKEN`
   - **Valor**: seu token do GitHub

### Passo 2: Executar no Shell

```bash
# Usar o token da secret
git push https://DevDaniloMax:$GITHUB_TOKEN@github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax.git main --force
```

---

## 📊 O que será exportado?

### ✅ Todos os Commits (30+ commits):

```
✓ Add product requirements for a conversational shopping assistant
✓ Exclude advertisements from specific marketplaces
✓ Exclude Shopee from product search results
✓ Improve the accuracy and relevance of search results
✓ Improve product display format for better user experience
✓ Improve web search reliability with retry mechanism
✓ Improve conversational context management
✓ Add conversational shopping assistant
✓ Simplify lead capture to only require name and phone
✓ Improve product category segmentation
✓ Update assistant persona to Brazilian sales assistant
✓ Update shopping assistant to Portuguese interface
✓ Refine product search by filtering irrelevant pages
... e todos os outros commits
```

### ✅ Todos os Arquivos:

```
✓ README.md (Documentação completa)
✓ ana-clara-requirements.md (Product Requirements)
✓ Todo o código fonte (client/, server/, shared/)
✓ Configurações (package.json, tsconfig.json, etc)
✓ Database schemas (shared/schema.ts)
✓ Componentes UI (client/src/components/)
✓ Lógica de negócio (server/routes.ts, server/lib/)
```

---

## 🐛 Solução de Problemas

### ❌ Erro: "index.lock exists"

```bash
rm -f .git/index.lock
```

### ❌ Erro: "Authentication failed"

- Verifique se copiou o token corretamente
- Certifique-se que o token tem permissão `repo`
- Tente gerar um novo token

### ❌ Erro: "remote already exists"

```bash
git remote remove github
git remote add github https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax.git
```

### ❌ Erro: "Updates were rejected"

Use `--force` para sobrescrever:

```bash
git push https://DevDaniloMax:<TOKEN>@github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax.git main --force
```

---

## ✅ Verificação

Após o push, verifique em:
**https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax**

Você deve ver:
- ✅ Todos os 30+ commits
- ✅ README.md formatado
- ✅ Toda a estrutura de arquivos
- ✅ Histórico completo

---

## 🎯 Próximos Passos (Opcional)

### 1. Configurar GitHub Pages (se quiser publicar o README)

```bash
# No GitHub, vá em Settings → Pages
# Selecione: Deploy from branch → main → root
```

### 2. Adicionar Badge do GitHub ao README

```markdown
[![GitHub](https://img.shields.io/badge/GitHub-ana--clara-181717?style=for-the-badge&logo=github)](https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax)
```

### 3. Criar Release Tag

```bash
git tag -a v1.0.0 -m "Release: Ana Clara MVP"
git push github v1.0.0 --force
```

---

## 📞 Precisa de Ajuda?

Se encontrar problemas:
1. Copie a mensagem de erro
2. Me envie aqui no chat
3. Vou te ajudar a resolver!

---

**Boa sorte! 🚀**
