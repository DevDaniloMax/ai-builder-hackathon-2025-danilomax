import { readFileSync, writeFileSync } from 'fs';

// ============================================================================
// CREDENCIAIS OBTIDAS
// ============================================================================

const SUPABASE_URL = 'https://akwnbczoupvwkasylrtf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrd25iY3pvdXB2d2thc3lscnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzOTYzMTAsImV4cCI6MjA3Njk3MjMxMH0.fKA9--ryGhjLdP0ZVepwSuh8um-nOMFOtU6XTk-0qGg';
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

console.log("\n╔════════════════════════════════════════════════════════╗");
console.log("║     🚀 SETUP COMPLETO - CHATCOMMERCE AI               ║");
console.log("╚════════════════════════════════════════════════════════╝\n");

// ============================================================================
// STEP 1: SUPABASE SQL SCHEMA
// ============================================================================

console.log("═══════════════════════════════════════════════════════════");
console.log("STEP 1: 🗄️  SUPABASE - SQL SCHEMA");
console.log("═══════════════════════════════════════════════════════════\n");

const sqlContent = readFileSync('./chatcommerce-ai/supabase.sql', 'utf8');

console.log("📋 Execute este SQL no Supabase SQL Editor:");
console.log("🔗 https://supabase.com/dashboard/project/akwnbczoupvwkasylrtf/sql/new\n");

console.log("─────────────────────────────────────────────────────────");
console.log(sqlContent);
console.log("─────────────────────────────────────────────────────────\n");

console.log("✅ Após executar, você verá: 'Success. No rows returned'\n");

// ============================================================================
// STEP 2: VERCEL PROJECT
// ============================================================================

console.log("═══════════════════════════════════════════════════════════");
console.log("STEP 2: 🚀 VERCEL - CRIAR PROJETO");
console.log("═══════════════════════════════════════════════════════════\n");

async function setupVercel() {
  try {
    const headers = {
      "Authorization": `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json"
    };
    
    console.log("🔍 Verificando usuário Vercel...");
    const userRes = await fetch("https://api.vercel.com/v2/user", { headers });
    
    if (!userRes.ok) {
      throw new Error(`Vercel auth failed: ${userRes.status}`);
    }
    
    const user = await userRes.json();
    console.log(`✅ Usuário: ${user.username || user.email}\n`);
    
    // Create project
    console.log("🏗️  Criando projeto na Vercel...");
    
    const projectPayload = {
      name: "chatcommerce-ai",
      framework: "nextjs",
      gitRepository: {
        repo: "DevDaniloMax/ai-builder-hackathon-2025-danilomax",
        type: "github"
      },
      buildCommand: null, // Use default
      rootDirectory: "chatcommerce-ai"
    };
    
    const projectRes = await fetch("https://api.vercel.com/v10/projects", {
      method: "POST",
      headers,
      body: JSON.stringify(projectPayload)
    });
    
    if (!projectRes.ok) {
      const error = await projectRes.text();
      
      // Check if exists
      if (projectRes.status === 409 || error.includes('already exists')) {
        console.log("⚠️  Projeto já existe, obtendo informações...\n");
        
        const listRes = await fetch("https://api.vercel.com/v9/projects", { headers });
        const data = await listRes.json();
        const existing = data.projects?.find(p => p.name === "chatcommerce-ai");
        
        if (existing) {
          console.log("✅ Projeto encontrado:", existing.name);
          return existing;
        }
      }
      
      throw new Error(`Failed to create project: ${projectRes.status} ${error}`);
    }
    
    const project = await projectRes.json();
    console.log(`✅ Projeto criado: ${project.name}`);
    console.log(`🔗 URL: https://${project.name}.vercel.app\n`);
    
    return project;
    
  } catch (error) {
    console.error("❌ Erro Vercel:", error.message);
    return null;
  }
}

async function configureEnvVars(projectId) {
  if (!projectId) {
    console.log("⚠️  Sem project ID, pulando configuração de env vars\n");
    return;
  }
  
  console.log("⚙️  Configurando Environment Variables...\n");
  
  const headers = {
    "Authorization": `Bearer ${VERCEL_TOKEN}`,
    "Content-Type": "application/json"
  };
  
  const envVars = [
    {
      key: "SUPABASE_URL",
      value: SUPABASE_URL,
      type: "encrypted",
      target: ["production", "preview", "development"]
    },
    {
      key: "SUPABASE_ANON_KEY",
      value: SUPABASE_ANON_KEY,
      type: "encrypted",
      target: ["production", "preview", "development"]
    },
    {
      key: "OPENAI_API_KEY",
      value: OPENAI_API_KEY,
      type: "encrypted",
      target: ["production", "preview", "development"]
    },
    {
      key: "TAVILY_API_KEY",
      value: TAVILY_API_KEY,
      type: "encrypted",
      target: ["production", "preview", "development"]
    },
    {
      key: "NEXT_PUBLIC_APP_NAME",
      value: "ChatCommerce AI",
      type: "encrypted",
      target: ["production", "preview", "development"]
    }
  ];
  
  for (const envVar of envVars) {
    try {
      const res = await fetch(`https://api.vercel.com/v10/projects/${projectId}/env`, {
        method: "POST",
        headers,
        body: JSON.stringify(envVar)
      });
      
      if (res.ok) {
        console.log(`  ✅ ${envVar.key}`);
      } else {
        const error = await res.text();
        if (error.includes('already exists')) {
          console.log(`  ⚠️  ${envVar.key} (já existe)`);
        } else {
          console.log(`  ❌ ${envVar.key}: ${error}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ ${envVar.key}: ${error.message}`);
    }
  }
  
  console.log();
}

async function triggerDeploy(projectId) {
  if (!projectId) return;
  
  console.log("🚀 Triggering deployment...\n");
  
  const headers = {
    "Authorization": `Bearer ${VERCEL_TOKEN}`,
    "Content-Type": "application/json"
  };
  
  try {
    const res = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "chatcommerce-ai",
        project: projectId,
        gitSource: {
          type: "github",
          ref: "main",
          repoId: "ai-builder-hackathon-2025-danilomax"
        }
      })
    });
    
    if (res.ok) {
      const deployment = await res.json();
      console.log(`✅ Deploy iniciado!`);
      console.log(`🔗 URL: ${deployment.url}`);
    } else {
      console.log(`⚠️  Deploy será feito automaticamente pelo GitHub webhook`);
    }
  } catch (error) {
    console.log(`⚠️  Deploy será feito automaticamente: ${error.message}`);
  }
  
  console.log();
}

