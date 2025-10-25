#!/bin/bash
set -e

echo "📝 Atualizando README no GitHub..."

cd chatcommerce-ai

# Add README
git add README.md

# Commit
git commit -m "docs: Add comprehensive README with setup instructions

- Complete project documentation
- Installation guide
- Architecture overview
- Database schema details
- Performance metrics
- Security features
- Deployment instructions" || echo "⚠️  No changes to commit"

# Push usando token (será solicitado via script Node.js)
cd ..
node git-push-to-github.mjs

echo "✅ README atualizado no GitHub!"
