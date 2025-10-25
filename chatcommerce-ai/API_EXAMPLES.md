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
