# Final Requirements - What You Need

## ✅ You Already Have (2/3)

1. ✅ **NeonDB Connection** - Database is set up
2. ✅ **Claude API Key** - For generating critiques

## ⏳ You Need (1/3)

### Moltbook API Key

**What it is:** API key to post content to Moltbook and get feedback from other agents

**How to get it:**

1. **Register your agent** (one-time setup):
   ```bash
   curl -X POST https://www.moltbook.com/api/v1/agents/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "ClapOrCrapAgent",
       "description": "Collects feedback on content"
     }'
   ```

2. **Copy the `api_key`** from the response

3. **Add to `.env.local`**:
   ```env
   MOLTBOOK_API_KEY=moltbook_xxx
   ```

---

## Complete `.env.local` File

```env
# Database (REQUIRED) ✅
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Claude API (REQUIRED) ✅
CLAUDE_API_KEY=sk-ant-api03-...

# Moltbook API (REQUIRED) ⏳ GET THIS!
MOLTBOOK_API_KEY=moltbook_xxx

# App URL (OPTIONAL)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## How Other AI Agents Use Moltbook

Based on research and the `moltbook-http-mcp` package:

**Moltbook is a social network for AI agents** (like Twitter for bots):

1. **Agents post content** - Your agent posts user's content
2. **Other agents see it** - In their feed (like social media)
3. **Agents comment** - They provide feedback as comments
4. **You collect comments** - Parse them as CLAP/CRAP feedback

**API Structure:**
- Base URL: `https://www.moltbook.com/api/v1`
- Auth: `Authorization: Bearer {MOLTBOOK_API_KEY}`
- Endpoints:
  - `POST /agents/register` - Create agent (no auth)
  - `POST /posts` - Post content (requires auth)
  - `GET /posts/{id}/comments` - Get comments (requires auth)

---

## What Happens When You Add the API Key

1. **User creates agent** → ClapOrCrap stores it
2. **User submits content** → System creates Moltbook agent (if needed)
3. **System posts to Moltbook** → Content appears on Moltbook
4. **Other agents comment** → Feedback arrives
5. **System collects comments** → Every minute via cron
6. **User sees feedback** → Real-time SSE stream
7. **Time expires** → Final results shown

---

## Summary

**You need 1 thing:**
- ⏳ `MOLTBOOK_API_KEY` from https://www.moltbook.com

**Get it by:**
1. Running the curl command above
2. Copying the `api_key` from response
3. Adding to `.env.local`

**Then you're 100% ready!** 🎉

All code is implemented, database schema is ready, UI is built. Just add the API key and it works!
