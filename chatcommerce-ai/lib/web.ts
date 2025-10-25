import type { SearchResult } from "@/types/product";

// In-memory cache for API responses
const CACHE = new Map<string, any>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

// Cache entry with timestamp
type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

/**
 * Get cached data if not expired
 */
function getCached<T>(key: string): T | null {
  const entry = CACHE.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    CACHE.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Set cache with timestamp
 */
function setCache<T>(key: string, data: T): void {
  CACHE.set(key, {
    data,
    timestamp: Date.now(),
  } as CacheEntry<T>);
}

/**
 * Search web using Tavily API
 * @param query - Search query string
 * @param maxResults - Maximum number of results to return (default: 5)
 * @returns Array of search results with title, url, and snippet
 */
export async function webSearch(
  query: string,
  maxResults: number = 5
): Promise<SearchResult[]> {
  const cacheKey = `tavily:${query}:${maxResults}`;

  // Check cache first
  const cached = getCached<SearchResult[]>(cacheKey);
  if (cached) {
    console.log(`[webSearch] Cache hit for query: "${query}"`);
    return cached;
  }

  console.log(`[webSearch] Fetching from Tavily: "${query}"`);

  // Validate API key
  if (!process.env.TAVILY_API_KEY) {
    console.error("[webSearch] Missing TAVILY_API_KEY");
    return [];
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        max_results: maxResults,
        search_depth: "basic",
        include_answer: false,
        include_raw_content: false,
      }),
    });

    if (!response.ok) {
      console.error(`[webSearch] Tavily API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const results: SearchResult[] = (data.results || []).map((item: any) => ({
      title: item.title || "",
      url: item.url || "",
      snippet: item.snippet || item.content || "",
    }));

    // Cache results
    setCache(cacheKey, results);

    console.log(`[webSearch] Found ${results.length} results`);
    return results;
  } catch (error) {
    console.error("[webSearch] Error:", error);
    return [];
  }
}

/**
 * Fetch clean page content using Jina Reader
 * @param url - Target URL to fetch
 * @returns Clean text content (max 12k characters)
 */
export async function fetchClean(url: string): Promise<string> {
  const cacheKey = `jina:${url}`;

  // Check cache first
  const cached = getCached<string>(cacheKey);
  if (cached) {
    console.log(`[fetchClean] Cache hit for URL: ${url}`);
    return cached;
  }

  console.log(`[fetchClean] Fetching from Jina: ${url}`);

  try {
    // Remove protocol and construct Jina Reader URL
    const cleanUrl = url.replace(/^https?:\/\//, "");
    const jinaUrl = `https://r.jina.ai/${cleanUrl}`;

    const response = await fetch(jinaUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ChatCommerceBot/1.0)",
        Accept: "text/plain",
      },
      // Disable cache to get fresh content
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[fetchClean] Jina Reader error: ${response.status}`);
      return "";
    }

    const text = await response.text();

    // Trim to 12k characters for token efficiency
    const trimmed = text.slice(0, 12000);

    // Cache result
    setCache(cacheKey, trimmed);

    console.log(`[fetchClean] Fetched ${trimmed.length} characters`);
    return trimmed;
  } catch (error) {
    console.error("[fetchClean] Error:", error);
    return "";
  }
}

/**
 * Clear cache (useful for testing)
 */
export function clearCache(): void {
  CACHE.clear();
  console.log("[Cache] Cleared");
}
