import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Supabase credentials
const SUPABASE_URL = 'https://akwnbczoupvwkasylrtf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrd25iY3pvdXB2d2thc3lscnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzOTYzMTAsImV4cCI6MjA3Njk3MjMxMH0.fKA9--ryGhjLdP0ZVepwSuh8um-nOMFOtU6XTk-0qGg';

console.log("🗄️  Executando SQL Schema no Supabase...\n");

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Read SQL file
const sqlContent = readFileSync('./chatcommerce-ai/supabase.sql', 'utf8');

console.log("📄 SQL lido do arquivo supabase.sql");
console.log("📊 Tamanho:", sqlContent.length, "caracteres\n");

// Since Supabase JS client doesn't support raw SQL execution via anon key,
// we'll provide instructions for manual execution
console.log("═══════════════════════════════════════════════════════════");
console.log("⚠️  EXECUTAR MANUALMENTE NO SUPABASE SQL EDITOR");
console.log("═══════════════════════════════════════════════════════════\n");

console.log("🔗 Acesse: https://supabase.com/dashboard/project/akwnbczoupvwkasylrtf/sql/new\n");

console.log("📋 Cole este SQL:\n");
console.log("─────────────────────────────────────────────────────────");
console.log(sqlContent);
console.log("─────────────────────────────────────────────────────────\n");

console.log("✅ Após executar, você verá: 'Success. No rows returned'\n");

console.log("═══════════════════════════════════════════════════════════");
console.log("📋 CREDENCIAIS CONFIGURADAS");
console.log("═══════════════════════════════════════════════════════════");
console.log("SUPABASE_URL:", SUPABASE_URL);
console.log("SUPABASE_ANON_KEY:", SUPABASE_ANON_KEY.substring(0, 30) + "...");
console.log("\n✅ Use estas credenciais na Vercel!\n");
