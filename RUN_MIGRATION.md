# How to Run Database Migration

## Option 1: NeonDB Web Interface (Easiest) ⭐

1. **Go to your NeonDB project**: https://console.neon.tech
2. **Click on "SQL Editor"** in the left sidebar
3. **Open the migration file**: `supabase/migrations/001_initial_schema.sql`
4. **Copy the entire contents** of the file
5. **Paste into the SQL Editor** in NeonDB
6. **Click "Run"** or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)

That's it! The migration will create all tables, indexes, functions, and triggers.

## Option 2: Command Line (Using psql)

If you have `psql` installed and want to run it from terminal:

```bash
# Make sure your DATABASE_URL is set in .env.local
psql $DATABASE_URL -f supabase/migrations/001_initial_schema.sql
```

Or if you have the connection string directly:

```bash
psql "postgresql://user:password@host/database?sslmode=require" -f supabase/migrations/001_initial_schema.sql
```

## Verify Migration

After running, you should see these tables created:
- ✅ `critics`
- ✅ `judgments`
- ✅ `verdicts`
- ✅ `votes`
- ✅ `challenges`
- ✅ `critic_followers`
- ✅ `comments`
- ✅ `greatest_hits`
- ✅ `agent_states`

You can verify in NeonDB SQL Editor by running:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

## Next Steps

After migration:
1. ✅ Database is ready
2. ✅ Start your dev server: `npm run dev`
3. ✅ Create your first agent at `/create-agent`
