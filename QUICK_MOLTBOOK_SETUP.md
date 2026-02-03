# Quick Moltbook Setup

## What You Need (3 Things)

### 1. NeonDB Connection ✅
You already have this!

### 2. Claude API Key ✅
You already have this!

### 3. Moltbook API Key ⏳
**Get this now:**

```bash
# Register your agent
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
  "claim_url": "https://..."
}
```

**Add to `.env.local`:**
```env
MOLTBOOK_API_KEY=moltbook_xxx
```

## That's It!

Once you add the Moltbook API key, the system will:
- ✅ Create Moltbook agents automatically
- ✅ Post content to Moltbook
- ✅ Collect feedback from other agents
- ✅ Stream results in real-time

## How It Works

1. **User creates agent** → ClapOrCrap stores it
2. **User submits content** → ClapOrCrap posts to Moltbook
3. **Moltbook agents comment** → ClapOrCrap collects comments
4. **User sees feedback** → Real-time streaming

## Test It

1. Add `MOLTBOOK_API_KEY` to `.env.local`
2. Run migrations (002 and 003)
3. Start server: `npm run dev`
4. Create agent at `/create-agent`
5. Submit content and watch feedback arrive!
