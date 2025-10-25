# ChatCommerce AI - API Examples

**Version**: 1.0
**Last Updated**: October 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Chat API](#chat-api)
3. [Tavily API Examples](#tavily-api-examples)
4. [Jina Reader Examples](#jina-reader-examples)
5. [OpenAI API Examples](#openai-api-examples)
6. [Supabase API Examples](#supabase-api-examples)
7. [Complete Flow Example](#complete-flow-example)
8. [Testing Examples](#testing-examples)

---

## Overview

This document provides concrete examples of all API interactions in ChatCommerce AI, including request/response formats, error handling, and common patterns.

---

## Chat API

### Endpoint

```
POST /api/chat
```

### Example 1: Simple Product Search

**Request**:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Find me waterproof backpacks under $200"
      }
    ]
  }'
```

**Response** (Server-Sent Events stream):

```
0:{"type":"metadata","id":"chat_abc123"}
1:"I"
1:"'ll"
1:" search"
1:" for"
1:" waterproof"
1:" backpacks"
1:" under"
1:" $200"
1:" for"
1:" you"
1:".\n\n"
2:{"type":"tool_call","toolName":"searchWeb","args":{"query":"waterproof backpacks under $200"}}
3:{"type":"tool_result","toolName":"searchWeb","result":{"success":true,"results":[...],"count":5}}
2:{"type":"tool_call","toolName":"fetchPage","args":{"url":"https://example.com/backpacks"}}
3:{"type":"tool_result","toolName":"fetchPage","result":{"success":true,"content":"...","length":12000}}
2:{"type":"tool_call","toolName":"extractProducts","args":{"rawText":"..."}}
3:{"type":"tool_result","toolName":"extractProducts","result":{"success":true,"products":[...],"count":3}}
1:"I"
1:" found"
1:" 3"
1:" great"
1:" options"
1:":\n\n"
1:"1"
1:"."
1:" **"
1:"Trail"
1:" Pro"
1:" Backpack"
1:"**"
1:" -"
1:" $"
1:"189"
1:"."
1:"99"
1:"\n"
1:"   "
1:"["
1:"View"
1:" Product"
1:" →"
1:"]"
1:"("
1:"https"
1:":"
1:"//"
1:"example"
1:"."
1:"com"
1:"/trail-pro"
1:")"
1:"\n\n"
done:{"finishReason":"stop"}
```

---

### Example 2: Bulk Purchase Query

**Request**:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "I need 50 hygiene kits under $30 each for a community project"
      }
    ]
  }'
```

**Response** (formatted for readability):

```json
{
  "streamedTokens": [
    "I'll help you find hygiene kits suitable for bulk purchase...",
    "...",
    "Here are 3 options:\n\n",
    "1. **Basic Hygiene Kit** - $29.90\n",
    "   Includes: soap, shampoo, toothbrush, toothpaste\n",
    "   [Buy in Bulk →](https://supplier.com/hygiene-kit-basic)\n\n",
    "2. **Economy Kit** - $27.50\n",
    "   Perfect for large orders\n",
    "   [View Details →](https://wholesale.com/economy-kit)\n\n",
    "3. **Community Care Package** - $28.00\n",
    "   Designed for community projects\n",
    "   [Order Now →](https://charity-supplies.com/care-package)"
  ]
}
```

---

### Example 3: Conversation with History

**Request**:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Find me laptops under $1000"
      },
      {
        "role": "assistant",
        "content": "I found 3 laptops:\n1. Dell Inspiron...\n2. HP Pavilion...\n3. Lenovo ThinkPad..."
      },
      {
        "role": "user",
        "content": "Which one has the best battery life?"
      }
    ]
  }'
```

**Response**:
The AI will reference the previously found laptops and provide battery life comparison.

---

### Example 4: Error Handling

**Request** (invalid format):

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "invalid": "format"
  }'
```

**Response**:

```
HTTP/1.1 400 Bad Request
Content-Type: text/plain

Invalid request: messages array required
```

---

## Tavily API Examples

### Example 1: Basic Product Search

**Request**:

```bash
curl -X POST https://api.tavily.com/search \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "tvly-YOUR_API_KEY",
    "query": "waterproof backpacks under $200",
    "max_results": 5,
    "search_depth": "basic",
    "include_answer": false,
    "include_raw_content": false
  }'
```

**Response**:

```json
{
  "query": "waterproof backpacks under $200",
  "results": [
    {
      "title": "Best Waterproof Backpacks 2025 - Outdoor Gear Lab",
      "url": "https://outdoorgearlab.com/topics/bags/best-waterproof-backpack",
      "snippet": "We tested 15 waterproof backpacks ranging from $100 to $300. Our top picks include the Sea to Summit Big River at $189, the Osprey Transporter...",
      "score": 0.95,
      "published_date": "2025-10-01"
    },
    {
      "title": "Waterproof Hiking Backpacks | REI Co-op",
      "url": "https://www.rei.com/c/waterproof-backpacks",
      "snippet": "Shop our collection of waterproof backpacks from top brands. Free shipping on orders over $50. Find the perfect pack for your adventure.",
      "score": 0.92
    },
    {
      "title": "Best Budget Waterproof Backpacks Under $200 - Adventure Journal",
      "url": "https://adventure-journal.com/best-waterproof-backpacks-under-200",
      "snippet": "Looking for a quality waterproof backpack without breaking the bank? We've compiled the best options under $200, including the Trail Pro ($189.99)...",
      "score": 0.89
    },
    {
      "title": "Amazon.com: Waterproof Backpacks",
      "url": "https://amazon.com/s?k=waterproof+backpacks",
      "snippet": "Waterproof Backpack 40L - $175.00. 4.5 stars, 1,234 reviews. Free shipping with Prime.",
      "score": 0.85
    },
    {
      "title": "Waterproof Backpacks - Backcountry.com",
      "url": "https://backcountry.com/waterproof-backpacks",
      "snippet": "Premium waterproof backpacks from $150. Shop brands like Patagonia, Arc'teryx, and The North Face.",
      "score": 0.82
    }
  ],
  "response_time": 1.2
}
```

---

### Example 2: Domain-Specific Search

**Request**:

```bash
curl -X POST https://api.tavily.com/search \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "tvly-YOUR_API_KEY",
    "query": "mechanical keyboards site:amazon.com OR site:newegg.com",
    "max_results": 3,
    "search_depth": "basic"
  }'
```

**Response**:

```json
{
  "query": "mechanical keyboards site:amazon.com OR site:newegg.com",
  "results": [
    {
      "title": "Mechanical Gaming Keyboards | Amazon.com",
      "url": "https://amazon.com/mechanical-gaming-keyboards/s?k=mechanical+gaming+keyboards",
      "snippet": "Shop mechanical keyboards from top brands like Corsair, Logitech, and Razer. Free shipping with Prime.",
      "score": 0.94
    },
    {
      "title": "Mechanical Keyboards - Newegg.com",
      "url": "https://www.newegg.com/Mechanical-Keyboards/SubCategory/ID-3206",
      "snippet": "Mechanical keyboards for gaming and productivity. Browse by switch type, brand, and price.",
      "score": 0.91
    },
    {
      "title": "Best Sellers in Mechanical Keyboards - Amazon",
      "url": "https://amazon.com/Best-Sellers-Mechanical-Keyboards/zgbs/pc/12879431",
      "snippet": "Discover the best Mechanical Keyboards in Best Sellers. Find the top 100 most popular items.",
      "score": 0.88
    }
  ],
  "response_time": 0.9
}
```

---

### Example 3: Error - Rate Limit

**Request**:

```bash
curl -X POST https://api.tavily.com/search \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "tvly-YOUR_API_KEY",
    "query": "test query",
    "max_results": 5
  }'
```

**Response**:

```json
{
  "error": "Rate limit exceeded",
  "message": "You have exceeded your monthly quota of 1000 requests. Please upgrade your plan.",
  "status": 429
}
```

---

### Example 4: Error - Invalid API Key

**Request**:

```bash
curl -X POST https://api.tavily.com/search \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "invalid_key",
    "query": "test query"
  }'
```

**Response**:

```json
{
  "error": "Unauthorized",
  "message": "Invalid API key provided",
  "status": 401
}
```

---

## Jina Reader Examples

### Example 1: Fetch Product Page

**Request**:

```bash
curl https://r.jina.ai/outdoorgearlab.com/topics/bags/best-waterproof-backpack \
  -H "User-Agent: Mozilla/5.0 (compatible; ChatCommerceBot/1.0)" \
  -H "Accept: text/plain"
```

**Response**:

```
OutdoorGearLab - Best Waterproof Backpacks 2025

After months of testing, we've identified the best waterproof backpacks for different uses.

Top Picks:

1. Sea to Summit Big River Dry Bag
Price: $189.99
Capacity: 40L
Rating: 9/10

The Sea to Summit Big River is our top choice for waterproof backpacks.
It features welded seams, a roll-top closure, and comfortable shoulder straps.
Fully submersible and comes with a lifetime warranty.

Buy now: https://outdoorgearlab.com/buy/sea-to-summit-big-river

2. Osprey Transporter 40
Price: $175.00
Capacity: 40L
Rating: 8/10

The Osprey Transporter offers excellent organization with internal pockets
while maintaining waterproof protection. TPU-coated fabric keeps contents dry.

Buy now: https://outdoorgearlab.com/buy/osprey-transporter-40

3. Patagonia Black Hole Pack 32L
Price: $159.00
Capacity: 32L
Rating: 8/10

Durable recycled materials with water-resistant coating. Great for daily use
and light adventures. Not fully submersible but handles rain well.

Buy now: https://outdoorgearlab.com/buy/patagonia-black-hole-32

Testing Methodology:
We subjected each backpack to rigorous water immersion tests...
[Content continues...]
```

---

### Example 2: Fetch E-commerce Page

**Request**:

```bash
curl https://r.jina.ai/amazon.com/dp/B08XYEXAMPLE \
  -H "User-Agent: Mozilla/5.0"
```

**Response**:

```
Trail Pro Waterproof Backpack 40L

Current Price: $189.99
Original Price: $249.99 (24% off)
Rating: 4.7 out of 5 stars (1,234 ratings)

About this item:
- 100% waterproof with welded seams
- 40L capacity perfect for 2-3 day trips
- Comfortable padded shoulder straps
- External gear loops and pockets
- Available in Black, Blue, and Green
- Lifetime warranty

Product Details:
Brand: Trail Pro
Material: TPU-coated nylon
Dimensions: 22 x 12 x 8 inches
Weight: 2.5 lbs
ASIN: B08XYEXAMPLE

Customer Reviews:
"Perfect for kayaking trips" - 5 stars
"Very durable and truly waterproof" - 5 stars
"A bit heavy but worth it" - 4 stars

Frequently Bought Together:
- Trail Pro Rain Cover ($19.99)
- Waterproof Phone Pouch ($12.99)
- Dry Bags Set of 3 ($24.99)
```

---

### Example 3: Error - Page Not Accessible

**Request**:

```bash
curl https://r.jina.ai/blocked-site.com/page
```

**Response**:

```
Error: Unable to fetch content

The requested page could not be accessed. This may be because:
- The site blocks automated access
- The page requires JavaScript to render
- The URL is invalid or the page doesn't exist
- The site is temporarily unavailable

Please try a different URL.
```

---

## OpenAI API Examples

### Example 1: Product Extraction

**Request**:

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {
        "role": "system",
        "content": "You are a JSON-only product extractor. Return only valid JSON arrays, no other text."
      },
      {
        "role": "user",
        "content": "Extract products from:\n\nTrail Pro Backpack\nPrice: $189.99\n40L waterproof backpack\nBuy: https://store.com/trail-pro\n\nAdventure Pack\nPrice: $175.00\n45L capacity\nLink: https://store.com/adventure"
      }
    ],
    "temperature": 0.3,
    "max_tokens": 1000
  }'
