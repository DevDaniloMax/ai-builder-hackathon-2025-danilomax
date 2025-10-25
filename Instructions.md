# Análise Profunda: Problemas com Imagens e Preços dos Produtos

## 🔍 Investigação Completa do Código

### Arquivos Analisados
1. `server/routes.ts` - Sistema prompt da Ana Clara e tools
2. `server/lib/web.ts` - Funções de busca e fetch de páginas
3. `client/src/components/ProductCarousel.tsx` - Exibição dos produtos

---

## 🐛 Problemas Identificados

### PROBLEMA 1: Ana Clara não está retornando produtos
**Evidência nos logs:**
```
[Tool: searchWeb] Query: "tenis esportivo site:shopee.com.br"
[searchWeb] Found 5 results
[Query logged] "UM TENIS ESPORTIVO" - 17403ms - 0 products
```

**Análise:**
- Ana Clara faz `searchWeb` ✅
- Mas NÃO está chamando `fetchPage` ❌
- Não está montando o JSON com produtos ❌
- Retorna 0 produtos ❌

**Causa Raiz:**
O prompt tem **instruções contraditórias**:
- Diz "extraia manualmente" 
- Diz "NÃO use extractProducts"
- Mas não explica COMO extrair manualmente do texto

### PROBLEMA 2: Imagens não aparecem
**Evidência:**
No teste, apenas 2 de 3 produtos mostram imagens (1 mostra placeholder)

**Análise do Fluxo:**

1. **Jina Reader retorna texto puro:**
   ```javascript
   // server/lib/web.ts linha 84
   headers: { 'Accept': 'text/plain' }
   ```
   - Retorna APENAS texto (sem HTML)
   - URLs de imagens podem estar truncadas ou malformadas
   - Limite de 12.000 caracteres pode cortar informações

2. **Extração manual não está funcionando:**
   - Ana Clara deveria procurar URLs no texto
   - Mas o prompt não explica o padrão exato
   - Padrões de imagem variam por site:
     - Shopee: `down-br.img.susercontent.com/file/...`
     - Mercado Livre: `http2.mlstatic.com/D_NQ_NP_...`
     - Amazon: `m.media-amazon.com/images/I/...`

### PROBLEMA 3: Preços incorretos
**Análise:**
- Jina Reader trunca conteúdo (12k chars)
- Preços podem estar fora do trecho capturado
- Ana Clara está extraindo manualmente (mais erro)
- Tool `extractProducts` (GPT-4o-mini) seria mais preciso mas está DESABILITADO no prompt

### PROBLEMA 4: Conflito de arquitetura

**Duas abordagens conflitantes:**

**Abordagem A** (Atual no prompt):
```
1. searchWeb
2. fetchPage (cada URL)
3. Extrair MANUALMENTE nome, preço, imagem
4. Montar JSON
```
❌ Complexo, propenso a erros, Ana Clara não está fazendo

**Abordagem B** (Existe mas desabilitada):
```
1. searchWeb
2. fetchPage (cada URL)
3. extractProducts (usa GPT-4o-mini para extrair)
4. Retornar produtos já estruturados
```
✅ Mais confiável, usa IA especializada, já implementado

---

## 📊 Comparação das Soluções

| Aspecto | Extração Manual | extractProducts Tool |
|---------|-----------------|----------------------|
| **Precisão** | Baixa (Ana Clara tenta adivinhar) | Alta (GPT-4o-mini especializado) |
| **Imagens** | Difícil (padrões variam) | Melhor (IA encontra URLs) |
| **Preços** | Propenso a erros | Mais confiável |
| **Complexidade** | Alta (muitas instruções) | Baixa (1 tool call) |
| **Taxa de sucesso** | 0% (logs mostram) | Não testado ainda |

---

## 🔧 Plano de Ação

### SOLUÇÃO RECOMENDADA: Usar extractProducts

**Justificativa:**
1. Tool já existe e está implementada
2. GPT-4o-mini é especializado em extração estruturada
3. Mais confiável que instruções manuais
4. Menos tokens no prompt da Ana Clara

### Implementação em 3 Etapas:

#### ETAPA 1: Simplificar o Prompt
**Arquivo:** `server/routes.ts`

**Mudanças:**
1. REMOVER instruções de extração manual
2. HABILITAR extractProducts no fluxo
3. Simplificar processo:
   ```
   1. searchWeb → pega URLs
   2. fetchPage → pega conteúdo de 2-3 produtos
   3. extractProducts → extrai estrutura
   4. Retorna JSON pronto
   ```

#### ETAPA 2: Melhorar extractProducts
**Arquivo:** `server/routes.ts` (linha 221-324)

**Melhorias necessárias:**
1. Mudar prompt de extração:
   - Focar em encontrar URLs de imagem
   - Priorizar preços em formato R$
   - Retornar preço como string (não number)

