-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: queries
-- Stores all user search queries and extracted results
CREATE TABLE IF NOT EXISTS queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  query TEXT NOT NULL,
  results JSONB,
  latency_ms INTEGER,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for queries table
CREATE INDEX IF NOT EXISTS idx_queries_created_at
  ON queries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_queries_user_id
  ON queries(user_id)
  WHERE user_id IS NOT NULL;

-- Table: products
-- Stores all discovered products for analytics
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT,
  name TEXT NOT NULL,
  price NUMERIC,
  url TEXT,
  image TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for products table
CREATE INDEX IF NOT EXISTS idx_products_source
  ON products(source);

CREATE INDEX IF NOT EXISTS idx_products_price
  ON products(price)
  WHERE price IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_created_at
  ON products(created_at DESC);

-- Optional: Add Row Level Security (RLS) policies
-- Uncomment if you want to enable RLS

-- ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow anonymous inserts" ON queries
--   FOR INSERT TO anon
--   WITH CHECK (true);

-- CREATE POLICY "Allow anonymous inserts" ON products
--   FOR INSERT TO anon
--   WITH CHECK (true);
