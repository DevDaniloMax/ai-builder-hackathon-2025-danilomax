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
