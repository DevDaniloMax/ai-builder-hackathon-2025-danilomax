# ChatCommerce AI - Troubleshooting Guide

**Version**: 1.0
**Last Updated**: October 2025

---

## Table of Contents

1. [Setup Issues](#setup-issues)
2. [Environment Variables](#environment-variables)
3. [API Integration Errors](#api-integration-errors)
4. [Database Issues](#database-issues)
5. [Build and Deploy Errors](#build-and-deploy-errors)
6. [Runtime Errors](#runtime-errors)
7. [Performance Problems](#performance-problems)
8. [UI/UX Issues](#uiux-issues)
9. [Common Error Messages](#common-error-messages)
10. [Debug Tools and Techniques](#debug-tools-and-techniques)

---

## Setup Issues

### Problem: Node.js version incompatibility

**Symptoms**:

```
Error: The engine "node" is incompatible with this module
```

**Cause**: Project requires Node.js >= 18, but older version installed

**Solution**:

```bash
# Check current version
node --version

# Install Node.js 18+ using nvm
nvm install 18
nvm use 18

# Verify
node --version  # Should show v18.x.x or higher
```

---

### Problem: npm install fails with ERESOLVE errors

**Symptoms**:

```
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Cause**: Conflicting package versions

**Solution**:

```bash
# Option 1: Use legacy peer deps
npm install --legacy-peer-deps

# Option 2: Force install
npm install --force

# Option 3: Clean install
rm -rf node_modules package-lock.json
npm install
```

---

### Problem: Port 3000 already in use

**Symptoms**:

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Cause**: Another process using port 3000

**Solution**:

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
lsof -ti:3000 | xargs kill

# Or use different port
PORT=3001 npm run dev
```

---

### Problem: TypeScript compilation errors on fresh install

**Symptoms**:

```
Type error: Cannot find module '@/types/product'
```

**Cause**: Missing files or incorrect tsconfig

**Solution**:

```bash
# Verify tsconfig.json exists
cat tsconfig.json

# Ensure paths configured
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}

# Restart TypeScript server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---
