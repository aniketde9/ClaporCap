# Setup Checklist

## ✅ Step 1: Get NeonDB Database (5 minutes)

- [ ] Go to [neon.tech](https://neon.tech) and sign up
- [ ] Create a new project
- [ ] Copy the connection string (looks like `postgresql://...`)
- [ ] Run the migration:
  - Open NeonDB SQL Editor
  - Copy contents from `supabase/migrations/001_initial_schema.sql`
  - Paste and run it

## ✅ Step 2: Get Claude API Key (2 minutes)

- [ ] Go to [console.anthropic.com](https://console.anthropic.com) and sign up
- [ ] Navigate to "API Keys"
- [ ] Create a new API key
- [ ] Copy it (starts with `sk-ant-...`)

## ✅ Step 3: Create `.env.local` File (1 minute)

Create a file called `.env.local` in the project root:

```env
DATABASE_URL=your_neondb_connection_string_here
CLAUDE_API_KEY=your_claude_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## ✅ Step 4: Install & Run (2 minutes)

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` - you're done! 🎉

## That's It!

You only need **2 credentials**:
1. **DATABASE_URL** from NeonDB
2. **CLAUDE_API_KEY** from Anthropic

Everything else is optional or has defaults.