// Run Vercel setup
const project = await setupVercel();
if (project) {
  await configureEnvVars(project.id || project.name);
  await triggerDeploy(project.id || project.name);
}

// ============================================================================
// FINAL SUMMARY
// ============================================================================

console.log("\n╔════════════════════════════════════════════════════════╗");
console.log("║           📋 RESUMO FINAL DA CONFIGURAÇÃO             ║");
console.log("╚════════════════════════════════════════════════════════╝\n");

console.log("✅ SUPABASE");
console.log("   URL:", SUPABASE_URL);
console.log("   Dashboard: https://supabase.com/dashboard/project/akwnbczoupvwkasylrtf");
console.log("   ⚠️  AÇÃO NECESSÁRIA: Execute o SQL no SQL Editor!\n");

if (project) {
  console.log("✅ VERCEL");
  console.log("   Project:", project.name);
  console.log("   URL: https://" + project.name + ".vercel.app");
  console.log("   Dashboard: https://vercel.com/dashboard\n");
} else {
  console.log("⚠️  VERCEL - Configure manualmente em:");
  console.log("   https://vercel.com/new\n");
}

console.log("📋 ENVIRONMENT VARIABLES (para .env.local local):");
console.log("─────────────────────────────────────────────────────────");
console.log(`SUPABASE_URL=${SUPABASE_URL}`);
console.log(`SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}`);
console.log(`OPENAI_API_KEY=${OPENAI_API_KEY}`);
console.log(`TAVILY_API_KEY=${TAVILY_API_KEY}`);
console.log(`NEXT_PUBLIC_APP_NAME=ChatCommerce AI`);
console.log("─────────────────────────────────────────────────────────\n");

// Save to file
const envContent = `# ChatCommerce AI - Environment Variables
# Generated: ${new Date().toISOString()}

SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
OPENAI_API_KEY=${OPENAI_API_KEY}
TAVILY_API_KEY=${TAVILY_API_KEY}
NEXT_PUBLIC_APP_NAME=ChatCommerce AI
`;

writeFileSync('chatcommerce-ai/.env.local', envContent);
console.log("💾 Credenciais salvas em: chatcommerce-ai/.env.local\n");

console.log("🎉 PRÓXIMOS PASSOS:");
console.log("1. Execute o SQL no Supabase (link acima)");
console.log("2. Aguarde deploy da Vercel (~2-3 min)");
console.log("3. Teste a aplicação!\n");
