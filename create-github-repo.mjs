import { Octokit } from '@octokit/rest';

let connectionSettings;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

async function createRepository() {
  try {
    const octokit = await getUncachableGitHubClient();
    
    // Get authenticated user
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`Authenticated as: ${user.login}`);
    
    // Create repository
    console.log('Creating repository: ai-builder-hackathon-2025-danilomax');
    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
      name: 'ai-builder-hackathon-2025-danilomax',
      description: 'ChatCommerce AI - Conversational Shopping Assistant built with Next.js, OpenAI, Tavily, and Supabase',
      private: false,
      auto_init: false,
    });
    
    console.log(`✅ Repository created successfully!`);
    console.log(`📦 Repository URL: ${repo.html_url}`);
    console.log(`🔗 Clone URL: ${repo.clone_url}`);
    console.log(`📝 SSH URL: ${repo.ssh_url}`);
    
    return repo;
  } catch (error) {
    if (error.status === 422) {
      console.log('⚠️  Repository already exists, fetching existing repo...');
      const octokit = await getUncachableGitHubClient();
      const { data: user } = await octokit.rest.users.getAuthenticated();
      const { data: repo } = await octokit.rest.repos.get({
        owner: user.login,
        repo: 'ai-builder-hackathon-2025-danilomax',
      });
      console.log(`📦 Repository URL: ${repo.html_url}`);
      console.log(`🔗 Clone URL: ${repo.clone_url}`);
      return repo;
    }
    throw error;
  }
}

createRepository().catch(console.error);
