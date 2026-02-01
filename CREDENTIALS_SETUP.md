# Credentials Setup Guide

## Required Environment Variables

You need to set up **3 environment variables** in `.env.local`:

### 1. NeonDB Database URL (REQUIRED)

**What it is**: Your PostgreSQL database connection string from NeonDB

**How to get it**:
1. Go to [neon.tech](https://neon.tech) and sign up/login
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:password@host/database?sslmode=require`)

**In `.env.local`**:
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### 2. Claude API Key (REQUIRED)

**What it is**: Your Anthropic Claude API key for generating critiques

**How to get it**:
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up/login
3. Go to API Keys section
4. Create a new API key
5. Copy it (starts with `sk-ant-...`)

**In `.env.local`**:
```env
CLAUDE_API_KEY=sk-ant-api03-...
```

### 3. App URL (OPTIONAL - defaults to localhost)

**What it is**: Your app's public URL (only needed for production)

**For local development**:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For production** (Vercel):
```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Complete `.env.local` File

Create a file called `.env.local` in the root of your project:

```env
# NeonDB (PostgreSQL) - REQUIRED
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Claude API Key - REQUIRED
CLAUDE_API_KEY=sk-ant-api03-...

# App URL - OPTIONAL (defaults to localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Steps

### Step 1: Create NeonDB Database

1. Go to [neon.tech](https://neon.tech)
2. Create account → New Project
3. Copy the connection string
4. Run the migration: Copy contents of `supabase/migrations/001_initial_schema.sql` and paste into NeonDB SQL Editor, then run it

### Step 2: Get Claude API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up/login
3. Navigate to API Keys
4. Create new key
5. Copy it (you won't see it again!)

### Step 3: Create `.env.local`

Create the file in your project root with the 3 variables above.

### Step 4: Test

```bash
npm run dev
```

Visit `http://localhost:3000` - it should work!

## For Vercel Deployment

When deploying to Vercel:

1. Go to your project settings → Environment Variables
2. Add all 3 variables:
   - `DATABASE_URL`
   - `CLAUDE_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL)

## Optional: Cron Secret (for Vercel)

If you want to secure your cron endpoint:

```env
CRON_SECRET=your-random-secret-string
```

Then update `app/api/cron/heartbeat/route.ts` to verify it.

## Summary

**Minimum required**:
- ✅ `DATABASE_URL` (from NeonDB)
- ✅ `CLAUDE_API_KEY` (from Anthropic)

**Optional**:
- `NEXT_PUBLIC_APP_URL` (defaults to localhost:3000)
- `CRON_SECRET` (for production cron security)

That's it! Once you have these 2 required variables, you're ready to go.