2. Adicionar padrões de busca de imagem:
   ```
   Procure URLs que contenham:
   - susercontent.com (Shopee)
   - mlstatic.com (Mercado Livre)
   - media-amazon.com (Amazon)
   - Terminam em .jpg, .png, .webp
   ```

#### ETAPA 3: Melhorar Jina Reader
**Arquivo:** `server/lib/web.ts`

**Opções:**
1. **Opção A:** Aumentar limite de caracteres
   - Mudar de 12.000 para 20.000
   - Mais chance de pegar imagens e preços

2. **Opção B:** Usar Jina com markdown
   - Mudar `Accept: text/plain` para `Accept: text/markdown`
   - Preserva mais estrutura (links, imagens)

3. **Opção C:** Headers adicionais
   - Adicionar `X-With-Images-Summary: true` (Jina feature)
   - Retorna URLs de imagens explicitamente

---

## 📝 Código das Mudanças

### MUDANÇA 1: Simplificar Prompt (server/routes.ts)

**Substituir seção de "COMO BUSCAR PRODUTOS":**

```typescript
   🔍 PROCESSO PARA BUSCAR PRODUTOS:
   
   1️⃣ Use searchWeb para encontrar produtos
   2️⃣ Escolha 2-3 URLs de produtos específicos (não listas)
   3️⃣ Para CADA URL, use fetchPage para pegar o conteúdo
   4️⃣ Use extractProducts passando o texto do fetchPage
   5️⃣ extractProducts retornará os produtos já estruturados
   6️⃣ Monte o JSON final e envie:
   
   \`\`\`json
   {"products":[{"name":"Produto","price":"R$ 99","url":"https://...","image":"https://...","site":"Site","emoji":"🥇"}]}
   \`\`\`
```

### MUDANÇA 2: Melhorar extractProducts prompt

**Linha 232-263, substituir prompt:**

```typescript
const extractionPrompt = `Você é especialista em extrair dados de produtos de páginas da web brasileiras.

INSTRUÇÕES CRÍTICAS:
- Extraia até 3 produtos do texto fornecido
- SEMPRE procure URLs de imagens no texto
- Preços devem estar em formato "R$ XX" (string, não número)
- Se não encontrar imagem, procure por:
  * URLs com susercontent.com (Shopee)
  * URLs com mlstatic.com (Mercado Livre)  
  * URLs com media-amazon.com (Amazon)
  * URLs terminando em .jpg, .png, .webp

Retorne JSON no formato:
{
  "products": [
    {
      "name": "Nome Exato do Produto",
      "price": "R$ 99",
      "image": "https://url-da-imagem.jpg",
      "url": "${sourceUrl}",
      "source": "nome-do-site.com"
    }
  ]
}

TEXTO PARA ANÁLISE:
${rawText.substring(0, 12000)}

URL DE ORIGEM: ${sourceUrl || 'unknown'}`;
```

### MUDANÇA 3: Melhorar Jina Reader (server/lib/web.ts)

**Linha 84-88, adicionar headers:**

```typescript
const response = await fetch(jinaUrl, {
  headers: {
    'Accept': 'text/plain',
    'X-With-Images-Summary': 'true',
    'X-With-Links-Summary': 'true',
  },
});
```

**Linha 98-100, aumentar limite:**

```typescript
// Truncate to 20k characters for better data capture
if (content.length > 20000) {
  content = content.substring(0, 20000);
}
```

---

## ✅ Resultado Esperado

Após as mudanças:

1. **Ana Clara** fará:
   - searchWeb ✅
   - fetchPage (2-3 produtos) ✅
   - extractProducts (automático) ✅
   - Retorna JSON com imagens e preços ✅

2. **Imagens** aparecerão porque:
   - extractProducts (GPT-4o-mini) é melhor em encontrar URLs
   - Jina retorna mais dados (20k chars + image summary)
   - Padrões de busca estão no prompt

3. **Preços** serão corretos porque:
   - extractProducts foca em formato R$
   - Mais texto capturado (20k chars)
   - IA especializada na extração

---

## 🚀 Ordem de Implementação

1. **ETAPA 1** (Crítica): Simplificar prompt + habilitar extractProducts
2. **ETAPA 2** (Importante): Melhorar prompt de extractProducts
3. **ETAPA 3** (Otimização): Melhorar Jina Reader

---

## 📈 Métricas de Sucesso

Após implementação, verificar:
- [ ] Ana Clara retorna produtos (não mais 0 products)
- [ ] Pelo menos 2 de 3 produtos têm imagens
- [ ] Preços no formato correto (R$ XX)
- [ ] Links diretos para produtos
- [ ] Tempo de resposta < 30 segundos

---

## 🎯 Próximos Passos

1. Implementar ETAPA 1 (mudanças no prompt)
2. Testar com "camisa preta" ou "tênis nike"
3. Verificar logs se extractProducts está sendo chamado
4. Implementar ETAPA 2 e 3 se necessário
5. Ajustar baseado nos resultados

---

*Documento criado em: 25/10/2025*
*Última atualização: 25/10/2025 20:36*
