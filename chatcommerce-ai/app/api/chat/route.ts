import { NextRequest } from "next/server";
import { streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { webSearch, fetchClean } from "@/lib/web";
import { extractProducts } from "@/lib/extract";
import { supabase } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import type { Product } from "@/types/product";

// Configure edge runtime for better performance
export const runtime = "edge";

/**
 * POST /api/chat
 * Main chat endpoint with AI SDK streaming
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  // Get client IP for rate limiting
  const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";

  // Rate limit: 10 requests per minute
  if (!rateLimit(ip, 10, 60000)) {
    return new Response("Rate limit exceeded. Please try again later.", {
      status: 429,
      headers: {
        "Retry-After": "60",
      },
    });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid request: messages array required", {
        status: 400,
      });
    }

    // Stream response using AI SDK
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages,
      system: `You are an intelligent shopping assistant named ChatCommerce AI.

Your capabilities:
1. Search for products on the web using the searchWeb tool
2. Fetch detailed product information using the fetchPage tool
3. Extract structured product data using the extractProducts tool

Guidelines:
- Be concise and helpful
- When users ask for products, use the tools to find real options
- Present up to 3 relevant products with name, price (if available), and purchase link
- If prices aren't found, still show the products
- Format responses in a friendly, conversational way
- Always provide clickable links for users to purchase

Example response format:
"I found 3 great options for you:

1. **Product Name** - $XX.XX
   [View Product →](url)

2. **Product Name** - $XX.XX
   [View Product →](url)

3. **Product Name**
   [View Product →](url)"`,

      tools: {
        /**
         * Tool: searchWeb
         * Search for products using Tavily API
         */
        searchWeb: tool({
          description:
            "Search the web for products, stores, or product information. Returns relevant URLs and snippets.",
          parameters: z.object({
            query: z
              .string()
              .describe(
                "Search query (e.g., 'waterproof backpacks under $200')"
              ),
            maxResults: z
              .number()
              .optional()
              .default(5)
              .describe("Maximum number of results to return"),
          }),
          execute: async ({ query, maxResults = 5 }) => {
            console.log(`[Tool:searchWeb] Query: "${query}"`);
            const results = await webSearch(query, maxResults);
            return {
              success: true,
              results,
              count: results.length,
            };
          },
        }),

        /**
         * Tool: fetchPage
         * Fetch clean content from a URL using Jina Reader
         */
        fetchPage: tool({
          description:
            "Fetch and parse content from a specific URL. Returns clean text suitable for product extraction.",
          parameters: z.object({
            url: z.string().url().describe("URL to fetch content from"),
          }),
          execute: async ({ url }) => {
            console.log(`[Tool:fetchPage] URL: ${url}`);
            const content = await fetchClean(url);
            return {
              success: content.length > 0,
              content,
              length: content.length,
            };
          },
        }),

        /**
         * Tool: extractProducts
         * Extract structured product information from text
         */
        extractProducts: tool({
          description:
            "Extract up to 3 structured products from raw text content. Returns product name, price, URL, and other details.",
          parameters: z.object({
            rawText: z
              .string()
              .describe("Raw text content to extract products from"),
          }),
          execute: async ({ rawText }) => {
            console.log(`[Tool:extractProducts] Processing text...`);
            const products = await extractProducts(rawText);

            // Store products in database (non-blocking)
            if (products.length > 0) {
              queueMicrotask(async () => {
                try {
                  await supabase.from("products").insert(
                    products.map((p) => ({
                      sku: p.sku ?? null,
                      name: p.name,
                      price: p.price ?? null,
                      url: p.url,
                      image: p.image ?? null,
                      source: p.source ?? null,
                    }))
                  );
                  console.log(`[DB] Stored ${products.length} products`);
                } catch (error) {
                  console.error("[DB] Error storing products:", error);
                }
              });
            }

            return {
              success: true,
              products,
              count: products.length,
            };
          },
        }),
      },

      /**
       * onFinish callback
       * Log query and results to database
       */
      onFinish: async ({ text, toolResults }) => {
        try {
          // Extract user query from messages
          const userMessages = messages.filter((m: any) => m.role === "user");
          const lastQuery =
            userMessages[userMessages.length - 1]?.content || "";

          // Extract products from tool results
          let extractedProducts: Product[] = [];
          if (toolResults) {
            for (const result of Object.values(toolResults)) {
              if (Array.isArray(result)) {
                for (const item of result) {
                  if (item?.products && Array.isArray(item.products)) {
                    extractedProducts = [
                      ...extractedProducts,
                      ...item.products,
                    ];
                  }
                }
              }
            }
          }

          // Calculate latency
          const latency = Date.now() - startTime;

          // Log performance warning if too slow
          if (latency > 7000) {
            console.warn(`[Performance] Slow query: ${latency}ms`);
          }

          // Store query in database
          await supabase.from("queries").insert({
            query: lastQuery.slice(0, 1000),
            results: extractedProducts.length > 0 ? extractedProducts : null,
            latency_ms: latency,
            error: null,
          });

          console.log(
            `[API] Query logged: ${extractedProducts.length} products, ${latency}ms`
          );
        } catch (error) {
          console.error("[API] Error in onFinish:", error);
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[API] Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