```

**Response**:

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1729876543,
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "[\n  {\n    \"name\": \"Trail Pro Backpack\",\n    \"price\": 189.99,\n    \"url\": \"https://store.com/trail-pro\",\n    \"sku\": \"TP-40L-001\",\n    \"source\": \"store.com\"\n  },\n  {\n    \"name\": \"Adventure Pack\",\n    \"price\": 175.00,\n    \"url\": \"https://store.com/adventure\",\n    \"sku\": \"AP-45L-002\",\n    \"source\": \"store.com\"\n  }\n]"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 145,
    "completion_tokens": 98,
    "total_tokens": 243
  }
}
```

**Parsed Result**:

```json
[
  {
    "name": "Trail Pro Backpack",
    "price": 189.99,
    "url": "https://store.com/trail-pro",
    "sku": "TP-40L-001",
    "source": "store.com"
  },
  {
    "name": "Adventure Pack",
    "price": 175.0,
    "url": "https://store.com/adventure",
    "sku": "AP-45L-002",
    "source": "store.com"
  }
]
```

---

### Example 2: Chat with Tools (via AI SDK)

**Request** (handled by AI SDK):

```typescript
const result = await streamText({
  model: openai("gpt-4o-mini"),
  messages: [
    { role: "user", content: "Find me waterproof backpacks under $200" },
  ],
  system: "You are a shopping assistant...",
  tools: {
    searchWeb: tool({
      description: "Search the web",
      parameters: z.object({ query: z.string() }),
      execute: async ({ query }) => await webSearch(query),
    }),
  },
});
```

