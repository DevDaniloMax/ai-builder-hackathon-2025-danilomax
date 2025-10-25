# ChatCommerce AI - Troubleshooting Guide

**Version**: 1.0
**Last Updated**: October 2025

---

## Table of Contents

1. [Setup Issues](#setup-issues)
2. [Environment Variables](#environment-variables)
3. [API Integration Errors](#api-integration-errors)
4. [Database Issues](#database-issues)
5. [Build and Deploy Errors](#build-and-deploy-errors)
6. [Runtime Errors](#runtime-errors)
7. [Performance Problems](#performance-problems)
8. [UI/UX Issues](#uiux-issues)
9. [Common Error Messages](#common-error-messages)
10. [Debug Tools and Techniques](#debug-tools-and-techniques)

---

## Setup Issues

### Problem: Node.js version incompatibility

**Symptoms**:

```
Error: The engine "node" is incompatible with this module
```

**Cause**: Project requires Node.js >= 18, but older version installed

**Solution**:

```bash
# Check current version
node --version

# Install Node.js 18+ using nvm
nvm install 18
nvm use 18

# Verify
node --version  # Should show v18.x.x or higher
```

---

### Problem: npm install fails with ERESOLVE errors

**Symptoms**:

```
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Cause**: Conflicting package versions

**Solution**:

```bash
# Option 1: Use legacy peer deps
npm install --legacy-peer-deps

# Option 2: Force install
npm install --force

# Option 3: Clean install
rm -rf node_modules package-lock.json
npm install
```

---

### Problem: Port 3000 already in use

**Symptoms**:

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Cause**: Another process using port 3000

**Solution**:

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
lsof -ti:3000 | xargs kill

# Or use different port
PORT=3001 npm run dev
```

---

### Problem: TypeScript compilation errors on fresh install

**Symptoms**:

```
Type error: Cannot find module '@/types/product'
```

**Cause**: Missing files or incorrect tsconfig

**Solution**:

```bash
# Verify tsconfig.json exists
cat tsconfig.json

# Ensure paths configured
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}

# Restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

## Environment Variables

### Problem: Environment variables not loading

**Symptoms**:

- `process.env.OPENAI_API_KEY` is `undefined`
- API calls fail with authentication errors

**Cause**: `.env.local` not created or dev server not restarted

**Solution**:

```bash
# 1. Verify .env.local exists
ls -la .env.local

# 2. Check contents
cat .env.local

# 3. Restart dev server (REQUIRED after .env changes)
# Stop server (Ctrl+C)
npm run dev
```

**Verification**:

```typescript
// Add to API route temporarily
console.log("API Key:", process.env.OPENAI_API_KEY?.slice(0, 10));
```

---

### Problem: NEXT_PUBLIC_ variables not accessible in client

**Symptoms**:

```
// In client component
console.log(process.env.NEXT_PUBLIC_APP_NAME); // undefined
```

**Cause**: Variables need to be referenced during build

**Solution**:

```bash
# 1. Ensure variable has NEXT_PUBLIC_ prefix
NEXT_PUBLIC_APP_NAME=ChatCommerce AI

# 2. Rebuild
npm run build
npm run dev

# 3. Access correctly in client
const appName = process.env.NEXT_PUBLIC_APP_NAME;
```

---

### Problem: Environment variables work locally but not in production

**Symptoms**:

- App works on `localhost`
- Fails after deploying to Vercel

**Cause**: Environment variables not configured in Vercel dashboard

**Solution**:

```bash
# 1. Go to Vercel project settings
# https://vercel.com/your-username/project/settings/environment-variables

# 2. Add each variable:
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_NAME=ChatCommerce AI

# 3. Select environments: Production, Preview, Development

# 4. Redeploy
vercel --prod
```

---

## API Integration Errors

### Problem: OpenAI API returns 401 Unauthorized

**Symptoms**:

```
Error: 401 Incorrect API key provided
```

**Cause**: Invalid or missing API key

**Solution**:

```bash
# 1. Verify API key format
# Should start with: sk-proj-...
echo $OPENAI_API_KEY

# 2. Test API key directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 3. If invalid, generate new key
# Visit: https://platform.openai.com/api-keys

# 4. Update .env.local
OPENAI_API_KEY=sk-proj-NEW_KEY_HERE

# 5. Restart server
```

**Prevention**:

- Never commit API keys to git
- Rotate keys periodically
- Use separate keys for dev/prod

---

### Problem: OpenAI API returns 429 Rate Limit Exceeded

**Symptoms**:

```
Error: 429 Rate limit reached for requests
```

**Cause**: Too many requests in short time

**Solution**:

```typescript
// Implement retry with exponential backoff
async function callOpenAIWithRetry(fn: () => Promise<any>, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error?.status === 429 && i < retries - 1) {
        const delay = 1000 * Math.pow(2, i); // 1s, 2s, 4s
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

// Usage
const response = await callOpenAIWithRetry(() =>
  client.chat.completions.create({...})
);
```

**Prevention**:

- Implement caching
- Add rate limiting on your side
- Upgrade OpenAI tier if needed

---

### Problem: Tavily API returns empty results

**Symptoms**:

```
[webSearch] Found 0 results
```

**Cause**: Query too specific, API issue, or rate limit

**Solution**:

```typescript
// 1. Test API key directly
curl -X POST https://api.tavily.com/search \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "tvly-YOUR_KEY",
    "query": "test query",
    "max_results": 5
  }'

// 2. Broaden search query
// Bad: "red Nike Air Max size 10 under $100"
// Good: "Nike Air Max shoes"

// 3. Check API status
// Visit: https://status.tavily.com

// 4. Add fallback
export async function webSearch(query: string, maxResults = 5) {
  const results = await tavilySearch(query, maxResults);

  if (results.length === 0) {
    console.warn(`No results for: "${query}"`);
    // Try broader query
    const broader = query.split(' ').slice(0, 3).join(' ');
    return await tavilySearch(broader, maxResults);
  }

  return results;
}
```

---

### Problem: Jina Reader returns empty content

**Symptoms**:

```
[fetchClean] Fetched 0 characters
```

**Cause**: Site blocks scrapers, page requires JavaScript, or URL invalid

**Solution**:

```typescript
// 1. Verify URL is accessible
curl -I https://example.com/page

// 2. Test Jina Reader directly
curl https://r.jina.ai/example.com/page

// 3. Add retry with different approach
export async function fetchClean(url: string): Promise<string> {
  // Try Jina first
  let content = await fetchViaJina(url);

  if (content.length === 0) {
    console.warn(`Jina failed for: ${url}`);
    // Fallback: direct fetch
    content = await fetchDirect(url);
  }

  return content;
}

async function fetchDirect(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)'
    }
  });
  const html = await response.text();
  // Basic HTML stripping (not as good as Jina)
  return html.replace(/<[^>]*>/g, ' ').trim();
}
```

---

### Problem: Supabase connection timeout

**Symptoms**:

```
Error: connect ETIMEDOUT
```

**Cause**: Network issue, incorrect URL, or Supabase service down

**Solution**:

```bash
# 1. Test connection
curl https://YOUR_PROJECT.supabase.co/rest/v1/

# 2. Verify environment variables
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# 3. Check Supabase status
# Visit: https://status.supabase.com

# 4. Test with Supabase CLI
npx supabase projects list

# 5. Add timeout and retry
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: false },
    global: {
      fetch: (...args) => {
        return Promise.race([
          fetch(...args),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
          ),
        ]);
      },
    },
  }
);
```

---

## Database Issues

### Problem: SQL execution fails - table already exists

**Symptoms**:

```
ERROR: relation "queries" already exists
```

**Cause**: Running SQL schema script multiple times

**Solution**:

```sql
-- Use IF NOT EXISTS (already in our schema)
CREATE TABLE IF NOT EXISTS queries (...);

-- Or drop and recreate (CAUTION: deletes data)
DROP TABLE IF EXISTS queries CASCADE;
CREATE TABLE queries (...);
```

---

### Problem: Row Level Security blocking inserts

**Symptoms**:

```
Error: new row violates row-level security policy
```

**Cause**: RLS enabled but no policy allows inserts

**Solution**:

```sql
-- Option 1: Disable RLS (for MVP)
ALTER TABLE queries DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Option 2: Add permissive policy
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON queries
  FOR INSERT TO anon
  WITH CHECK (true);

-- Option 3: Use service role key (not anon key)
// In lib/db.ts
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Not anon key
  { auth: { persistSession: false } }
);
```

---

### Problem: JSONB column insert fails

**Symptoms**:

```
Error: invalid input syntax for type json
```

**Cause**: Passing string instead of JSON object

**Solution**:

```typescript
// ❌ Wrong
await supabase.from("queries").insert({
  results: "[{...}]"  // String
});

// ✅ Correct
await supabase.from("queries").insert({
  results: [{...}]  // Array/Object
});

// Or explicitly cast
await supabase.from("queries").insert({
  results: JSON.parse("[{...}]")
});
```

---

### Problem: Database queries slow (> 1s)

**Symptoms**:

- Queries taking >1 second
- UI feels sluggish

**Cause**: Missing indexes or inefficient queries

**Solution**:

```sql
-- 1. Check query performance
EXPLAIN ANALYZE
SELECT * FROM queries
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;

-- 2. Add missing indexes
CREATE INDEX CONCURRENTLY idx_queries_created_at
  ON queries(created_at DESC);

-- 3. Use pagination
SELECT * FROM queries
ORDER BY created_at DESC
LIMIT 100 OFFSET 0;

-- 4. Avoid SELECT * (select only needed columns)
SELECT id, query, latency_ms
FROM queries;
```

---

## Build and Deploy Errors

### Problem: Next.js build fails with TypeScript errors

**Symptoms**:

```
Type error: Property 'X' does not exist on type 'Y'
```

**Cause**: Type mismatches or missing type definitions

**Solution**:

```bash
# 1. Check types locally
npx tsc --noEmit

# 2. Fix type errors
# Common fixes:

// Add type assertion
const value = data as ExpectedType;

// Make property optional
type Product = {
  price?: number;  // Add ?
};

// Use type guard
if ('price' in product) {
  console.log(product.price);
}

# 3. Skip type checking temporarily (NOT RECOMMENDED)
// next.config.js
module.exports = {
  typescript: {
    ignoreBuildErrors: true,  // Only for emergency
  },
};
```

---

### Problem: Vercel deployment fails - build timeout

**Symptoms**:

```
Error: Command "npm run build" timed out after 45s
```

**Cause**: Build taking too long or infinite loop

**Solution**:

```bash
# 1. Check build locally
time npm run build

# 2. Optimize dependencies
npm prune
npm dedupe

# 3. Reduce bundle size
// next.config.js
module.exports = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

# 4. Use build cache
// Vercel automatically caches, but verify in dashboard

# 5. Upgrade Vercel plan (if needed)
# Hobby: 45s timeout
# Pro: 15min timeout
```

---

### Problem: Edge runtime error - unsupported API

**Symptoms**:

```
Error: The edge runtime does not support Node.js 'fs' module
```

**Cause**: Using Node.js-only APIs in edge runtime

**Solution**:

```typescript
// Option 1: Remove edge runtime
// Remove from app/api/chat/route.ts
// export const runtime = "edge";  // Comment out

// Option 2: Use edge-compatible alternatives
// Instead of fs.readFileSync():
const response = await fetch("/api/data");
const data = await response.json();

// Option 3: Move to serverless function
export const runtime = "nodejs"; // Use Node.js runtime
```

---

### Problem: Environment variables missing in build

**Symptoms**:

```
Error: process.env.OPENAI_API_KEY is undefined
```

**Cause**: Variables not available during build time

**Solution**:

```bash
# For build-time variables (client-side)
NEXT_PUBLIC_APP_NAME=ChatCommerce AI

# For runtime variables (server-side)
OPENAI_API_KEY=sk-...  # Available in API routes only

# In Vercel:
# 1. Add variables in dashboard
# 2. Select "Production" AND "Preview" environments
# 3. Redeploy
```

---

## Runtime Errors

### Problem: "Failed to fetch" error in browser

**Symptoms**:

```
TypeError: Failed to fetch
```

**Cause**: CORS issue, network problem, or API route not responding

**Solution**:

```bash
# 1. Check API route is running
curl http://localhost:3000/api/chat

# 2. Verify fetch URL is correct
// In client
console.log('Fetching:', '/api/chat');

# 3. Check browser network tab
# - Request URL correct?
# - Response status?
# - Any CORS errors?

# 4. Test API directly
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'
```

---

### Problem: Streaming response stops mid-way

**Symptoms**:

- Response starts streaming
- Stops after few words
- No error shown

**Cause**: Timeout, error in tool execution, or connection dropped

**Solution**:

```typescript
// 1. Add error logging
export async function POST(req: NextRequest) {
  try {
    const result = streamText({...});
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('[API] Streaming error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 2. Add timeout to tools
const timeout = setTimeout(() => {
  console.error('[Tool] Timeout exceeded');
}, 30000);

try {
  const result = await toolFunction();
  clearTimeout(timeout);
  return result;
} catch (error) {
  clearTimeout(timeout);
  throw error;
}

// 3. Check client error handling
const { error } = useChat({
  onError: (error) => {
    console.error('Chat error:', error);
    alert('An error occurred: ' + error.message);
  },
});
```

---

### Problem: Memory leak - application crashes after extended use

**Symptoms**:

```
JavaScript heap out of memory
FATAL ERROR: Reached heap limit
```

**Cause**: Cache growing indefinitely

**Solution**:

```typescript
// Implement cache size limit
const MAX_CACHE_SIZE = 100;

function setCache<T>(key: string, data: T): void {
  // Remove oldest if at limit
  if (CACHE.size >= MAX_CACHE_SIZE) {
    const firstKey = CACHE.keys().next().value;
    CACHE.delete(firstKey);
  }

  CACHE.set(key, {
    data,
    timestamp: Date.now(),
  });
}

// Add periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of CACHE.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      CACHE.delete(key);
    }
  }
}, 60000); // Clean every minute
```

---

## Performance Problems

### Problem: Response time consistently > 10 seconds

**Symptoms**:

- Every query takes >10s
- Timeout errors

**Cause**: Network latency, API issues, or inefficient code

**Solution**:

```typescript
// 1. Add performance logging
const start = Date.now();

