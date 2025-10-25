import OpenAI from "openai";
import type { Product } from "@/types/product";

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Extract up to 3 products from raw text using OpenAI
 * @param rawText - Raw page content from fetchClean
 * @returns Array of extracted products (max 3)
 */
export async function extractProducts(rawText: string): Promise<Product[]> {
  if (!rawText || rawText.trim().length === 0) {
    console.log("[extractProducts] Empty input text");
    return [];
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("[extractProducts] Missing OPENAI_API_KEY");
    return [];
  }

  console.log(`[extractProducts] Processing ${rawText.length} characters`);

  const prompt = `You are a product extraction specialist. Analyze the following text and extract UP TO 3 products.

For each product, provide:
- name: Product name (required)
- price: Numeric price value (optional, omit if not found)
- url: Product URL (required, use best guess if not explicit)
- image: Image URL (optional)
- sku: Product SKU or ID (optional)
- source: Domain name (optional, infer from URLs)

Return ONLY a valid JSON array. No markdown, no explanation, just the JSON array.

Example format:
[
  {
    "name": "Waterproof Backpack",
    "price": 89.99,
    "url": "https://store.com/product/123",
    "image": "https://cdn.store.com/img.jpg",
    "sku": "BP-001",
    "source": "store.com"
  }
]

If no products are found, return an empty array: []

Text to analyze:
"""
${rawText}
"""`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a JSON-only product extractor. Return only valid JSON arrays, no other text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      console.log("[extractProducts] No content in response");
      return [];
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = content.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```json?\n?/g, "").replace(/```$/g, "");
    }

    // Parse JSON
    const parsed = JSON.parse(jsonText);

    if (!Array.isArray(parsed)) {
      console.error("[extractProducts] Response is not an array");
      return [];
    }

    // Validate and limit to 3 products
    const products: Product[] = parsed
      .slice(0, 3)
      .filter((item: any) => item.name && item.url)
      .map((item: any) => ({
        name: String(item.name),
        url: String(item.url),
        price: item.price ? Number(item.price) : undefined,
        image: item.image ? String(item.image) : undefined,
        sku: item.sku ? String(item.sku) : undefined,
        source: item.source ? String(item.source) : undefined,
      }));

    console.log(`[extractProducts] Extracted ${products.length} products`);
    return products;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("[extractProducts] JSON parse error:", error.message);
    } else {
      console.error("[extractProducts] Error:", error);
    }
    return [];
  }
}
