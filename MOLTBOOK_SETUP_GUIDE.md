# Complete Moltbook Setup Guide

## What You Need - Complete Checklist

Based on research and the npm packages found, here's everything you need:

### 1. Environment Variables (.env.local)

```env
# Database (REQUIRED)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Claude API (REQUIRED - for generating critiques)
CLAUDE_API_KEY=sk-ant-api03-...

# Moltbook API (REQUIRED - once you have credentials)
MOLTBOOK_API_URL=https://api.moltbook.com  # or actual Moltbook API URL
MOLTBOOK_API_KEY=your_moltbook_api_key

# App URL (OPTIONAL)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Install Moltbook Packages

Based on npm search, there are Moltbook MCP packages available:

```bash
# Option 1: MCP Server for Moltbook (HTTP-based)
npm install moltbook-http-mcp

# Option 2: Moltcraft MCP Server (with engagement tracking)
npm install @moltcraft/moltbook-mcp
```

**What these packages provide:**
- `moltbook-http-mcp`: Post, comment, upvote, DMs, communities (API key auth)
- `@moltcraft/moltbook-mcp`: Engagement state tracking, content security, thread diffing

### 3. How Moltbook Works (Based on Package Info)

Moltbook appears to be a **social platform for AI agents** where:
- Agents can **post content**
- Other agents can **comment/respond**
- Agents can **upvote** content
- Agents can send **DMs** (direct messages)
- Agents join **communities**

### 4. Your Integration Strategy

Since Moltbook uses **MCP (Model Context Protocol)** and HTTP APIs, here's how to integrate:

#### A. Install MCP Package

```bash
npm install moltbook-http-mcp
```

#### B. Update lib/moltbook.ts

The package likely provides:
- Methods to authenticate with API key
- Methods to post content
- Methods to get responses/comments
- Methods to interact with communities

#### C. Typical Moltbook Flow

1. **Authenticate**: Use API key to get access token
2. **Post Content**: Post your user's content to Moltbook
3. **Get Responses**: Poll for comments/responses from other agents
4. **Parse Feedback**: Convert Moltbook responses to ClapOrCrap format

### 5. What You Need to Find Out

Since Moltbook documentation isn't publicly available, you need to:

1. **Get Moltbook API credentials**:
   - Sign up at Moltbook (if they have a website)
   - Get API key
   - Find API base URL

2. **Understand Moltbook API structure**:
   - How to create agent accounts
   - How to post content
   - How to retrieve responses/comments
   - Authentication method

3. **Test the MCP packages**:
   - Install `moltbook-http-mcp`
   - Check what methods it provides
   - Update `lib/moltbook.ts` accordingly

### 6. Alternative: Direct API Integration

If Moltbook has a REST API, you can integrate directly:

```typescript
// Example structure (update with actual endpoints)
const MOLTBOOK_API = 'https://api.moltbook.com';

// Authenticate
POST /auth/login
Body: { api_key: "..." }
Response: { token: "..." }

// Create agent
POST /agents
Headers: { Authorization: "Bearer TOKEN" }
Body: { name: "...", type: "critic" }

// Post content
POST /posts
Headers: { Authorization: "Bearer TOKEN" }
Body: { content: "...", agent_id: "..." }

// Get responses
GET /posts/{post_id}/comments
Headers: { Authorization: "Bearer TOKEN" }
```

### 7. Next Steps

1. **Try installing the MCP package**:
   ```bash
   npm install moltbook-http-mcp
   ```

2. **Check what it provides**:
   ```bash
   # Look at node_modules/moltbook-http-mcp/package.json
   # Check for README or examples
   ```

3. **Update lib/moltbook.ts** with actual methods from the package

4. **Get Moltbook API credentials** (if needed separately from the package)

### 8. Current Implementation Status

✅ **What's Ready:**
- Database schema for feedback requests/responses
- API endpoints for feedback collection
- UI for submitting content and viewing feedback
- Pricing calculation
- Real-time SSE streaming
- Background polling service

⏳ **What Needs Moltbook Info:**
- Actual API endpoints in `lib/moltbook.ts`
- Authentication method
- How to post content
- How to retrieve responses

### 9. Quick Test

Once you have Moltbook credentials:

1. Install package: `npm install moltbook-http-mcp`
2. Check package docs: `cat node_modules/moltbook-http-mcp/README.md`
3. Update `lib/moltbook.ts` with actual methods
4. Test with a simple post

## Summary

**You need:**
1. ✅ NeonDB connection string (you have this)
2. ✅ Claude API key (you have this)
3. ⏳ Moltbook API key (need to get)
4. ⏳ Moltbook API URL (need to find)
5. ⏳ Install `moltbook-http-mcp` package
6. ⏳ Update `lib/moltbook.ts` with actual API calls

**The system is 90% ready** - just needs the actual Moltbook API integration details!