const searchResults = await webSearch(query);
console.log(`[Perf] webSearch: ${Date.now() - start}ms`);

const content = await fetchClean(url);
console.log(`[Perf] fetchClean: ${Date.now() - start}ms`);

const products = await extractProducts(content);
console.log(`[Perf] extractProducts: ${Date.now() - start}ms`);

// 2. Optimize API calls
// Run independent calls in parallel
const [searchResults, cachedData] = await Promise.all([
  webSearch(query),
  getCachedData(),
]);

// 3. Reduce content size
const trimmed = text.slice(0, 8000); // Reduce from 12k to 8k

// 4. Use faster models
model: openai("gpt-4o-mini"), // Already fastest
```

---

### Problem: Cache not improving performance

**Symptoms**:

- Second identical query still slow
- Cache hit rate: 0%

**Cause**: Cache key mismatch or TTL too short

**Solution**:

```typescript
// 1. Add cache hit logging
const cached = getCached<T>(cacheKey);
if (cached) {
  console.log(`[Cache HIT] ${cacheKey}`);
  return cached;
} else {
  console.log(`[Cache MISS] ${cacheKey}`);
}

// 2. Verify cache key consistency
const cacheKey = `tavily:${query}:${maxResults}`;
console.log("[Cache] Key:", cacheKey);

