import { Octokit } from '@octokit/rest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

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

function getAllFiles(dirPath, arrayOfFiles = [], basePath = '') {
  const files = readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = join(dirPath, file);
    const relativePath = basePath ? join(basePath, file) : file;
    
    // Skip node_modules, .git, .next, etc.
    if (file === 'node_modules' || file === '.git' || file === '.next' || file === '.env.local') {
      return;
    }
    
    if (statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles, relativePath);
    } else {
      arrayOfFiles.push({ path: relativePath, fullPath });
    }
  });
  
  return arrayOfFiles;
}

async function uploadFiles() {
  try {
    const octokit = await getUncachableGitHubClient();
    const { data: user } = await octokit.rest.users.getAuthenticated();
    const owner = user.login;
    const repo = 'ai-builder-hackathon-2025-danilomax';
    
    console.log(`📤 Uploading files to ${owner}/${repo}...`);
    
    // Get all files
    const files = getAllFiles('./chatcommerce-ai');
    console.log(`📁 Found ${files.length} files to upload`);
    
    // Create blobs for all files
    const blobs = [];
    for (const file of files) {
      try {
        const content = readFileSync(file.fullPath);
        const { data: blob } = await octokit.rest.git.createBlob({
          owner,
          repo,
          content: content.toString('base64'),
          encoding: 'base64',
        });
        blobs.push({ path: file.path, sha: blob.sha, mode: '100644', type: 'blob' });
        console.log(`  ✓ ${file.path}`);
      } catch (error) {
        console.error(`  ✗ Error uploading ${file.path}:`, error.message);
      }
    }
    
    console.log(`\n🌳 Creating tree with ${blobs.length} files...`);
    const { data: tree } = await octokit.rest.git.createTree({
      owner,
      repo,
      tree: blobs,
    });
    
    console.log('💾 Creating commit...');
    const { data: commit } = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: `feat: ChatCommerce AI - Complete implementation

- Next.js 15 with App Router
- AI SDK with streaming responses  
- 3 AI tools: searchWeb, fetchPage, extractProducts
- OpenAI GPT-4o-mini for product extraction
- Tavily API for web search
- Jina Reader for content fetching
- Supabase PostgreSQL database
- Rate limiting and timeout protection
- Smart caching system
- Full TypeScript implementation
- Responsive chat UI with Tailwind CSS

Built for AI Builder Hackathon 2025`,
      tree: tree.sha,
    });
    
    console.log('🔄 Updating main branch...');
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: 'heads/main',
      sha: commit.sha,
      force: true,
    });
    
    console.log(`\n✅ Successfully pushed to GitHub!`);
    console.log(`📦 Repository: https://github.com/${owner}/${repo}`);
    console.log(`📝 Commit: ${commit.sha.substring(0, 7)}`);
    console.log(`🌐 View online: https://github.com/${owner}/${repo}/tree/main`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

uploadFiles().catch(console.error);
