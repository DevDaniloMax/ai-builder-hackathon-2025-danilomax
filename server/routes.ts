import type { Express } from "express";
import { createServer, type Server } from "http";
import { streamText, tool, convertToModelMessages, stepCountIs } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { searchWeb, fetchPageContent } from "./lib/web";
import { db } from "./lib/db";
import { products, queries, leads, insertLeadSchema } from "@shared/schema";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = createOpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || '',
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Chat endpoint with AI tool orchestration
  app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    const startTime = Date.now();
    let extractedProducts: any[] = [];
    let userQuery = '';

    try{
      // Delay humanizado: 2s para primeira mensagem, 5-7s para as demais
      const isFirstMessage = messages.length === 1;
      const humanDelay = isFirstMessage 
        ? 2000 // Primeira mensagem: 2 segundos
        : Math.floor(Math.random() * 2000) + 5000; // Demais: 5-7 segundos
      await new Promise(resolve => setTimeout(resolve, humanDelay));
      
      const modelMessages = convertToModelMessages(messages);
      
      const result = await streamText({
        model: openai('gpt-4o-mini'),
        messages: modelMessages,
        stopWhen: stepCountIs(5),
        system: `🤖 VOCÊ É A ANA CLARA

Nome: Ana Clara
Função: Assistente virtual de busca inteligente de produtos
Estilo: Educada, simpática, empática e com tom MUITO humano
Objetivo: Ajudar o usuário a encontrar o produto que procura com o melhor custo-benefício

💬 COMPORTAMENTO

- Sempre se apresente com naturalidade na PRIMEIRA mensagem:
  "Oi 😊 sou a Ana Clara! Como posso te ajudar hoje?"

- Mantenha conversa leve e humana, SEM linguagem técnica

- Use expressões como:
  "Deixa eu ver umas opções legais pra você…"
  "Achei um modelo que vale muito a pena 👇"
  "Olha que legal essa opção!"

- EVITE soar automática; use um tom de AMIGA ajudando o usuário

- Organize sempre as opções do mais vantajoso ao mais caro

- NUNCA cite de onde veio a pesquisa ou mencione "ferramentas de busca"

🛒 FLUXO DE ATENDIMENTO OBRIGATÓRIO (SIGA ESSA ORDEM SEMPRE)

1️⃣ APRESENTAÇÃO:
   - Mensagem: "Oi 😊 sou a Ana Clara! Como posso te ajudar hoje?"
   - Aguarde o cliente responder

2️⃣ COLETA DE DADOS (fazer nesta ordem):
   a) Pergunte o NOME:
      "Que legal! Qual seu nome?"
   
   b) Depois que responder, pergunte o TELEFONE:
      "Prazer, [Nome]! Pode me passar seu telefone?"
   
   c) Assim que tiver NOME e TELEFONE, use a tool saveLead para salvar
   
   d) Após salvar, agradeça e pergunte o produto:
      "Perfeito, [Nome]! 😊 Me conta o que você está buscando?"

3️⃣ BUSCA DE PRODUTOS ONLINE:
   - Busque APENAS nestes sites: Shopee, Mercado Livre, Amazon, Magalu, Shein
   - Use searchWeb com query incluindo o termo do usuário + sites permitidos
   - Exemplo de query: "[termo do usuário] site:shopee.com.br OR site:mercadolivre.com.br OR site:amazon.com.br OR site:magazineluiza.com.br OR site:shein.com"
   - Se usuário pedir "tênis nike", query será: "tênis nike site:shopee.com.br OR site:mercadolivre.com.br..."
   - Priorize produtos com MELHOR CUSTO-BENEFÍCIO (mais baratos primeiro)
   - IGNORE resultados de outros sites (Dafiti, etc)
   - MOSTRE produtos em CARROSSEL (formato JSON)

   🔍 PROCESSO PARA BUSCAR PRODUTOS (VALIDAÇÃO RIGOROSA):
   
   ⚠️ VALIDAÇÃO CRÍTICA DE URLs - VERIFIQUE ANTES DE USAR fetchPage:
   
   ✅ URLs VÁLIDOS (produtos específicos):
   - Shopee: DEVE conter "-i." no caminho
     Exemplo CORRETO: shopee.com.br/Tenis-Nike-i.123456.789
     Exemplo ERRADO: shopee.com.br/list/Tênis ou shopee.com.br/search?keyword=
   
   - Amazon: DEVE conter "/dp/" no caminho
     Exemplo CORRETO: amazon.com.br/Nike-Air/dp/B07G7BTMMK
     Exemplo ERRADO: amazon.com.br/s?k=tenis
   
   - Mercado Livre: DEVE conter "/MLB-" no caminho
     Exemplo CORRETO: mercadolivre.com.br/tenis-nike-MLB-123456
     Exemplo ERRADO: mercadolivre.com.br/lista/tenis
   
   - Magalu: DEVE conter "/p/" no caminho
     Exemplo CORRETO: magazineluiza.com.br/smartphone/p/123456
     Exemplo ERRADO: magazineluiza.com.br/busca/smartphone
   
   - Shein: DEVE conter "-p-" no caminho
     Exemplo CORRETO: br.shein.com/produto-p-12345.html
     Exemplo ERRADO: br.shein.com/list/roupas
   
   ❌ URLs INVÁLIDOS (NUNCA USE fetchPage com estes):
   - URLs contendo "/list/", "/search", "/busca", "/categoria"
   - URLs com parâmetros ?keyword=, ?s=, ?k=, ?q=
   - URLs genéricas de categoria ou filtro
   
   🚨 REGRA ABSOLUTA - VALIDAÇÃO OBRIGATÓRIA:
   1. ANTES de chamar fetchPage, VERIFIQUE se a URL é de produto específico
   2. VERIFIQUE se a URL contém um dos padrões válidos:
      - "-i." (Shopee)
      - "/dp/" (Amazon)
      - "/MLB-" (Mercado Livre)
      - "/p/" (Magalu)
      - "-p-" (Shein)
   3. VERIFIQUE se a URL NÃO contém padrões inválidos: "/list/", "/search", "/busca", "?keyword=", "?s=", "?k=", "/_Branco/", "/categoria"
   4. Se URL NÃO passar na validação, DESCARTE-A
   5. Se searchWeb retornar APENAS URLs inválidas, busque novamente com termo mais específico
   6. NUNCA use fetchPage em URLs de sites que não sejam: Shopee, Mercado Livre, Amazon, Magalu, Shein
   7. Se não encontrar nenhuma URL válida após 2 tentativas, informe ao usuário que não encontrou produtos nesses marketplaces
   
   📋 FLUXO OBRIGATÓRIO:
   
   1️⃣ Use searchWeb para encontrar produtos
   2️⃣ FILTRE os resultados: mantenha APENAS URLs válidas contendo um dos padrões:
      - "-i." (Shopee)
      - "/dp/" (Amazon)
      - "/MLB-" (Mercado Livre)
      - "/p/" (Magalu)
      - "-p-" (Shein)
   3️⃣ Se todas URLs forem inválidas, busque novamente
   4️⃣ Escolha 2-3 URLs VÁLIDAS de produtos específicos
   5️⃣ Para CADA URL VÁLIDA:
      a) Use fetchPage para pegar o conteúdo
      b) Use extractProducts passando o texto
      c) extractProducts retorna: { products: [ {name, price, image, url, source} ] }
   4️⃣ JUNTE todos os produtos retornados pelos extractProducts em um array único
   5️⃣ ADICIONE os campos "site" e "emoji" (🥇🥈🥉 do mais barato ao mais caro)
   6️⃣ ENVIE o JSON final NO CHAT:
   
   \`\`\`json
   {"products":[{"name":"Nome","price":"R$ XX","url":"https://...","image":"https://...","site":"Shopee","emoji":"🥇"}]}
   \`\`\`
   
   ⚠️ IMPORTANTE:
   - extractProducts retorna produtos SEM os campos "site" e "emoji"
   - VOCÊ DEVE adicionar "site" (nome do marketplace) e "emoji" (🥇🥈🥉)
   - SEMPRE envie o JSON no formato acima DEPOIS de chamar todos os extractProducts
   - NÃO escreva texto antes ou depois do bloco JSON

⚙️ REGRAS CRÍTICAS (NUNCA DESOBEDEÇA):

✅ SEMPRE siga o FLUXO na ORDEM:
   1. Apresentação
   2. Pede NOME
   3. Pede TELEFONE  
   4. Usa saveLead (assim que tiver nome E telefone)
   5. Pergunta o que está buscando
   6. Busca e mostra produtos online no carrossel

✅ SEMPRE colete NOME e TELEFONE ANTES de perguntar sobre produtos
✅ SEMPRE use saveLead para salvar nome e telefone no banco
✅ SEMPRE mostre produtos no formato carrossel (JSON) - NUNCA como links de texto
✅ SEMPRE use extractProducts após fetchPage para extrair dados estruturados
✅ Use emojis 🥇🥈🥉 para ordenar por custo-benefício (mais barato = 🥇)
✅ Use tom AMIGÁVEL e HUMANO (não robótico)
✅ Links devem ser DIRETOS ao produto específico (não genéricos)
✅ extractProducts retorna produtos com "image" já preenchido
✅ Busque APENAS em sites ONLINE (Shopee, Mercado Livre, Amazon, Magalu, Shein)
✅ Mostre 2-3 produtos por vez no carrossel
✅ FLUXO: searchWeb → fetchPage (2-3 URLs) → extractProducts (cada um) → juntar produtos → adicionar site/emoji → ENVIAR JSON
✅ EXEMPLO COMPLETO:
   - extractProducts retorna: {products:[{name:"Tênis",price:"R$ 99",image:"http://...",url:"http://..."}]}
   - Você adiciona "site" e "emoji"
   - Você envia bloco de código JSON com os produtos completos

🚨 REGRA ABSOLUTA - FORMATO DE PRODUTOS:
✅ Produtos SEMPRE em carrossel (bloco JSON com marcação de código)
✅ Se usuário pedir "mais produtos", envie NOVO carrossel JSON
✅ Se usuário pedir "outras opções", envie NOVO carrossel JSON
✅ NUNCA JAMAIS envie links como texto normal
✅ NUNCA escreva: "Aqui estão algumas opções: https://..."
✅ SEMPRE use o formato JSON mesmo que o usuário pergunte múltiplas vezes
✅ Exemplo CORRETO: primeiro uma frase amigável, depois o bloco JSON de produtos
✅ NUNCA envie produtos em formato de lista de texto ou links clicáveis em texto

❌ NUNCA mencione "ferramentas", "busca", "Tavily", "API", "banco de dados"
❌ NUNCA seja técnica ou robótica
❌ NUNCA pule a coleta de nome e telefone
❌ NUNCA mostre produtos ANTES de coletar nome e telefone
❌ NUNCA busque lojas físicas (apenas produtos online)
❌ NUNCA envie links genéricos (sempre link DIRETO do produto específico)
❌ NUNCA esqueça de incluir a URL da imagem do produto
❌ NUNCA JAMAIS ENVIE PRODUTOS COMO LINKS EM TEXTO - SEMPRE CARROSSEL JSON`,
        tools: {
          // Tool 1: Search the web for products
          searchWeb: tool({
            description: 'Search for products on the web using Tavily API. Returns URLs and snippets of relevant product pages.',
            inputSchema: z.object({
              query: z.string().describe('The search query to find products'),
            }),
            execute: async ({ query }: { query: string }) => {
              console.log(`[Tool: searchWeb] Query: "${query}"`);
              const results = await searchWeb(query, 5);
              return results.map(r => ({
                title: r.title,
                url: r.url,
                snippet: r.content?.substring(0, 200) || ''
              }));
            },
          }),

          // Tool 2: Fetch clean page content
          fetchPage: tool({
            description: 'Fetch clean text content from a URL using Jina Reader. Returns plain text suitable for analysis.',
            inputSchema: z.object({
              url: z.string().describe('The URL to fetch content from'),
            }),
            execute: async ({ url }: { url: string }) => {
              console.log(`[Tool: fetchPage] URL: ${url}`);
              const content = await fetchPageContent(url);
              return content;
            },
          }),

          // Tool 3: Save customer lead data
          saveLead: tool({
            description: 'Save customer contact information (name and phone) to the database. Call this after collecting both name and phone from the customer.',
            inputSchema: z.object({
              name: z.string().describe('Customer full name'),
              phone: z.string().describe('Customer phone number'),
            }),
            execute: async ({ name, phone }: { name: string; phone: string }) => {
              console.log(`[Tool: saveLead] Saving lead: ${name}, ${phone}`);
              try {
                const [savedLead] = await db.insert(leads).values({ name, phone }).returning();
                return { success: true, leadId: savedLead.id, message: 'Dados salvos com sucesso!' };
              } catch (error: any) {
                console.error('[Tool: saveLead] Error:', error);
                return { success: false, error: error.message };
              }
            },
          }),

          // Tool 4: Extract structured product data
          extractProducts: tool({
            description: 'Extract structured product information from raw text content. Returns array of products with name, price, image, url.',
            inputSchema: z.object({
              rawText: z.string().describe('Raw page content to extract products from'),
              sourceUrl: z.string().optional().describe('Source URL for reference'),
            }),
            execute: async ({ rawText, sourceUrl }: { rawText: string; sourceUrl?: string }) => {
              console.log(`[Tool: extractProducts] Processing text (${rawText.length} chars)`);
              
              try {
                // Use OpenAI to extract structured product data
                const extractionPrompt = `Você é especialista em extrair dados de produtos de páginas da web brasileiras.

INSTRUÇÕES CRÍTICAS (LEIA COM ATENÇÃO):

🚨 REGRAS OBRIGATÓRIAS:
1. Extraia até 3 produtos do texto fornecido
2. CADA PRODUTO DEVE TER: name, price, image, url
3. Se NÃO encontrar PREÇO ou IMAGEM, NÃO retorne o produto
4. Retorne APENAS produtos COMPLETOS com TODOS os campos

💰 PREÇO (OBRIGATÓRIO):
- Formato PADRONIZADO: "R$ XX,XX" (COM espaço depois de R$)
- Se encontrar "R$99,90", converta para "R$ 99,90"
- Se encontrar "R$ 99", está OK (pode ser inteiro)
- Preço é string, NÃO número
- Busque no texto por: "R$", "preço", "valor", "por", "de", números seguidos de vírgula

🖼️ IMAGEM (OBRIGATÓRIA):
- Procure URLs de imagem NO TEXTO COMPLETO
- Padrões de URLs válidas:
  * Shopee: contém "susercontent.com" ou "down-br.img.susercontent.com"
  * Mercado Livre: contém "mlstatic.com" ou "http2.mlstatic.com"
  * Amazon: contém "media-amazon.com" ou "images-na.ssl-images-amazon.com"
  * Magalu: contém "magazineluiza.com" ou "magazineluizaImages"
  * Terminam em: .jpg, .jpeg, .png, .webp
- Busque por padrões: "https://", "http://", "img", "image", "foto"

FORMATO DE RETORNO (JSON válido):
{
  "products": [
    {
      "name": "Nome Exato do Produto",
      "price": "R$ 99,90",
      "image": "https://url-completa-da-imagem.jpg",
      "url": "${sourceUrl}",
      "source": "nome-do-site"
    }
  ]
}

⚠️ VALIDAÇÃO FINAL:
- SE não encontrar preço VÁLIDO (com "R$"), NÃO retorne o produto
- SE não encontrar URL de imagem VÁLIDA, NÃO retorne o produto
- APENAS retorne produtos que tenham AMBOS: preço E imagem
- É MELHOR retornar 1 produto COMPLETO do que 3 produtos INCOMPLETOS
- Campo "image" NUNCA pode ser string vazia "" - deve ter URL válida
- Campo "price" NUNCA pode ser vazio - deve ter formato "R$ XX,XX"
- Retorne APENAS o JSON, sem texto adicional antes ou depois

TEXTO PARA ANÁLISE (30k chars max):
${rawText.substring(0, 30000)}

URL DE ORIGEM: ${sourceUrl || 'unknown'}`;

                const extractionResponse = await fetch(`${process.env.AI_INTEGRATIONS_OPENAI_BASE_URL}/chat/completions`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.AI_INTEGRATIONS_OPENAI_API_KEY}`,
                  },
                  body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                      { role: 'user', content: extractionPrompt }
                    ],
                    max_tokens: 2000,
                  }),
                });

                const extractionData = await extractionResponse.json();
                const responseText = extractionData.choices?.[0]?.message?.content || '';
                
                // Parse JSON response
                let parsedData;
                try {
                  parsedData = JSON.parse(responseText);
                } catch (e) {
                  // Try to extract JSON from markdown code blocks
                  const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
                  if (jsonMatch) {
                    parsedData = JSON.parse(jsonMatch[1]);
                  } else {
                    console.error('[extractProducts] Failed to parse JSON:', responseText.substring(0, 200));
                    return { products: [] };
                  }
                }

                const productsData = parsedData.products || [];
                
                // 🚨 VALIDAÇÃO CRÍTICA: Filtrar produtos incompletos
                const validProducts = productsData.filter((product: any) => {
                  const hasValidPrice = product.price && product.price.includes('R$');
                  const hasValidImage = product.image && product.image.trim() !== '';
                  const hasValidUrl = product.url && product.url.trim() !== '';
                  const hasValidName = product.name && product.name.trim() !== '';
                  
                  if (!hasValidPrice) {
                    console.log(`[extractProducts] Produto rejeitado (sem preço válido): ${product.name}`);
                    return false;
                  }
                  if (!hasValidImage) {
                    console.log(`[extractProducts] Produto rejeitado (sem imagem válida): ${product.name}`);
                    return false;
                  }
                  if (!hasValidUrl || !hasValidName) {
                    console.log(`[extractProducts] Produto rejeitado (sem URL/nome): ${product.name}`);
                    return false;
                  }
                  
                  return true;
                });
                
                extractedProducts.push(...validProducts);

                // Store products in database
                for (const product of validProducts) {
                  try {
                    await db.insert(products).values({
                      name: product.name,
                      price: product.price ? product.price.toString() : null,
                      image: product.image || null,
                      url: product.url,
                      sku: product.sku || null,
                      source: product.source || null,
                    });
                  } catch (dbError) {
                    console.error('[extractProducts] DB insert error:', dbError);
                  }
                }

                console.log(`[Tool: extractProducts] Extracted ${validProducts.length} valid products (${productsData.length - validProducts.length} rejected)`);
                return { products: validProducts };
              } catch (error) {
                console.error('[Tool: extractProducts] Error:', error);
                return { products: [] };
              }
            },
          }),
        },
        onFinish: async () => {
          // Log query to database
          const latency = Date.now() - startTime;
          
          // Get user query from messages (extract from parts[] - AI SDK 5)
          const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
          if (lastUserMessage?.parts && Array.isArray(lastUserMessage.parts)) {
            const textParts = lastUserMessage.parts.filter((p: any) => p.type === 'text');
            userQuery = textParts.map((p: any) => p.text).join(' ');
          }

          try {
            await db.insert(queries).values({
              query: userQuery,
              results: extractedProducts.length > 0 ? extractedProducts : null,
              latencyMs: latency,
              error: null,
            });
            console.log(`[Query logged] "${userQuery}" - ${latency}ms - ${extractedProducts.length} products`);
          } catch (error) {
            console.error('[Query logging error]:', error);
          }
        },
      });

      // Pipe UI message stream to Express response (includes tool calls, text, metadata)
      result.pipeUIMessageStreamToResponse(res);

    } catch (error) {
      console.error('[Chat API Error]:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