**Internal OpenAI Request** (generated by AI SDK):

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "You are a shopping assistant..."
    },
    {
      "role": "user",
      "content": "Find me waterproof backpacks under $200"
    }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "searchWeb",
        "description": "Search the web",
        "parameters": {
          "type": "object",
          "properties": {
            "query": { "type": "string" }
          },
          "required": ["query"]
        }
      }
    }
  ],
  "stream": true
}
```

**Internal OpenAI Response**:

```json
{
  "id": "chatcmpl-xyz789",
  "choices": [
    {
      "delta": {
        "tool_calls": [
          {
            "id": "call_abc123",
            "type": "function",
            "function": {
              "name": "searchWeb",
              "arguments": "{\"query\":\"waterproof backpacks under $200\"}"
            }
          }
        ]
      },
      "finish_reason": "tool_calls"
    }
  ]
}
```

---

### Example 3: Error - Rate Limit

**Request**:

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-YOUR_API_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "test"}]
  }'
```

**Response**:

```json
{
  "error": {
    "message": "Rate limit reached for requests",
    "type": "requests",
    "param": null,
    "code": "rate_limit_exceeded"
  }
}
```

**Status Code**: 429

---

### Example 4: Error - Invalid API Key

**Request**:

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_key" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "test"}]
  }'
