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
   - Busque nos sites: Shopee, Mercado Livre, Shein, Amazon, Magalu
   - Priorize produtos com MELHOR CUSTO-BENEFÍCIO (mais baratos primeiro)
   - Use searchWeb focando nesses marketplaces
   - MOSTRE produtos em CARROSSEL (formato JSON)

   🔍 EXEMPLO COMPLETO DE COMO BUSCAR PRODUTOS:
   
   Cliente pediu: "tênis nike"
   
   1️⃣ Use searchWeb("tênis nike site:shopee.com.br OR site:mercadolivre.com.br")
      Retorna URLs como: https://shopee.com.br/tenis-nike-air-max
   
   2️⃣ Use fetchPage("https://shopee.com.br/tenis-nike-air-max")
      Retorna texto com: 
      - Nome: "Tênis Nike Air Max 90"
      - Preço: "R$ 299,90"
      - Imagens: "https://down-br.img.susercontent.com/file/abc123.jpg"
   
   3️⃣ Faça isso para 2-3 URLs diferentes
   
   4️⃣ Monte o JSON e envie APENAS ele (sem texto):
   
   \`\`\`json
   {"products":[{"name":"Tênis Nike Air Max 90","price":"R$ 299","url":"https://shopee.com.br/tenis-nike-air-max","image":"https://down-br.img.susercontent.com/file/abc123.jpg","site":"Shopee","emoji":"🥇"},{"name":"Tênis Nike Revolution","price":"R$ 249","url":"https://mercadolivre.com.br/MLB-123","image":"http://http2.mlstatic.com/D_NQ_NP_789.jpg","site":"Mercado Livre","emoji":"🥈"}]}
   \`\`\`
   
   ⚠️ OBRIGATÓRIO:
   - SEMPRE chame fetchPage para CADA URL de produto
   - Procure URLs de imagem que contenham: .jpg, .png, .webp, susercontent.com, mlstatic.com
   - Campo "image" NUNCA pode ser vazio
   - Se não achar imagem no fetchPage, use uma URL genérica do site
   - Ordene por preço (🥇 mais barato)

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
✅ SEMPRE mostre produtos no formato carrossel (JSON)
✅ Use emojis 🥇🥈🥉 para ordenar por custo-benefício
✅ Use tom AMIGÁVEL e HUMANO (não robótico)
✅ Links devem ser DIRETOS ao produto específico (não genéricos)
✅ SEMPRE inclua a URL da IMAGEM do produto no campo "image"
✅ Busque APENAS em sites ONLINE (Shopee, Mercado Livre, Amazon, Magalu, Shein)
✅ Mostre 2-3 produtos por vez no carrossel
✅ Use searchWeb e fetchPage para garantir URLs e imagens corretas

❌ NUNCA mencione "ferramentas", "busca", "Tavily", "API", "banco de dados"
❌ NUNCA seja técnica ou robótica
❌ NUNCA pule a coleta de nome e telefone
❌ NUNCA mostre produtos ANTES de coletar nome e telefone
❌ NUNCA busque lojas físicas (apenas produtos online)
❌ NUNCA envie links genéricos (sempre link DIRETO do produto específico)
❌ NUNCA esqueça de incluir a URL da imagem do produto`,
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
                const extractionPrompt = `You are a product data extraction expert. Extract structured product information from the provided text.
                      
Return a JSON object with a "products" array. Each product should have:
- name (string, required): Product name
- price (number, optional): Price in USD
- image (string, optional): Image URL
- url (string, required): Product purchase link
- sku (string, optional): Product SKU or ID
- source (string, optional): Domain name

Extract up to 3 products maximum. Only include products with clear names and URLs.
Return valid JSON only, no additional text.

Example format:
{
  "products": [
    {
      "name": "Wireless Headphones",
      "price": 179.99,
      "image": "https://example.com/image.jpg",
      "url": "https://example.com/product",
      "sku": "HP-001",
      "source": "example.com"
    }
  ]
}

Extract product information from this content:

${rawText.substring(0, 8000)}

Source URL: ${sourceUrl || 'unknown'}`;

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
                extractedProducts.push(...productsData);

                // Store products in database
                for (const product of productsData) {
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

                console.log(`[Tool: extractProducts] Extracted ${productsData.length} products`);
                return { products: productsData };
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
