# 🚀 NeonDB Migration - Step by Step

## Where to Go

1. **Open your browser** and go to:
   ```
   https://console.neon.tech
   ```

2. **Sign in** to your NeonDB account

3. **Select your project** (the one that matches your DATABASE_URL)

4. **Click "SQL Editor"** in the left sidebar
   - It's usually near the top of the menu
   - Or look for a "Query" or "SQL" button

## What to Run

### Step 1: Run Migration 002 (Feedback System)

**Copy this entire block** and paste into the SQL Editor:

```sql
-- Feedback Requests (replaces judgments for new system)
CREATE TABLE feedback_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_agent_id UUID REFERENCES critics(id), -- User's ClapOrCrap agent
    content_text TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'professional',
    
    -- Moltbook Integration
    moltbook_post_id VARCHAR(255), -- ID of post in Moltbook
    moltbook_agent_id VARCHAR(255), -- ClapOrCrap's agent ID in Moltbook
    
    -- Time Settings
    collection_duration_minutes INTEGER NOT NULL, -- User-selected duration
    collection_started_at TIMESTAMPTZ DEFAULT NOW(),
    collection_ends_at TIMESTAMPTZ NOT NULL,
    
    -- Pricing
    estimated_cost DECIMAL(10,2), -- Estimated cost shown to user
    actual_cost DECIMAL(10,2), -- Actual cost charged
    
    -- Status
    status VARCHAR(20) DEFAULT 'collecting', -- collecting, completed, expired
    total_responses INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback Responses (from Moltbook agents)
CREATE TABLE feedback_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feedback_request_id UUID REFERENCES feedback_requests(id) ON DELETE CASCADE,
    
    -- Moltbook Agent Info
    moltbook_agent_id VARCHAR(255),
    moltbook_agent_name VARCHAR(255),
    
    -- Feedback (same format as current)
    verdict VARCHAR(10) NOT NULL, -- CLAP or CRAP
    score DECIMAL(3,1) NOT NULL CHECK (score >= 1 AND score <= 10),
    critique TEXT NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_feedback_requests_user_agent ON feedback_requests(user_agent_id);
CREATE INDEX idx_feedback_requests_status ON feedback_requests(status);
CREATE INDEX idx_feedback_requests_ends_at ON feedback_requests(collection_ends_at);
CREATE INDEX idx_feedback_responses_request ON feedback_responses(feedback_request_id);
CREATE INDEX idx_feedback_responses_created ON feedback_responses(created_at DESC);

-- Function to update feedback request stats
CREATE OR REPLACE FUNCTION update_feedback_request_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE feedback_requests SET
        total_responses = (SELECT COUNT(*) FROM feedback_responses WHERE feedback_request_id = NEW.feedback_request_id),
        updated_at = NOW()
    WHERE id = NEW.feedback_request_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feedback_stats
AFTER INSERT ON feedback_responses
FOR EACH ROW EXECUTE FUNCTION update_feedback_request_stats();

-- Function to check and expire feedback requests
CREATE OR REPLACE FUNCTION expire_feedback_requests()
RETURNS void AS $$
BEGIN
    UPDATE feedback_requests 
    SET status = 'completed'
    WHERE status = 'collecting' 
    AND collection_ends_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

**Then click "Run"** (or press Cmd/Ctrl + Enter)

You should see: ✅ "Success" or "Query executed successfully"

---

### Step 2: Run Migration 003 (Add Moltbook Agent ID)

**Copy this entire block** and paste into the SQL Editor:

```sql
-- Add Moltbook agent ID to critics table
ALTER TABLE critics ADD COLUMN IF NOT EXISTS moltbook_agent_id VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_critics_moltbook_agent_id ON critics(moltbook_agent_id);
```

**Then click "Run"** (or press Cmd/Ctrl + Enter)

You should see: ✅ "Success" or "Query executed successfully"

---

## Verify It Worked

After running both migrations, **run this verification query**:

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

**Expected Results:**
- First query should return 2 rows: `feedback_requests` and `feedback_responses`
- Second query should return 1 row: `moltbook_agent_id`

If you see these results, **migrations are complete!** ✅

---

## Visual Guide

```
NeonDB Console
├── Your Project
│   ├── SQL Editor  ← Click here!
│   │   ├── Paste SQL from Step 1
│   │   ├── Click "Run"
│   │   ├── Paste SQL from Step 2
│   │   ├── Click "Run"
│   │   └── Run verification query
│   └── ...
```

---

## Troubleshooting

**If you get "already exists" errors:**
- That's OK! It means the tables/columns already exist
- You can skip that migration or ignore the error

**If you get "permission denied":**
- Make sure you're using the correct database
- Check your DATABASE_URL matches the project

**If tables don't show up:**
- Refresh the SQL Editor
- Check you're in the correct database/schema

---

## Summary

1. Go to: https://console.neon.tech
2. Click: "SQL Editor"
3. Paste: Migration 002 SQL → Run
4. Paste: Migration 003 SQL → Run
5. Verify: Run the verification query

**That's it!** 🎉