```

**Response**:

```json
{
  "error": {
    "message": "Incorrect API key provided: invalid_key. You can find your API key at https://platform.openai.com/account/api-keys.",
    "type": "invalid_request_error",
    "param": null,
    "code": "invalid_api_key"
  }
}
```

**Status Code**: 401

---

## Supabase API Examples

### Example 1: Insert Query Log

**Request**:

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/rest/v1/queries \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "query": "Find me waterproof backpacks under $200",
    "results": [
      {
        "name": "Trail Pro Backpack",
        "price": 189.99,
        "url": "https://store.com/trail-pro"
      },
      {
        "name": "Adventure Pack",
        "price": 175.00,
        "url": "https://store.com/adventure"
      }
    ],
    "latency_ms": 4520
  }'
```

**Response**:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": null,
    "query": "Find me waterproof backpacks under $200",
    "results": [
      {
        "name": "Trail Pro Backpack",
        "price": 189.99,
        "url": "https://store.com/trail-pro"
      },
      {
        "name": "Adventure Pack",
        "price": 175.0,
        "url": "https://store.com/adventure"
      }
    ],
    "latency_ms": 4520,
    "error": null,
    "created_at": "2025-10-25T10:30:00.000Z"
  }
]
```

**Status Code**: 201 Created

---

### Example 2: Insert Products (Bulk)

**Request**:

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/rest/v1/products \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "name": "Trail Pro Backpack",
      "price": 189.99,
      "url": "https://store.com/trail-pro",
      "image": "https://cdn.store.com/trail-pro.jpg",
      "sku": "TP-40L-001",
      "source": "store.com"
    },
    {
      "name": "Adventure Pack",
      "price": 175.00,
      "url": "https://store.com/adventure",
      "image": "https://cdn.store.com/adventure.jpg",
      "sku": "AP-45L-002",
      "source": "store.com"
    }
  ]'
```

**Response**:

```json
[
  {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "sku": "TP-40L-001",
    "name": "Trail Pro Backpack",
    "price": 189.99,
    "url": "https://store.com/trail-pro",
    "image": "https://cdn.store.com/trail-pro.jpg",
    "source": "store.com",
    "created_at": "2025-10-25T10:30:01.000Z"
  },
  {
    "id": "650e8400-e29b-41d4-a716-446655440002",
    "sku": "AP-45L-002",
    "name": "Adventure Pack",
    "price": 175.0,
    "url": "https://store.com/adventure",
    "image": "https://cdn.store.com/adventure.jpg",
    "source": "store.com",
    "created_at": "2025-10-25T10:30:01.000Z"
  }
]
```

**Status Code**: 201 Created

---

### Example 3: Query Recent Searches

**Request**:

```bash
curl -G https://YOUR_PROJECT.supabase.co/rest/v1/queries \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  --data-urlencode "select=id,query,latency_ms,created_at" \
  --data-urlencode "order=created_at.desc" \
  --data-urlencode "limit=10"
```

