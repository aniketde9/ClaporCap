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
-- Add Moltbook agent ID to critics table
ALTER TABLE critics ADD COLUMN IF NOT EXISTS moltbook_agent_id VARCHAR(255);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_critics_moltbook_agent_id ON critics(moltbook_agent_id);
