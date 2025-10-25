import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';

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
    throw new Error('X_REPLIT_TOKEN not found');
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

async function pushToGitHub() {
  try {
    const accessToken = await getAccessToken();
    const octokit = await getUncachableGitHubClient();
    const { data: user } = await octokit.rest.users.getAuthenticated();
    
    console.log(`🚀 Pushing to GitHub as ${user.login}...`);
    
    // Configure git credentials
    execSync('cd chatcommerce-ai && git config credential.helper store', { encoding: 'utf8' });
    
    // Create authenticated URL
    const repoUrl = `https://${accessToken}@github.com/${user.login}/ai-builder-hackathon-2025-danilomax.git`;
    
    console.log('📤 Pushing to remote...');
    try {
      const output = execSync(`cd chatcommerce-ai && git push -u "${repoUrl}" main --force`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log(output);
    } catch (error) {
      console.log(error.stdout || error.message);
    }
    
    console.log('\n✅ Successfully pushed to GitHub!');
    console.log(`📦 Repository: https://github.com/${user.login}/ai-builder-hackathon-2025-danilomax`);
    console.log(`🌐 View online: https://github.com/${user.login}/ai-builder-hackathon-2025-danilomax/tree/main`);
    
    // Clean up credentials
    execSync('cd chatcommerce-ai && git config --unset credential.helper', { encoding: 'utf8' });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

pushToGitHub().catch(console.error);
