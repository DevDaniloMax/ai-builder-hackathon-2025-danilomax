import type { SearchResult } from "@/types/product";

// In-memory cache for API responses
const CACHE = new Map<string, any>();
const MAX_CACHE_SIZE = 100;

// Cache TTL configurations
const CACHE_TTL = {
  search: 60 * 60 * 1000, // 1 hour for search results
  page: 24 * 60 * 60 * 1000, // 24 hours for page content
};

// Cache entry with timestamp
type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

/**
 * Get cached data if not expired
 */
function getCached<T>(key: string, ttl: number = CACHE_TTL.search): T | null {
  const entry = CACHE.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > ttl) {
    CACHE.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Set cache with timestamp and size limit
 */
function setCache<T>(key: string, data: T): void {
  // Implement LRU: remove oldest entry if cache is full
  if (CACHE.size >= MAX_CACHE_SIZE) {
    const firstKey = CACHE.keys().next().value;
    CACHE.delete(firstKey);
  }

  CACHE.set(key, {
    data,
    timestamp: Date.now(),
  } as CacheEntry<T>);
}

/**
 * Fetch with timeout protection
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
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

  // Check cache first with search TTL
  const cached = getCached<SearchResult[]>(cacheKey, CACHE_TTL.search);
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
    const response = await fetchWithTimeout(
      "https://api.tavily.com/search",
      {
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
      },
      10000 // 10 second timeout
    );

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
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[webSearch] Timeout: Request took longer than 10 seconds");
    } else {
      console.error("[webSearch] Error:", error);
    }
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

  // Check cache first with page TTL (24 hours)
  const cached = getCached<string>(cacheKey, CACHE_TTL.page);
  if (cached) {
    console.log(`[fetchClean] Cache hit for URL: ${url}`);
    return cached;
  }

  console.log(`[fetchClean] Fetching from Jina: ${url}`);

  try {
    // Remove protocol and construct Jina Reader URL
    const cleanUrl = url.replace(/^https?:\/\//, "");
    const jinaUrl = `https://r.jina.ai/${cleanUrl}`;

    const response = await fetchWithTimeout(
      jinaUrl,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ChatCommerceBot/1.0)",
          Accept: "text/plain",
        },
        // Disable cache to get fresh content
        cache: "no-store",
      },
      10000 // 10 second timeout
    );

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
    if (error instanceof Error && error.name === "AbortError") {
      console.error("[fetchClean] Timeout: Request took longer than 10 seconds");
    } else {
      console.error("[fetchClean] Error:", error);
    }
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
