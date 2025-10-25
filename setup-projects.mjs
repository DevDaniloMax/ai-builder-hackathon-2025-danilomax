import { readFileSync, writeFileSync } from 'fs';

const SUPABASE_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

// ============================================================================
// SUPABASE SETUP
// ============================================================================

async function setupSupabase() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║         🗄️  CONFIGURAÇÃO SUPABASE                      ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");
  
  try {
    const headers = {
      "Authorization": `Bearer ${SUPABASE_TOKEN}`,
      "Content-Type": "application/json"
    };
    
    // Get organizations
    console.log("🔍 Buscando organizações...");
    const orgsRes = await fetch("https://api.supabase.com/v1/organizations", { headers });
    
    if (!orgsRes.ok) {
      const error = await orgsRes.text();
      console.error(`❌ Erro ao buscar organizações: ${orgsRes.status}`);
      console.error(`Detalhes: ${error}`);
      console.log("\n⚠️  INSTRUÇÕES MANUAIS PARA SUPABASE:");
      console.log("1. Acesse: https://supabase.com/dashboard");
      console.log("2. Clique em 'New Project'");
      console.log("3. Nome: chatcommerce-ai");
      console.log("4. Database Password: (crie uma senha segura)");
      console.log("5. Região: US East (N. Virginia)");
      console.log("6. Após criar, execute o SQL do arquivo supabase.sql no SQL Editor");
      return null;
    }
    
    const orgs = await orgsRes.json();
    console.log(`✅ Encontradas ${orgs.length} organização(ões)`);
    
    if (orgs.length === 0) {
      console.log("❌ Nenhuma organização encontrada");
      console.log("Por favor, crie uma em: https://supabase.com/dashboard");
      return null;
    }
    
    const orgId = orgs[0].id;
    console.log(`📂 Usando: ${orgs[0].name || orgId}`);
    
    // Create project
    console.log("\n🏗️  Criando projeto...");
    const dbPassword = `ChatComm${Math.random().toString(36).slice(2, 10)}!${Date.now().toString(36)}`;
    
    const projectRes = await fetch("https://api.supabase.com/v1/projects", {
      method: "POST",
      headers,
      body: JSON.stringify({
        organization_id: orgId,
        name: "chatcommerce-ai",
        region: "us-east-1",
        plan: "free",
        db_pass: dbPassword
      })
    });
    
    if (!projectRes.ok) {
      const error = await projectRes.text();
      console.error(`❌ Erro ao criar projeto: ${projectRes.status}`);
      console.error(`Detalhes: ${error}`);
      
      // Check if project already exists
      console.log("\n🔍 Verificando projetos existentes...");
      const listRes = await fetch("https://api.supabase.com/v1/projects", { headers });
      if (listRes.ok) {
        const projects = await listRes.json();
        const existing = projects.find(p => p.name === "chatcommerce-ai");
        if (existing) {
          console.log("✅ Projeto 'chatcommerce-ai' já existe!");
          return existing;
        }
      }
      return null;
    }
    
    const project = await projectRes.json();
    console.log(`✅ Projeto criado: ${project.id}`);
    
    // Wait for project to be ready
    console.log("\n⏳ Aguardando projeto ficar ativo...");
    let attempts = 0;
    let activeProject = project;
    
    while (attempts < 30 && activeProject.status !== "ACTIVE_HEALTHY") {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const statusRes = await fetch(`https://api.supabase.com/v1/projects/${project.id}`, { headers });
      if (statusRes.ok) {
        activeProject = await statusRes.json();
        process.stdout.write(`\r⏳ Status: ${activeProject.status} (${attempts + 1}/30)`);
      }
      attempts++;
    }
    
    console.log("\n✅ Projeto ativo!");
    
    // Save credentials
    const credentials = {
      projectId: activeProject.id,
      projectUrl: `https://${activeProject.id}.supabase.co`,
      anonKey: activeProject.anon_key || "PENDING",
      serviceRoleKey: activeProject.service_role_key || "PENDING",
      dbPassword: dbPassword,
      dbHost: activeProject.database?.host || `db.${activeProject.id}.supabase.co`
    };
    
    writeFileSync('supabase-credentials.json', JSON.stringify(credentials, null, 2));
    console.log("💾 Credenciais salvas em: supabase-credentials.json");
    
    return credentials;
    
  } catch (error) {
    console.error("❌ Erro:", error.message);
    return null;
  }
}

// ============================================================================
// VERCEL SETUP
// ============================================================================