**Response**:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "query": "Find me waterproof backpacks under $200",
    "latency_ms": 4520,
    "created_at": "2025-10-25T10:30:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "query": "I need 50 hygiene kits under $30",
    "latency_ms": 3890,
    "created_at": "2025-10-25T10:25:00.000Z"
  }
]
```

**Status Code**: 200 OK

---

### Example 4: Error - Row Level Security

**Request**:

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/rest/v1/queries \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "test query"
  }'
```

**Response** (if RLS enabled without policy):

```json
{
  "code": "42501",
  "details": null,
  "hint": null,
  "message": "new row violates row-level security policy for table \"queries\""
}
```

**Status Code**: 403 Forbidden

**Solution**: Disable RLS or add permissive policy (see TROUBLESHOOTING.MD)

---

## Complete Flow Example

### Scenario: User searches for "wireless headphones under $100"

**Step 1: Client sends message**

```javascript
// Frontend (page.tsx)
const { messages, input, handleSubmit } = useChat();

// User types and submits
handleSubmit({
  preventDefault: () => {}
});

// Request sent to /api/chat
POST /api/chat
{
  "messages": [
    {
      "role": "user",
      "content": "wireless headphones under $100"
    }
  ]
}
```

---

**Step 2: API route processes with AI SDK**

```typescript
// Backend (app/api/chat/route.ts)
const result = streamText({
  model: openai("gpt-4o-mini"),
  messages,
  tools: { searchWeb, fetchPage, extractProducts },
});

// AI decides to call searchWeb tool
```

---

**Step 3: searchWeb tool executes**

```typescript
// lib/web.ts
const results = await webSearch("wireless headphones under $100", 5);

// Internal call to Tavily
POST https://api.tavily.com/search
{
  "api_key": "tvly-...",
  "query": "wireless headphones under $100",
  "max_results": 5
}

// Tavily response
{
  "results": [
    {
      "title": "Best Budget Wireless Headphones 2025",
      "url": "https://techreview.com/wireless-headphones-budget",
      "snippet": "Top picks under $100..."
    },
    {
      "title": "Wireless Headphones Under $100 | Amazon",
      "url": "https://amazon.com/s?k=wireless+headphones+under+100",
      "snippet": "Shop wireless headphones with Prime shipping..."
    },
    {
      "title": "Best Cheap Wireless Headphones - CNET",
      "url": "https://cnet.com/best-wireless-headphones-under-100",
      "snippet": "We tested 20 models under $100..."
    }
  ]
}
```

---

**Step 4: fetchPage tool executes**

```typescript
// lib/web.ts
const content = await fetchClean("https://techreview.com/wireless-headphones-budget");

// Internal call to Jina Reader
GET https://r.jina.ai/techreview.com/wireless-headphones-budget

// Jina response (plain text)
```

TechReview - Best Budget Wireless Headphones 2025

After extensive testing, here are our top picks under $100:

1. SoundCore Q20
   Price: $79.99
   Battery: 40 hours
   Noise Cancellation: Yes
   Rating: 4.5/5
   Buy: https://techreview.com/buy/soundcore-q20

2. JBL Tune 510BT
   Price: $49.99
   Battery: 40 hours
   Bluetooth 5.0
   Rating: 4.3/5
   Buy: https://techreview.com/buy/jbl-tune-510

3. Sony WH-CH520
   Price: $59.99
   Battery: 50 hours
   Lightweight design
   Rating: 4.4/5
   Buy: https://techreview.com/buy/sony-ch520

```

```

---

**Step 5: extractProducts tool executes**

```typescript
// lib/extract.ts
const products = await extractProducts(content);

// Internal call to OpenAI
POST https://api.openai.com/v1/chat/completions
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "You are a JSON-only product extractor..."
    },
    {
      "role": "user",
      "content": "Extract products from: [content]"
    }
  ]
}

// OpenAI response
{
  "choices": [{
    "message": {
      "content": "[{\"name\":\"SoundCore Q20\",\"price\":79.99,...}, ...]"
    }
  }]
}

// Parsed products
[
  {
    "name": "SoundCore Q20 Wireless Headphones",
    "price": 79.99,
    "url": "https://techreview.com/buy/soundcore-q20",
    "sku": "SC-Q20-001",
    "source": "techreview.com"
  },
  {
    "name": "JBL Tune 510BT",
    "price": 49.99,
    "url": "https://techreview.com/buy/jbl-tune-510",
    "sku": "JBL-510BT",
    "source": "techreview.com"
  },
  {
    "name": "Sony WH-CH520",
    "price": 59.99,
    "url": "https://techreview.com/buy/sony-ch520",
    "sku": "SONY-CH520",
    "source": "techreview.com"
  }
]
```

