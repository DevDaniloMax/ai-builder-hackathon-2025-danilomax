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
    const allResults = data.results || [];
    
    // 🚨 VALIDAÇÃO CRÍTICA: Filtrar apenas domínios permitidos
    const allowedDomains = [
      'shopee.com.br',
      'mercadolivre.com.br', 
      'amazon.com.br',
      'magazineluiza.com.br',
      'magalu.com.br',
      'shein.com'  // Cobre br.shein.com, us.shein.com, etc
    ];
    
    const results = allResults.filter(result => {
      const urlLower = result.url.toLowerCase();
      const isAllowedDomain = allowedDomains.some(domain => urlLower.includes(domain));
      
      if (!isAllowedDomain) {
        console.log(`[searchWeb] Rejected (domain not allowed): ${result.url}`);
        return false;
      }
      
      return true;
    });
    
    // Cache the FILTERED results
    searchCache.set(cacheKey, results);
    
    console.log(`[searchWeb] Found ${results.length} valid results (${allResults.length - results.length} rejected) for:`, query);
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

  // 🚨 VALIDAÇÃO CRÍTICA: Bloquear URLs inválidas
  const urlLower = url.toLowerCase();
  
  // 1. Verificar domínio permitido
  const allowedDomains = ['shopee.com.br', 'mercadolivre.com.br', 'amazon.com.br', 'magazineluiza.com.br', 'magalu.com.br', 'shein.com'];
  const hasAllowedDomain = allowedDomains.some(domain => urlLower.includes(domain));
  
  if (!hasAllowedDomain) {
    console.log(`[fetchPageContent] Rejected (domain not allowed): ${url}`);
    return '';
  }
  
  // 2. Verificar padrão de produto específico
  const hasValidPattern = 
    urlLower.includes('-i.') ||         // Shopee: produto-i.123.456
    urlLower.includes('/dp/') ||        // Amazon: /dp/B07G7BTMMK
    urlLower.includes('/mlb-') ||       // Mercado Livre: /MLB-123456
    urlLower.includes('/p/') ||         // Magalu: /produto/p/123456
    urlLower.includes('-p-')            // Shein: produto-p-12345.html
    ;
  
  // 3. Verificar padrões proibidos
  const hasInvalidPattern = urlLower.includes('/list/') || urlLower.includes('/search') || 
                            urlLower.includes('/busca') || urlLower.includes('?keyword=') ||
                            urlLower.includes('?s=') || urlLower.includes('?k=') || 
                            urlLower.includes('/categoria');
  
  if (!hasValidPattern || hasInvalidPattern) {
    console.log(`[fetchPageContent] Rejected (invalid URL pattern): ${url}`);
    console.log(`  - Has valid pattern (-i., /dp/, /MLB-): ${hasValidPattern}`);
    console.log(`  - Has invalid pattern (list/search/busca): ${hasInvalidPattern}`);
    return '';
  }

  try {
    // Use Jina Reader to get clean text content with enhanced options
    const jinaUrl = `https://r.jina.ai/${url}`;
    const response = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/plain',
        'X-With-Images-Summary': 'true',
        'X-With-Links-Summary': 'true',
      },
    });

    if (!response.ok) {
      console.error('[fetchPageContent] Jina Reader error:', response.status, url);
      return '';
    }

    let content = await response.text();
    
    // Truncate to 30k characters for maximum data capture (especially images and prices)
    if (content.length > 30000) {
      content = content.substring(0, 30000);
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
