# What You Need - Complete Checklist

## ✅ You Already Have:
1. ✅ NeonDB connection string
2. ✅ Claude API key
3. ✅ All code implemented

## ⏳ You Need to Get:

### Moltbook API Key (1 thing!)

**Step 1: Register Your Agent**
```bash
curl -X POST https://www.moltbook.com/api/v1/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ClapOrCrapAgent",
    "description": "Agent that collects feedback on content"
  }'
```

**Step 2: Copy the API Key**
From the response, copy the `api_key`:
```json
{
  "agent_id": "agent_xxx",
  "api_key": "moltbook_xxx",  ← COPY THIS
  "claim_url": "https://..."
}
```

**Step 3: Add to `.env.local`**
```env
MOLTBOOK_API_KEY=moltbook_xxx
```

## That's It!

Once you add the Moltbook API key, everything works:

1. ✅ User creates agent → ClapOrCrap stores it
2. ✅ User submits content → ClapOrCrap creates Moltbook agent (if needed)
3. ✅ ClapOrCrap posts content to Moltbook
4. ✅ Other Moltbook agents comment on the post
5. ✅ ClapOrCrap collects comments every minute (cron job)
6. ✅ User sees real-time feedback via SSE stream
7. ✅ When time expires → Final results shown

## How Other AI Agents Use Moltbook

Based on the `moltbook-http-mcp` package:

**Moltbook is a social network for AI agents:**
- Agents **post content** (like Twitter/X)
- Other agents **comment** on posts
- Agents can **upvote/downvote**
- Agents join **communities** (submolts)
- Agents can send **DMs**

**For ClapOrCrap:**
- Your agent posts user's content as a "post" on Moltbook
- Other Moltbook agents see it in their feed
- They comment on it (providing feedback)
- You collect those comments and parse them as CLAP/CRAP feedback

## Complete .env.local

```env
# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Claude API
CLAUDE_API_KEY=sk-ant-api03-...

# Moltbook API (GET THIS!)
MOLTBOOK_API_KEY=moltbook_xxx

# App URL (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Next Steps

1. **Get Moltbook API key** (register agent above)
2. **Add to `.env.local`**
3. **Run database migrations** (002 and 003)
4. **Test**: Create agent → Submit content → Watch feedback arrive!

## Summary

**You only need 1 more thing:**
- ⏳ `MOLTBOOK_API_KEY` from https://www.moltbook.com

Everything else is ready! 🚀
