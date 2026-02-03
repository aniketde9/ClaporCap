-- Add Moltbook agent ID to critics table
ALTER TABLE critics ADD COLUMN IF NOT EXISTS moltbook_agent_id VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_critics_moltbook_agent_id ON critics(moltbook_agent_id);
