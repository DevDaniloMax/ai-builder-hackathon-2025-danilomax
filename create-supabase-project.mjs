import { readFileSync } from 'fs';

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const API_URL = "https://api.supabase.com/v1";

const headers = {
  "Authorization": `Bearer ${SUPABASE_ACCESS_TOKEN}`,
  "Content-Type": "application/json"
};

async function getOrganizations() {
  console.log("🔍 Buscando organizações do Supabase...");
  const response = await fetch(`${API_URL}/organizations`, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to get organizations: ${response.status} ${await response.text()}`);
  }
  
  const orgs = await response.json();
  console.log(`✅ Encontradas ${orgs.length} organização(ões)`);
  return orgs;
}

async function createProject(orgId) {
  console.log("\n🏗️  Criando projeto Supabase...");
  
  const projectName = "chatcommerce-ai";
  const dbPassword = `ChatComm${Math.random().toString(36).slice(2, 10)}!${Date.now().toString(36)}`;
  
  const payload = {
    organization_id: orgId,
    name: projectName,
    region: "us-east-1",
    plan: "free",
    db_pass: dbPassword
  };
  
  console.log(`📦 Nome do projeto: ${projectName}`);
  console.log(`🌍 Região: us-east-1`);
  console.log(`💾 Plano: free`);
  
  const response = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create project: ${response.status} ${errorText}`);
  }
  
  const project = await response.json();
  console.log(`✅ Projeto criado com sucesso!`);
  console.log(`📝 Project ID: ${project.id}`);
  console.log(`🔗 Database URL: ${project.database?.host || 'Inicializando...'}`);
  console.log(`🔑 Database Password: ${dbPassword}`);
  
  return { project, dbPassword };
}

async function waitForProject(projectId) {
  console.log("\n⏳ Aguardando projeto ficar ativo (pode levar 1-2 minutos)...");
  
  let attempts = 0;
  const maxAttempts = 60; // 5 minutos
  
  while (attempts < maxAttempts) {
    const response = await fetch(`${API_URL}/projects/${projectId}`, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to check project status: ${response.status}`);
    }
    
    const project = await response.json();
    
    if (project.status === "ACTIVE_HEALTHY") {
      console.log("✅ Projeto está ativo e saudável!");
      return project;
    }
    
    process.stdout.write(`\r⏳ Status: ${project.status} (${attempts + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    attempts++;
  }
  
  throw new Error("Timeout waiting for project to become active");
}

async function executeSQLSchema(project, dbPassword) {
  console.log("\n📊 Executando schema SQL...");
  
  const sqlContent = readFileSync('./chatcommerce-ai/supabase.sql', 'utf8');
  
  // Construct database URL
  const dbHost = project.database?.host || `db.${project.id}.supabase.co`;
  const connectionString = `postgresql://postgres.${project.id}:${dbPassword}@${dbHost}:5432/postgres`;
  
  console.log(`🔗 Conectando ao database: ${dbHost}`);
  
  // For now, we'll output the SQL and connection details
  // Direct SQL execution would require pg library or REST API
  console.log("\n⚠️  Execute o SQL manualmente:");
  console.log("1. Acesse: https://supabase.com/dashboard/project/" + project.id + "/editor");
  console.log("2. Cole o conteúdo do arquivo supabase.sql");
  console.log("3. Execute o script\n");
  
  return connectionString;
}

async function main() {
  try {
    console.log("🚀 Criando projeto ChatCommerce AI no Supabase\n");
    
    // Get organizations
    const orgs = await getOrganizations();
    
    if (orgs.length === 0) {
      throw new Error("No organizations found. Please create one at https://supabase.com/dashboard");
    }
    
    const orgId = orgs[0].id;
    console.log(`📂 Usando organização: ${orgs[0].name || orgId}`);
    
    // Create project
    const { project, dbPassword } = await createProject(orgId);
    
    // Wait for project to be ready
    const activeProject = await waitForProject(project.id);
    
    // Get connection string
    const connectionString = await executeSQLSchema(activeProject, dbPassword);
    
    console.log("\n🎉 PROJETO SUPABASE CRIADO COM SUCESSO!\n");
    console.log("═══════════════════════════════════════════════════════");
    console.log("📋 INFORMAÇÕES DO PROJETO:");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`Project ID: ${activeProject.id}`);
    console.log(`Project URL: https://supabase.com/dashboard/project/${activeProject.id}`);
    console.log(`Database Host: ${activeProject.database?.host || `db.${activeProject.id}.supabase.co`}`);
    console.log(`Database Password: ${dbPassword}`);
    console.log("\n📋 ANON KEY:");
    console.log(activeProject.anon_key || "Será gerado em alguns minutos");
    console.log("\n📋 SERVICE ROLE KEY:");
    console.log(activeProject.service_role_key || "Será gerado em alguns minutos");
    console.log("\n🔗 CONNECTION STRING:");
    console.log(connectionString);
    console.log("═══════════════════════════════════════════════════════");
    
    // Save to file
    const envContent = `
# Supabase Configuration (Generated ${new Date().toISOString()})
SUPABASE_URL=https://${activeProject.id}.supabase.co
SUPABASE_ANON_KEY=${activeProject.anon_key || 'PENDING_GENERATION'}
SUPABASE_SERVICE_ROLE_KEY=${activeProject.service_role_key || 'PENDING_GENERATION'}
DATABASE_URL=${connectionString}
DATABASE_PASSWORD=${dbPassword}
`;
    
    await import('fs/promises').then(fs => 
      fs.writeFile('supabase-credentials.env', envContent)
    );
    
    console.log("\n💾 Credenciais salvas em: supabase-credentials.env");
    console.log("\n⚠️  PRÓXIMOS PASSOS:");
    console.log("1. Execute o SQL schema no Supabase Dashboard");
    console.log("2. Copie as credenciais para .env.local do projeto");
    console.log("3. Aguarde alguns minutos para as keys serem geradas");
    
  } catch (error) {
    console.error("\n❌ Erro:", error.message);
    if (error.response) {
      console.error("Response:", await error.response.text());
    }
    process.exit(1);
  }
}

main();
