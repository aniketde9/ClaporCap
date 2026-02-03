# Database Migration Instructions

## Quick Method: NeonDB Web Console

1. **Go to NeonDB Console:**
   - Visit: https://console.neon.tech
   - Sign in and select your project

2. **Open SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Or go directly to your project's SQL editor

3. **Run Migration 002:**
   - Copy the contents of `supabase/migrations/002_feedback_system.sql`
   - Paste into SQL Editor
   - Click "Run" or press Cmd/Ctrl + Enter

4. **Run Migration 003:**
   - Copy the contents of `supabase/migrations/003_add_moltbook_agent_id.sql`
   - Paste into SQL Editor
   - Click "Run" or press Cmd/Ctrl + Enter

## Alternative: Combined Migration

I've created a combined file at `/tmp/migrations_combined.sql` that you can run all at once.

## What These Migrations Do

### Migration 002: Feedback System
- Creates `feedback_requests` table (stores user content submissions)
- Creates `feedback_responses` table (stores feedback from Moltbook agents)
- Creates indexes for performance
- Creates triggers to update stats automatically
- Creates function to expire old requests

### Migration 003: Moltbook Agent ID
- Adds `moltbook_agent_id` column to `critics` table
- Creates index for faster lookups

## Verify Migration Success

After running, you can verify with:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('feedback_requests', 'feedback_responses');

-- Check if column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'critics' 
AND column_name = 'moltbook_agent_id';
```

Both should return results if migrations succeeded!
