#!/bin/bash
set -e

echo "🔄 Pushing CI/CD workflows to GitHub..."

cd chatcommerce-ai

# Configure git
git config user.name "DevDaniloMax"
git config user.email "devdanilomax@users.noreply.github.com"

# Add workflows
git add .github/
git add .gitignore

# Commit
git commit -m "ci: Add GitHub Actions CI/CD workflows

- Add CI workflow: build verification, type checking, linting
- Add deploy workflow: automatic deployment to Vercel on main
- Add preview workflow: preview deployments for PRs
- Add CODEOWNERS for code review automation
- Configure security scanning

Workflows:
- ci.yml: Run on all pushes and PRs
- deploy.yml: Deploy to production on main branch
- preview.yml: Create preview deployments for PRs" || echo "⚠️  No changes to commit"

# Get GitHub token from Replit secrets
# We'll use the Octokit approach for authenticated push
cd ..
node git-push-to-github.mjs

echo "✅ CI/CD workflows pushed to GitHub!"
