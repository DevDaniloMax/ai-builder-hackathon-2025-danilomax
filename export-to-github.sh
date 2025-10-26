#!/bin/bash

# Script de Exportação para GitHub
# Repositório: https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax.git

echo "🚀 Exportando Ana Clara para GitHub..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se tem token
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}❌ GITHUB_TOKEN não encontrado!${NC}"
    echo ""
    echo "Por favor, execute primeiro:"
    echo "  export GITHUB_TOKEN=seu_token_aqui"
    echo ""
    echo "Ou crie uma Secret no Replit chamada GITHUB_TOKEN"
    exit 1
fi

# Passo 1: Remover lock
echo -e "${YELLOW}🔓 Removendo lock do git...${NC}"
rm -f .git/index.lock

# Passo 2: Verificar status
echo -e "${YELLOW}📊 Verificando status...${NC}"
git status

# Passo 3: Adicionar novos arquivos
echo -e "${YELLOW}📝 Adicionando novos arquivos...${NC}"
git add README.md ana-clara-requirements.md EXPORT_GITHUB.md export-to-github.sh 2>/dev/null || true

# Passo 4: Commit (se houver mudanças)
echo -e "${YELLOW}💾 Fazendo commit...${NC}"
git commit -m "Add: Documentação completa e scripts de exportação" 2>/dev/null || echo "Sem mudanças para commit"

# Passo 5: Adicionar remote
echo -e "${YELLOW}🔗 Configurando repositório remoto...${NC}"
git remote remove github 2>/dev/null || true
git remote add github https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax.git

# Passo 6: Push para GitHub
echo -e "${YELLOW}⬆️  Enviando commits para GitHub...${NC}"
git push https://DevDaniloMax:$GITHUB_TOKEN@github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax.git main --force

# Verificar sucesso
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ SUCESSO!${NC}"
    echo ""
    echo "🎉 Todos os commits foram exportados para:"
    echo "   https://github.com/DevDaniloMax/ai-builder-hackathon-2025-danilomax"
    echo ""
    echo "📊 Total de commits exportados: $(git rev-list --count main)"
    echo ""
else
    echo ""
    echo -e "${RED}❌ ERRO ao fazer push${NC}"
    echo ""
    echo "Verifique:"
    echo "  1. Token do GitHub está correto"
    echo "  2. Você tem permissão no repositório"
    echo "  3. O repositório existe"
    exit 1
fi
