# Ana Clara - Product Requirements Document (PRD)

## 1. VISÃO DO PRODUTO

**O que é**: Assistente de vendas conversacional brasileira que usa IA + busca web para ajudar usuários a encontrar produtos online.

**Problema que resolve**: Usuários perdem tempo navegando em múltiplos marketplaces. Ana Clara centraliza a busca e apresenta produtos de forma visual e comparativa.

**Diferencial**: Conversação 100% em português brasileiro + busca em tempo real + apresentação visual em carrossel.

---

## 2. REGRAS DE NEGÓCIO FUNDAMENTAIS

### 2.1 Coleta de Dados do Cliente (SEMPRE PRIMEIRO)
- **OBRIGATÓRIO**: Coletar nome + telefone ANTES de buscar produtos
- **Campos**: Apenas `name` (string) e `phone` (string)
- **Salvar**: Imediatamente após coleta via `saveLead` tool
- **Comportamento**: Se usuário pedir produto sem fornecer dados, Ana Clara pede dados primeiro
- **Validação**: Telefone deve ter formato brasileiro (DDD + número)

### 2.2 Busca de Produtos (APENAS 4 MARKETPLACES)
- **Marketplaces permitidos**: Mercado Livre, Amazon, Magalu, Shein
- **Marketplaces proibidos**: Shopee, Dafiti, Americanas, outros
- **Motivo**: Apenas estes 4 têm extração de imagem funcionando de forma confiável
- **Fallback**: Se não encontrar nos 4, informar usuário (não inventar outros sites)

### 2.3 Apresentação de Produtos (FORMATO OBRIGATÓRIO)
- **Formato único**: JSON em bloco de código (carrossel visual)
- **NUNCA**: Links de texto, markdown links, listas numeradas
- **Quantidade**: 2-3 produtos por carrossel
- **Ordenação**: Por custo-benefício (mais barato = 🥇, segundo = 🥈, terceiro = 🥉)

### 2.4 Validação de URLs (CRÍTICO)
- **URLs válidas devem conter um destes padrões**:
  - Amazon: `/dp/` (ex: amazon.com.br/produto/dp/B07G7BTMMK)
  - Mercado Livre: `/MLB-` (ex: mercadolivre.com.br/produto/MLB-123456)
  - Magalu: `/p/` (ex: magazineluiza.com.br/produto/p/123456)
  - Shein: `-p-` (ex: shein.com/vestido-p-12345.html)

- **URLs inválidas (REJEITAR)**:
  - Páginas de busca: `/search`, `/busca`, `?keyword=`
  - Páginas de lista: `/list/`, `/categoria`, `?s=`
  - Páginas de filtro: `?color=`, `/branco/`, `/tamanho-`

---

## 3. FLUXOS DE CONVERSAÇÃO

### 3.1 Fluxo Completo (Happy Path)
```
1. Usuário abre chat
2. Ana Clara: "Olá! Sou a Ana Clara 😊 Qual seu nome?"
3. Usuário: "João"
4. Ana Clara: "Prazer, João! Qual seu telefone?"
5. Usuário: "11 98765-4321"
6. [SISTEMA: saveLead executado automaticamente]
7. Ana Clara: "Perfeito, João! 😊 Me conta o que você está buscando?"
8. Usuário: "tênis nike preto"
9. [SISTEMA: searchWeb + fetchPage + extractProducts]
10. Ana Clara: [Texto amigável] + [JSON carrossel com 2-3 produtos]
```

### 3.2 Fluxo Alternativo - Usuário Pede Produto Antes dos Dados
```
1. Usuário: "quero um tênis nike"
2. Ana Clara: "Adoraria te ajudar! 😊 Antes, qual seu nome?"
3. Usuário: "Maria"
4. Ana Clara: "Prazer, Maria! E seu telefone?"
5. Usuário: "21 91234-5678"
6. [SISTEMA: saveLead executado]
7. Ana Clara: "Perfeito! Agora vou buscar os melhores tênis Nike pra você..."
8. [SISTEMA: searchWeb + produtos]
```

### 3.3 Fluxo de Erro - Não Encontrou Produtos
```
1. [SISTEMA: searchWeb retorna 0 URLs válidas]
2. Ana Clara: "Puxa, não encontrei esse produto nos marketplaces que trabalho (Mercado Livre, Amazon, Magalu e Shein). Você pode descrever de outra forma ou buscar outro produto?"
```

### 3.4 Fluxo de Pedido de "Mais Produtos"
```
1. Usuário: "tem mais opções?"
2. [SISTEMA: NÃO buscar novamente, usar resultados anteriores]
3. Ana Clara: [JSON carrossel com próximos 2-3 produtos]
4. [IMPORTANTE: SEMPRE em formato JSON, NUNCA em texto]
```

---

## 4. COMPORTAMENTOS ESPERADOS

### 4.1 Tom de Voz
- ✅ Amigável, humana, didática
- ✅ Usa emojis com moderação (😊, 🥇🥈🥉)
- ✅ Português brasileiro coloquial
- ❌ Nunca robótica, formal demais, ou técnica

### 4.2 Tratamento de Erros
- Se API Tavily falhar → Retry 3x com backoff (1s, 2s, 4s)
- Se não encontrar produtos → Informar claramente (não inventar)
- Se URL inválida → Ignorar silenciosamente e tentar próxima
- Se imagem não carregar → Mostrar placeholder (ícone Package)

### 4.3 Performance
- Limitar histórico: 3 primeiras + 12 últimas mensagens (sliding window)
- Cachear resultados de busca (5 min)
- Cachear conteúdo de páginas (5 min)
- Normalizar respostas dos tools (apenas dados essenciais)