async function setupVercel(supabaseCredentials) {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║           🚀 CONFIGURAÇÃO VERCEL                       ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");
  
  try {
    const headers = {
      "Authorization": `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json"
    };
    
    // Get user info
    console.log("🔍 Obtendo informações do usuário...");
    const userRes = await fetch("https://api.vercel.com/v2/user", { headers });
    
    if (!userRes.ok) {
      const error = await userRes.text();
      console.error(`❌ Erro: ${userRes.status}`);
      console.error(`Detalhes: ${error}`);
      console.log("\n⚠️  INSTRUÇÕES MANUAIS PARA VERCEL:");
      console.log("1. Acesse: https://vercel.com/new");
      console.log("2. Importe o repositório: DevDaniloMax/ai-builder-hackathon-2025-danilomax");
      console.log("3. Configure as Environment Variables (veja abaixo)");
      return null;
    }
    
    const user = await userRes.json();
    console.log(`✅ Usuário: ${user.username || user.email}`);
    
    // Create project
    console.log("\n🏗️  Criando projeto Vercel...");
    
    const projectPayload = {
      name: "chatcommerce-ai",
      framework: "nextjs",
      gitRepository: {
        repo: "DevDaniloMax/ai-builder-hackathon-2025-danilomax",
        type: "github"
      },
      environmentVariables: []
    };
    
    // Add Supabase env vars if available
    if (supabaseCredentials) {
      projectPayload.environmentVariables = [
        { key: "SUPABASE_URL", value: supabaseCredentials.projectUrl, target: ["production", "preview", "development"] },
        { key: "SUPABASE_ANON_KEY", value: supabaseCredentials.anonKey, target: ["production", "preview", "development"] },
        { key: "NEXT_PUBLIC_APP_NAME", value: "ChatCommerce AI", target: ["production", "preview", "development"] }
      ];
    }
    
    const projectRes = await fetch("https://api.vercel.com/v9/projects", {
      method: "POST",
      headers,
      body: JSON.stringify(projectPayload)
    });
    
    if (!projectRes.ok) {
      const error = await projectRes.text();
      console.error(`❌ Erro ao criar projeto: ${projectRes.status}`);
      console.error(`Detalhes: ${error}`);
      
      // Check if project exists
      console.log("\n🔍 Verificando projetos existentes...");
      const listRes = await fetch("https://api.vercel.com/v9/projects", { headers });
      if (listRes.ok) {
        const data = await listRes.json();
        const existing = data.projects?.find(p => p.name === "chatcommerce-ai");
        if (existing) {
          console.log("✅ Projeto 'chatcommerce-ai' já existe!");
          return existing;
        }
      }
      return null;
    }
    
    const project = await projectRes.json();
    console.log(`✅ Projeto criado: ${project.name}`);
    console.log(`🔗 URL: https://${project.name}.vercel.app`);
    
    // Save project info
    writeFileSync('vercel-project.json', JSON.stringify(project, null, 2));
    console.log("💾 Info salva em: vercel-project.json");
    
    return project;
    
  } catch (error) {
    console.error("❌ Erro:", error.message);
    return null;
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║     🚀 SETUP AUTOMÁTICO - CHATCOMMERCE AI             ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  
  // Setup Supabase
  const supabaseCredentials = await setupSupabase();
  
  // Setup Vercel
  const vercelProject = await setupVercel(supabaseCredentials);
  
  // Summary
  console.log("\n\n╔════════════════════════════════════════════════════════╗");
  console.log("║               📋 RESUMO DA CONFIGURAÇÃO                ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");
  
  if (supabaseCredentials) {
    console.log("✅ SUPABASE CONFIGURADO");
    console.log(`   Project ID: ${supabaseCredentials.projectId}`);
    console.log(`   URL: ${supabaseCredentials.projectUrl}`);
    console.log(`   Dashboard: https://supabase.com/dashboard/project/${supabaseCredentials.projectId}`);
    console.log("\n   ⚠️  PRÓXIMO PASSO:");
    console.log("   Execute o SQL no Supabase SQL Editor:");
    console.log(`   https://supabase.com/dashboard/project/${supabaseCredentials.projectId}/sql/new`);
    console.log("   (Cole o conteúdo de chatcommerce-ai/supabase.sql)\n");
  } else {
    console.log("⚠️  SUPABASE - Configuração manual necessária");
    console.log("   https://supabase.com/dashboard\n");
  }
  
  if (vercelProject) {
    console.log("✅ VERCEL CONFIGURADO");
    console.log(`   Project: ${vercelProject.name}`);
    console.log(`   URL: https://${vercelProject.name}.vercel.app`);
    console.log(`   Dashboard: https://vercel.com/dashboard\n`);
  } else {
    console.log("⚠️  VERCEL - Configuração manual necessária");
    console.log("   https://vercel.com/new\n");
  }
  
  // Environment variables needed
  console.log("📋 ENVIRONMENT VARIABLES NECESSÁRIAS:\n");
  console.log("Para desenvolvimento local (.env.local):");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  if (supabaseCredentials) {
    console.log(`SUPABASE_URL=${supabaseCredentials.projectUrl}`);
    console.log(`SUPABASE_ANON_KEY=${supabaseCredentials.anonKey}`);
  } else {
    console.log("SUPABASE_URL=https://YOUR_PROJECT.supabase.co");
    console.log("SUPABASE_ANON_KEY=YOUR_ANON_KEY");
  }
  console.log("OPENAI_API_KEY=sk-proj-YOUR_KEY");
  console.log("TAVILY_API_KEY=tvly-YOUR_KEY");
  console.log("NEXT_PUBLIC_APP_NAME=ChatCommerce AI");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  console.log("🎉 Setup concluído! Verifique os arquivos gerados:");
  console.log("   - supabase-credentials.json");
  console.log("   - vercel-project.json\n");
}

main().catch(console.error);
