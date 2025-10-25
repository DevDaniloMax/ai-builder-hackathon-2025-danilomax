// Web search and content fetching utilities

interface TavilySearchResult {
  title: string;
  url: string;
  content?: string;
  score?: number;
}

interface TavilyResponse {
  results: TavilySearchResult[];
}

// In-memory cache for search results and page content
const searchCache = new Map<string, TavilySearchResult[]>();
const pageCache = new Map<string, string>();

/**
 * Search for products using Tavily API
 */
export async function searchWeb(query: string, maxResults: number = 5): Promise<TavilySearchResult[]> {
  const cacheKey = `${query}-${maxResults}`;
  
  // Check cache first
  if (searchCache.has(cacheKey)) {
    console.log('[searchWeb] Cache hit:', cacheKey);
    return searchCache.get(cacheKey)!;
  }

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.error('[searchWeb] TAVILY_API_KEY not set');
    return [];
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'basic',
        max_results: maxResults,
        include_domains: [],
        exclude_domains: []
      }),
    });

    if (!response.ok) {
      console.error('[searchWeb] Tavily API error:', response.status, response.statusText);
      return [];
    }

    const data: TavilyResponse = await response.json();
    const results = data.results || [];
    
    // Cache the results
    searchCache.set(cacheKey, results);
    
    console.log(`[searchWeb] Found ${results.length} results for:`, query);
    return results;
  } catch (error) {
    console.error('[searchWeb] Error:', error);
    return [];
  }
}

/**
 * Fetch clean page content using Jina Reader
 */
export async function fetchPageContent(url: string): Promise<string> {
  // Check cache first
  if (pageCache.has(url)) {
    console.log('[fetchPageContent] Cache hit:', url);
    return pageCache.get(url)!;
  }

  try {
    // Use Jina Reader to get clean text content
    const jinaUrl = `https://r.jina.ai/${url}`;
    const response = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/plain',
      },
    });

    if (!response.ok) {
      console.error('[fetchPageContent] Jina Reader error:', response.status, url);
      return '';
    }

    let content = await response.text();
    
    // Truncate to 12k characters for token efficiency
    if (content.length > 12000) {
      content = content.substring(0, 12000);
    }

    // Cache the result
    pageCache.set(url, content);
    
    console.log(`[fetchPageContent] Fetched ${content.length} chars from:`, url);
    return content;
  } catch (error) {
    console.error('[fetchPageContent] Error:', error);
    return '';
  }
}

/**
 * Clear cache (useful for testing)
 */
export function clearCache() {
  searchCache.clear();
  pageCache.clear();
  console.log('[clearCache] All caches cleared');
}