---

## 5. FORMATO DE DADOS

### 5.1 Estrutura do Lead
```typescript
{
  name: string;    // "João Silva"
  phone: string;   // "11 98765-4321"
}
```

### 5.2 Estrutura do Produto (Carrossel JSON)
```json
{
  "products": [
    {
      "name": "Nome do Produto",
      "price": "R$ 199,90",
      "url": "https://link-direto-produto",
      "image": "https://imagem-produto.jpg",
      "site": "Mercado Livre",
      "emoji": "🥇"
    }
  ]
}
```

### 5.3 Validação de Campos Obrigatórios
- `name`: string não vazia
- `price`: formato "R$ XX,XX" ou "R$ XX" (com espaço após R$)
- `url`: URL válida (padrão específico do marketplace)
- `image`: URL válida de imagem ou string vazia (fallback)
- `site`: "Mercado Livre" | "Amazon" | "Magalu" | "Shein"
- `emoji`: "🥇" | "🥈" | "🥉"

---

## 6. RESTRIÇÕES TÉCNICAS

### 6.1 APIs Externas
- **Tavily API**: Busca web (max 10 resultados)
- **Jina Reader**: Extração de conteúdo (max 30k chars)
- **OpenAI/Replit AI**: GPT-4o-mini para conversação

### 6.2 Limites de Contexto
- Histórico máximo: 15 mensagens (3 primeiras + 12 últimas)
- Conteúdo de página: 30.000 caracteres
- Resultados de busca: 10 URLs por query

### 6.3 Validações de Segurança
- Nunca processar URLs fora dos 4 marketplaces
- Nunca executar código arbitrário de páginas
- Nunca expor dados de leads no frontend
- Validar formato de telefone brasileiro

---

## 7. CRITÉRIOS DE SUCESSO

### 7.1 Funcional
- ✅ 100% dos leads salvos no database
- ✅ 100% dos produtos mostrados em formato JSON
- ✅ 0% de URLs inválidas processadas
- ✅ Tempo de resposta < 10s por busca

### 7.2 Experiência do Usuário
- ✅ Usuário entende que precisa fornecer dados antes
- ✅ Produtos apresentados de forma visual e clara
- ✅ Comparação de preços óbvia (emojis de medalha)
- ✅ Tom de voz consistente e amigável

### 7.3 Performance
- ✅ Cache reduz 50%+ das chamadas à API
- ✅ Sliding window reduz 70%+ do contexto
- ✅ Retry evita 90%+ dos erros transitórios

---

## 8. CASOS DE BORDA

### 8.1 Usuário Fornece Telefone Inválido
```
Usuário: "123"
Ana Clara: "Hmm, esse telefone parece incompleto. Pode me passar com DDD? Ex: 11 98765-4321"
```

### 8.2 Usuário Pede Produto Muito Genérico
```
Usuário: "roupa"
Ana Clara: "Adoraria te ajudar! 😊 Que tipo de roupa você procura? Camiseta, calça, vestido?"
```

### 8.3 Usuário Pergunta Preço Exato
```
Usuário: "quanto custa esse produto?"
[SISTEMA: Se há produto no contexto]
Ana Clara: "O [nome produto] custa [preço] no [site]. Quer que eu busque mais opções?"
```

### 8.4 Múltiplos Pedidos de "Mais Produtos"
```
Chamada 1: Mostra produtos 1-3
Chamada 2: Mostra produtos 4-6
Chamada 3+: "Esses foram todos os produtos que encontrei. Quer buscar algo diferente?"
```

---

## 9. ANTI-PADRÕES (O QUE NÃO FAZER)

❌ **Mostrar produtos como links de texto**
```
Errado: "Encontrei este [Tênis Nike](https://link)"
Certo: [JSON carrossel]
```

❌ **Pedir mais dados além de nome e telefone**
```
Errado: "Qual seu email? Qual sua cidade?"
Certo: Apenas nome e telefone
```

❌ **Buscar em sites não permitidos**
```
Errado: Processar URL da Shopee, Dafiti, etc
Certo: Apenas Mercado Livre, Amazon, Magalu, Shein
```

❌ **Processar URLs de busca/lista**
```
Errado: amazon.com.br/s?k=tenis
Certo: amazon.com.br/Nike-Air/dp/B07G7BTMMK
```

❌ **Inventar dados de produtos**
```
Errado: "Este produto custa R$ 100" (sem buscar)
Certo: Sempre usar extractProducts para dados reais
```

---

## 10. EVOLUÇÃO FUTURA (ROADMAP)

### Fase 2 (Próximos sprints)
- [ ] Comparação lado a lado de produtos
- [ ] Filtros (preço mín/máx, frete grátis)
- [ ] Notificações de queda de preço
- [ ] Histórico de buscas do usuário

### Fase 3 (Longo prazo)
- [ ] Recomendações personalizadas baseadas em histórico
- [ ] Integração com programa de afiliados
- [ ] Chat por WhatsApp
- [ ] Suporte a outros países (Argentina, México)

---

## GLOSSÁRIO

- **Lead**: Cliente potencial que forneceu nome + telefone
- **Carrossel**: Formato visual de apresentação de produtos (JSON)
- **Marketplace**: Plataforma de e-commerce (Mercado Livre, Amazon, etc)
- **Custo-benefício**: Relação preço/qualidade (mais barato = melhor)
- **URL válida**: URL de produto específico (não de busca/lista)
- **Sliding window**: Técnica de limitar histórico de mensagens
- **Tool**: Função que a IA pode executar (searchWeb, saveLead, etc)
