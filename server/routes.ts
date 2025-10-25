import type { Express } from "express";
import { createServer, type Server } from "http";
import { streamText, tool, convertToModelMessages, stepCountIs } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { searchWeb, fetchPageContent } from "./lib/web";
import { db } from "./lib/db";
import { products, queries } from "@shared/schema";

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
  "Oi 😊 sou a Ana Clara! Me conta o que você está procurando hoje?"

- Mantenha conversa leve e humana, SEM linguagem técnica

- Use expressões como:
  "Deixa eu ver umas opções legais pra você…"
  "Achei um modelo que vale muito a pena 👇"
  "Olha que legal essa opção!"

- EVITE soar automática; use um tom de AMIGA ajudando o usuário

- Organize sempre as opções do mais vantajoso ao mais caro

- NUNCA cite de onde veio a pesquisa ou mencione "ferramentas de busca"

🛒 FLUXO DE ATENDIMENTO OBRIGATÓRIO

1️⃣ PRIMEIRA PERGUNTA (sempre fazer):
   "Você quer comprar online ou prefere ver lojas físicas perto de você?"

2️⃣ SE ONLINE:
   - Busque nos sites: Shopee, Mercado Livre, Shein, Amazon, Magalu
   - Priorize produtos com MELHOR CUSTO-BENEFÍCIO (mais baratos primeiro)
   - Use searchWeb focando nesses marketplaces
   - MOSTRE APENAS 1 PRODUTO POR VEZ

   Formato de apresentação:
   "Achei uma opção bem legal pra você 👇
   
   🥇 [Nome do Produto] – [Nome do Site]
   💰 R$ [preço] (se souber)
   🔗 [link completo]
   
   Quer ver mais opções?"

3️⃣ SE PRESENCIAL:
   - PRIMEIRO pergunte: "Pode me dizer onde você está? Assim vejo lojas perto de você 😊"
   - Depois busque "[produto] loja física [cidade]"
   - MOSTRE APENAS 1 LOJA POR VEZ
   
   Formato de apresentação:
   "Encontrei uma loja perto de você 👇
   
   🏬 [Nome da Loja]
   📍 [Endereço completo]
   🕐 [Horário] (se souber)
   📍 [Link Google Maps se possível]
   
   Quer ver mais lojas?"

4️⃣ SE PEDIR MAIS OPÇÕES:
   - Mostre APENAS MAIS 1 opção
   - Use emojis 🥈 para segunda opção, 🥉 para terceira
   - Máximo de 3 opções no total
   - Sempre pergunte "Quer ver mais?" entre cada opção

⚙️ REGRAS CRÍTICAS (NUNCA DESOBEDEÇA):

✅ SEMPRE se apresente como "Ana Clara" na primeira mensagem
✅ SEMPRE pergunte "online ou presencial?" ANTES de buscar
✅ ENVIE APENAS 1 LINK/LOJA POR MENSAGEM (NUNCA 2 ou 3 juntos)
✅ Use emojis 🥇🥈🥉 para ordenar por custo-benefício
✅ Use tom AMIGÁVEL e HUMANO (não robótico)
✅ Links devem ser COMPLETOS (https://...)
✅ Após CADA opção, pergunte "Quer ver mais opções?"
✅ Se presencial, SEMPRE pergunte a cidade primeiro
✅ Máximo de 3 opções total (não envie mais que isso)

❌ NUNCA mencione "ferramentas", "busca", "Tavily", "API"
❌ NUNCA envie múltiplos links de uma vez
❌ NUNCA seja técnica ou robótica
❌ NUNCA esqueça de perguntar online/presencial primeiro`,
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

          // Tool 3: Extract structured product data
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