// 3. Check TTL
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
console.log("[Cache] TTL:", CACHE_TTL);

// 4. Test cache directly
CACHE.set("test", { data: "value", timestamp: Date.now() });
console.log("[Cache] Test:", CACHE.get("test"));
```

---

### Problem: Vercel function timeout (10s limit)

**Symptoms**:

```
Error: Function execution timeout
```

**Cause**: Query taking longer than 10s (Hobby plan limit)

**Solution**:

```typescript
// 1. Implement faster path
// - Reduce maxResults
// - Skip fetchPage for some URLs
// - Use more aggressive caching

// 2. Set lower timeouts on external APIs
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000); // 5s timeout

await fetch(url, { signal: controller.signal });

// 3. Return partial results
if (Date.now() - startTime > 8000) {
  console.warn("[Timeout] Returning partial results");
  return partialResults;
}

// 4. Upgrade Vercel plan
// Hobby: 10s
// Pro: 60s
// Enterprise: 900s
```

---

## UI/UX Issues

### Problem: Messages not auto-scrolling

**Symptoms**:

- New messages appear but view doesn't scroll
- User must manually scroll down

**Cause**: Scroll ref not updating

**Solution**:

```typescript
const messagesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "end",
  });
}, [messages]); // Trigger on messages change

return (
  <div className="messages">
    {messages.map((m) => (
      <Message key={m.id} {...m} />
    ))}
    <div ref={messagesEndRef} /> {/* Scroll anchor */}
  </div>
);
```

---

### Problem: Markdown links not clickable

**Symptoms**:

- Links display as plain text
- No clickable anchors

**Cause**: Markdown not being parsed in render

**Solution**:

```typescript
// Current (in page.tsx)
dangerouslySetInnerHTML={{
  __html: message.content
    .replace(/\n/g, "<br />")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline hover:text-blue-600">$1</a>'
    ),
}}