---

**Step 6: Store products in database**

```typescript
// Non-blocking insert
queueMicrotask(async () => {
  await supabase.from("products").insert(products);
});

// Supabase request
POST https://YOUR_PROJECT.supabase.co/rest/v1/products
[
  {
    "name": "SoundCore Q20 Wireless Headphones",
    "price": 79.99,
    "url": "https://techreview.com/buy/soundcore-q20",
    ...
  },
  ...
]
```

---

**Step 7: AI generates response**

```
Stream to client:
"I found 3 great wireless headphones under $100:

1. **SoundCore Q20 Wireless Headphones** - $79.99
   40-hour battery life with active noise cancellation
   [View Product →](https://techreview.com/buy/soundcore-q20)

2. **JBL Tune 510BT** - $49.99
   Excellent value with 40-hour battery and Bluetooth 5.0
   [View Product →](https://techreview.com/buy/jbl-tune-510)

3. **Sony WH-CH520** - $59.99
   Lightweight design with impressive 50-hour battery life
   [View Product →](https://techreview.com/buy/sony-ch520)"
```

---

**Step 8: Log query to database**

```typescript
// onFinish callback
await supabase.from("queries").insert({
  query: "wireless headphones under $100",
  results: products,
  latency_ms: 4320
});

// Supabase request
POST https://YOUR_PROJECT.supabase.co/rest/v1/queries
{
  "query": "wireless headphones under $100",
  "results": [...],
  "latency_ms": 4320
}
```

---

**Step 9: Client renders response**

```javascript
// Frontend receives stream and displays
messages = [
  {
    role: "user",
    content: "wireless headphones under $100",
  },
  {
    role: "assistant",
    content: "I found 3 great wireless headphones under $100:\n\n1. ...",
  },
];
```

---

## Testing Examples

### Test 1: API Endpoint with cURL

```bash
# Basic test
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'

# With verbose output
curl -v -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Find laptops under $1000"}]}'

# Save response to file
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}' \
  > response.txt
```

---

### Test 2: Integration Test with Node.js

```javascript
// test-integration.js
import fetch from "node-fetch";

async function testChatAPI() {
  const response = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "user", content: "Find me waterproof backpacks under $200" },
      ],
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    console.log("Chunk:", chunk);
  }
}

testChatAPI().catch(console.error);
```

---

### Test 3: Load Testing with Artillery

```yaml
# artillery-config.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - name: "Chat API"
    flow:
      - post:
          url: "/api/chat"
          json:
            messages:
              - role: "user"
                content: "Find me laptops under $1000"
```

```bash
# Run load test
artillery run artillery-config.yml
```

---

### Test 4: Unit Test for webSearch

```typescript
// test/web.test.ts
import { webSearch } from "@/lib/web";

describe("webSearch", () => {
  it("should return search results", async () => {
    const results = await webSearch("test query", 5);

    expect(results).toBeInstanceOf(Array);
    expect(results.length).toBeLessThanOrEqual(5);

    if (results.length > 0) {
      expect(results[0]).toHaveProperty("title");
      expect(results[0]).toHaveProperty("url");
    }
  });

  it("should cache results", async () => {
    const start1 = Date.now();
    await webSearch("cache test", 3);
    const time1 = Date.now() - start1;

    const start2 = Date.now();
    await webSearch("cache test", 3);
    const time2 = Date.now() - start2;

    expect(time2).toBeLessThan(time1 / 10); // 10x faster with cache
  });
});
```

---

## Conclusion

These examples demonstrate all API interactions in ChatCommerce AI. Use them for:

- Understanding data flow
- Debugging issues
- Integration testing
- API key validation
- Performance analysis

For more information, see:

- [EXECUTION-PLAN.MD](./EXECUTION-PLAN.MD) - Step-by-step implementation
- [ARCHITECTURE.MD](./ARCHITECTURE.MD) - System design
- [TROUBLESHOOTING.MD](./TROUBLESHOOTING.MD) - Problem solving

---

**Document Version**: 1.0
**Last Updated**: October 2025
**Maintained By**: Development Team
