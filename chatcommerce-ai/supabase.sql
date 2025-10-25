-- ============================================================================
-- CHATCOMMERCE AI - SECURE DATABASE SCHEMA
-- ============================================================================
-- This schema includes Row Level Security (RLS) enabled for production safety
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLE: queries
-- ============================================================================
-- Stores all user search queries and extracted results for analytics

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

-- ============================================================================
-- TABLE: products
-- ============================================================================
-- Stores all discovered products for analytics

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT,
  name TEXT NOT NULL,
  price NUMERIC(10, 2),
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

CREATE INDEX IF NOT EXISTS idx_products_sku
  ON products(sku)
  WHERE sku IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- CRITICAL: These policies protect your database from unauthorized access
-- The anon key is exposed to the frontend, so RLS is MANDATORY

-- Enable RLS on both tables
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to INSERT queries
-- This allows the chat interface to log search queries
CREATE POLICY "Allow anonymous query inserts"
  ON queries
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow anonymous users to INSERT products
-- This allows the AI to store discovered products
CREATE POLICY "Allow anonymous product inserts"
  ON products
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Prevent anonymous users from UPDATING or DELETING queries
-- Only authenticated users or service role can modify existing data
CREATE POLICY "Prevent anonymous query modifications"
  ON queries
  FOR UPDATE
  TO anon
  USING (false);

CREATE POLICY "Prevent anonymous query deletions"
  ON queries
  FOR DELETE
  TO anon
  USING (false);

-- Policy: Prevent anonymous users from UPDATING or DELETING products
CREATE POLICY "Prevent anonymous product modifications"
  ON products
  FOR UPDATE
  TO anon
  USING (false);

CREATE POLICY "Prevent anonymous product deletions"
  ON products
  FOR DELETE
  TO anon
  USING (false);

-- Policy: Allow anonymous users to READ queries (optional - for analytics)
-- Uncomment if you want to allow frontend to read query history
-- CREATE POLICY "Allow anonymous query reads"
--   ON queries
--   FOR SELECT
--   TO anon
--   USING (true);

-- Policy: Allow anonymous users to READ products (optional - for product catalog)
-- Uncomment if you want to allow frontend to browse products
-- CREATE POLICY "Allow anonymous product reads"
--   ON products
--   FOR SELECT
--   TO anon
--   USING (true);

-- ============================================================================
-- SECURITY VERIFICATION
-- ============================================================================
-- Run this query to verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename IN ('queries', 'products');
-- 
-- Expected result: Both tables should have rowsecurity = true

-- ============================================================================
-- PERFORMANCE NOTES
-- ============================================================================
-- All frequently queried columns have indexes for optimal performance
-- JSONB column 'results' can be queried with GIN index if needed:
-- CREATE INDEX idx_queries_results_gin ON queries USING GIN (results);
