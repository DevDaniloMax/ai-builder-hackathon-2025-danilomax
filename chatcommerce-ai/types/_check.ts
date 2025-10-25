import type { Product, SearchResult, ToolResult } from "./product";

// Test Product type
const validProduct: Product = {
  name: "Test Product",
  url: "https://example.com/product",
  price: 29.99,
  image: "https://example.com/image.jpg",
  sku: "TEST-001",
  source: "example.com",
};

// Test SearchResult type
const validSearchResult: SearchResult = {
  title: "Test Page",
  url: "https://example.com",
  snippet: "This is a test snippet",
};

// Test ToolResult type
const validToolResult: ToolResult<Product[]> = {
  success: true,
  data: [validProduct],
};

// Minimal valid Product (only required fields)
const minimalProduct: Product = {
  name: "Minimal Product",
  url: "https://example.com",
};

console.log("Type validation successful");
