import { createClient } from "@supabase/supabase-js";

// Validate environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error("Missing SUPABASE_URL environment variable");
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error("Missing SUPABASE_ANON_KEY environment variable");
}

// Create Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false, // Server-side: no session persistence needed
    },
  }
);

// Type definitions for database tables
export type Query = {
  id: string;
  user_id?: string;
  query: string;
  results?: any;
  latency_ms?: number;
  error?: string;
  created_at: string;
};

export type Product = {
  id: string;
  sku?: string;
  name: string;
  price?: number;
  url?: string;
  image?: string;
  source?: string;
  created_at: string;
};
