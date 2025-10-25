/**
 * Product represents a single product extracted from web search
 */
export type Product = {
  /** Product name */
  name: string;

  /** Product URL/link */
  url: string;

  /** Product price in local currency */
  price?: number;

  /** Product image URL */
  image?: string;

  /** Product SKU or identifier */
  sku?: string;

  /** Source domain (e.g., "amazon.com") */
  source?: string;
};

/**
 * SearchResult represents a single search result from Tavily
 */
export type SearchResult = {
  /** Page title */
  title: string;

  /** Page URL */
  url: string;

  /** Short excerpt/snippet */
  snippet?: string;

  /** Relevance score (optional) */
  score?: number;
};

/**
 * Tool execution result for type safety
 */
export type ToolResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
