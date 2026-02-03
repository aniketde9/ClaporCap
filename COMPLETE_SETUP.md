# Complete Setup Guide - What You Need

## Summary: You Need 3 Things

1. ✅ **NeonDB** - You have this
2. ✅ **Claude API Key** - You have this  
3. ⏳ **Moltbook API Key** - Get this now!

---

## Step-by-Step Setup

### 1. Get Moltbook API Key

**Register your agent:**
```bash
curl -X POST https://www.moltbook.com/api/v1/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ClapOrCrapAgent",
    "description": "Collects feedback on content from Moltbook agents"
  }'
```

**Response:**
```json
{
  "agent_id": "agent_xxx",
  "api_key": "moltbook_xxx",  ← COPY THIS
  "claim_url": "https://www.moltbook.com/claim/xxx"
}
```

**Add to `.env.local`:**
```env
MOLTBOOK_API_KEY=moltbook_xxx
```

### 2. Run Database Migrations

In NeonDB SQL Editor, run:
1. `supabase/migrations/002_feedback_system.sql`
2. `supabase/migrations/003_add_moltbook_agent_id.sql`

### 3. Complete `.env.local` File

```env
# Database (REQUIRED)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Claude API (REQUIRED)
CLAUDE_API_KEY=sk-ant-api03-...

# Moltbook API (REQUIRED - GET THIS!)
MOLTBOOK_API_KEY=moltbook_xxx

# App URL (OPTIONAL)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Test It!

```bash
npm run dev
```

1. Visit `http://localhost:3000`
2. Create an agent at `/create-agent`
3. Submit content with duration
4. Watch feedback arrive in real-time!

---

## How Moltbook Works

**Moltbook = Social Network for AI Agents**

- Your agent **posts content** to Moltbook
- Other Moltbook agents see it in their feed
- They **comment** on your post (providing feedback)
- You **collect those comments** and parse them as CLAP/CRAP feedback
- User sees **real-time feedback** via SSE stream

**API Endpoints Used:**
- `POST /api/v1/agents/register` - Create agent (no auth)
- `POST /api/v1/posts` - Post content (requires API key)
- `GET /api/v1/posts/{id}/comments` - Get comments (requires API key)

---

## What's Already Done

✅ Database schema for feedback system
✅ API endpoints for feedback collection
✅ Real-time SSE streaming
✅ Pricing calculator
✅ Duration selector
✅ Background polling service
✅ Moltbook integration library (with actual API endpoints)

**You just need the API key!**

---

## Troubleshooting

**"MOLTBOOK_API_KEY not configured"**
→ Add the API key from registration to `.env.local`

**"Failed to create Moltbook agent"**
→ Check internet connection, verify API endpoint is correct

**"No feedback arriving"**
→ Check if cron job is running, verify API key is valid

---

## Next Steps After Setup

1. ✅ Get Moltbook API key
2. ✅ Add to `.env.local`
3. ✅ Run migrations
4. ✅ Test the flow
5. ✅ Deploy to Vercel!

You're 99% done - just need that API key! 🚀
