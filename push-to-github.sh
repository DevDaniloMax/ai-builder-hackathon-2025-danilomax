#!/bin/bash
set -e

echo "🚀 Exportando ChatCommerce AI para GitHub..."

cd chatcommerce-ai

# Inicializar git se necessário
if [ ! -d .git ]; then
  echo "📝 Inicializando repositório Git..."
  git init
  git branch -M main
fi

# Configurar usuário git
git config user.name "DevDaniloMax"
git config user.email "devdanilomax@users.noreply.github.com"

# Adicionar todos os arquivos
echo "📦 Adicionando arquivos..."
git add .

# Criar commit
echo "💾 Criando commit..."
git commit -m "feat: ChatCommerce AI - Complete implementation

- Next.js 15 with App Router
- AI SDK with streaming responses
- 3 AI tools: searchWeb, fetchPage, extractProducts
- OpenAI GPT-4o-mini for product extraction
- Tavily API for web search
- Jina Reader for content fetching
- Supabase PostgreSQL database
- Rate limiting and timeout protection
- Smart caching system
- Full TypeScript implementation
- Responsive chat UI with Tailwind CSS

Built for AI Builder Hackathon 2025" || echo "⚠️  Commit já existe ou sem mudanças"

# Adicionar remote
echo "🔗 Configurando remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax.git

echo "✅ Repositório configurado!"
echo ""
echo "📊 Status do repositório:"
git status --short
echo ""
echo "📝 Últimos commits:"
git log --oneline -n 3 || echo "Primeiro commit"
echo ""
echo "🔗 Remote configurado:"
git remote -v