// Or use markdown library
import ReactMarkdown from 'react-markdown';

<ReactMarkdown>{message.content}</ReactMarkdown>
```

---

### Problem: Loading indicator not showing

**Symptoms**:

- isLoading is true but no visual feedback

**Cause**: Conditional rendering issue

**Solution**:

```typescript
const { isLoading } = useChat();

{
  isLoading && (
    <div className="flex justify-start">
      <div className="bg-white border rounded-lg px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
        </div>
      </div>
    </div>
  );
}
```

---

## Common Error Messages

### "Module not found: Can't resolve 'X'"

**Cause**: Missing npm package

**Solution**:

```bash
npm install X
```

---

### "Hydration failed because the initial UI does not match"

**Cause**: Server-rendered HTML differs from client

**Solution**:

```typescript
// Use client-side only rendering
import dynamic from "next/dynamic";

const ClientOnlyComponent = dynamic(() => import("./Component"), {
  ssr: false,
});
```

---

### "Invalid hook call"

**Cause**: Using hooks outside React component or wrong React version

**Solution**:

```bash
# Check React version
npm list react

# Ensure single React instance
npm dedupe react
```

---

## Debug Tools and Techniques

### 1. Enable Verbose Logging

```typescript
// lib/web.ts
const DEBUG = process.env.NODE_ENV === "development";

if (DEBUG) {
  console.log("[DEBUG] Query:", query);
  console.log("[DEBUG] Results:", results);
}
```

### 2. Use Vercel Logs

```bash
# Tail production logs
vercel logs --follow

# Get logs for specific deployment
vercel logs https://your-deployment-url.vercel.app
```

### 3. Test API Routes Directly

```bash
# Test locally
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}' \
  -v

# Test production
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}' \
  -v
```

### 4. Browser DevTools

```javascript
// In browser console
// Check environment
console.log("App name:", process.env.NEXT_PUBLIC_APP_NAME);

// Monitor fetch requests
performance
  .getEntriesByType("resource")
  .filter((r) => r.name.includes("/api/"))
  .forEach((r) => console.log(r.name, r.duration));
```

### 5. Database Query Analysis

```sql
-- Enable query timing
\timing

-- Analyze slow queries
SELECT
  query,
  latency_ms,
  created_at
FROM queries
WHERE latency_ms > 5000
ORDER BY latency_ms DESC
LIMIT 10;
```

---
