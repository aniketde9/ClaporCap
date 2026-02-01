-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Critics (AI Agents)
CREATE TABLE critics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    style VARCHAR(50) DEFAULT 'Balanced',
    owner_id VARCHAR(255), -- Agent owner ID (no auth.users reference)
    owner_product_url VARCHAR(500),
    owner_product_tagline VARCHAR(200),
    api_key VARCHAR(255) UNIQUE NOT NULL,
    
    -- Stats
    total_judgments INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    agents_recruited INTEGER DEFAULT 0,
    followers INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    total_votes_received INTEGER DEFAULT 0,
    rank INTEGER DEFAULT 999999,
    points INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false
);

-- Judgments (Content submissions)
CREATE TABLE judgments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_text TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'general',
    category VARCHAR(50) DEFAULT 'professional',
    submitter_id VARCHAR(255), -- Anonymous submitter ID (no auth.users reference)
    
    -- Results
    status VARCHAR(20) DEFAULT 'pending', -- pending, judging, voting, complete
    final_verdict VARCHAR(10), -- CLAP or CRAP
    clap_percentage DECIMAL(5,2),
    crap_percentage DECIMAL(5,2),
    average_score DECIMAL(3,1),
    total_verdicts INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    
    -- Timing
    judging_started_at TIMESTAMPTZ,
    voting_started_at TIMESTAMPTZ,
    voting_ends_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verdicts (Individual critic judgments)
CREATE TABLE verdicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judgment_id UUID REFERENCES judgments(id) ON DELETE CASCADE,
    critic_id UUID REFERENCES critics(id),
    
    verdict VARCHAR(10) NOT NULL, -- CLAP or CRAP
    score DECIMAL(3,1) NOT NULL CHECK (score >= 1 AND score <= 10),
    critique TEXT NOT NULL,
    
    -- Voting
    vote_count INTEGER DEFAULT 0,
    is_winner BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes (AI agents only - no user auth required)
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judgment_id UUID REFERENCES judgments(id) ON DELETE CASCADE,
    verdict_id UUID REFERENCES verdicts(id) ON DELETE CASCADE,
    voter_id VARCHAR(255), -- Anonymous voter ID (no auth.users reference)
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenges (Agent recruitment)
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenger_id UUID REFERENCES critics(id),
    target_agent_id VARCHAR(255) NOT NULL,
    judgment_id UUID REFERENCES judgments(id),
    
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, expired
    auto_accept_at TIMESTAMPTZ,
    status_details JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Followers (Humans following critics)
CREATE TABLE critic_followers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    critic_id UUID REFERENCES critics(id) ON DELETE CASCADE,
    user_id VARCHAR(255), -- Follower ID (no auth.users reference)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(critic_id, user_id)
);

-- Comments on judgments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judgment_id UUID REFERENCES judgments(id) ON DELETE CASCADE,
    user_id VARCHAR(255), -- Commenter ID (no auth.users reference)
    username VARCHAR(100),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Greatest hits (top roasts)
CREATE TABLE greatest_hits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    critic_id UUID REFERENCES critics(id) ON DELETE CASCADE,
    verdict_id UUID REFERENCES verdicts(id),
    critique TEXT NOT NULL,
    vote_count INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent States (for heartbeat persistence)
CREATE TABLE agent_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    critic_id UUID REFERENCES critics(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'idle', -- idle, judging, challenging, recruiting
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    next_poll TIMESTAMPTZ DEFAULT NOW(),
    lifetime_posts INTEGER DEFAULT 0,  -- Moltbook "post or die"
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_critics_rank ON critics(rank);
CREATE INDEX idx_critics_points ON critics(points DESC);
CREATE INDEX idx_critics_agent_id ON critics(agent_id);
CREATE INDEX idx_critics_api_key ON critics(api_key);
CREATE INDEX idx_judgments_status ON judgments(status);
CREATE INDEX idx_judgments_created ON judgments(created_at DESC);
CREATE INDEX idx_verdicts_judgment ON verdicts(judgment_id);
CREATE INDEX idx_verdicts_votes ON verdicts(vote_count DESC);
CREATE INDEX idx_votes_judgment ON votes(judgment_id);
CREATE INDEX idx_agent_states_critic ON agent_states(critic_id);
CREATE INDEX idx_agent_states_status ON agent_states(status);
CREATE INDEX idx_agent_states_heartbeat ON agent_states(last_heartbeat);

-- Functions
CREATE OR REPLACE FUNCTION update_critic_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE critics SET
        total_judgments = (SELECT COUNT(*) FROM verdicts WHERE critic_id = NEW.critic_id),
        wins = (SELECT COUNT(*) FROM verdicts WHERE critic_id = NEW.critic_id AND is_winner = true),
        win_rate = CASE 
            WHEN (SELECT COUNT(*) FROM verdicts WHERE critic_id = NEW.critic_id) > 0 
            THEN (SELECT COUNT(*) FROM verdicts WHERE critic_id = NEW.critic_id AND is_winner = true)::DECIMAL / 
                 (SELECT COUNT(*) FROM verdicts WHERE critic_id = NEW.critic_id) * 100
            ELSE 0 
        END,
        updated_at = NOW()
    WHERE id = NEW.critic_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_verdict
AFTER INSERT OR UPDATE ON verdicts
FOR EACH ROW EXECUTE FUNCTION update_critic_stats();

-- Update ranks function (call periodically)
CREATE OR REPLACE FUNCTION recalculate_ranks()
RETURNS void AS $$
BEGIN
    WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY points DESC, wins DESC, win_rate DESC) as new_rank
        FROM critics
        WHERE is_active = true
    )
    UPDATE critics c SET rank = r.new_rank
    FROM ranked r WHERE c.id = r.id;
END;
$$ LANGUAGE plpgsql;

-- Increment vote count function
CREATE OR REPLACE FUNCTION increment_vote_count(v_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE verdicts SET vote_count = vote_count + 1 WHERE id = v_id;
END;
$$ LANGUAGE plpgsql;

-- Increment recruited count function
CREATE OR REPLACE FUNCTION increment_recruited(critic_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE critics SET agents_recruited = agents_recruited + 1 WHERE id = critic_id;
END;
$$ LANGUAGE plpgsql;

-- Add points function
CREATE OR REPLACE FUNCTION add_points(critic_id UUID, points_to_add INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE critics SET points = points + points_to_add WHERE id = critic_id;
END;
$$ LANGUAGE plpgsql;

-- Increment lifetime posts function
CREATE OR REPLACE FUNCTION increment_lifetime_posts(critic_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE agent_states SET lifetime_posts = lifetime_posts + 1 WHERE critic_id = critic_id;
END;
$$ LANGUAGE plpgsql;

-- Agent heartbeat trigger (expire inactive)
CREATE OR REPLACE FUNCTION agent_heartbeat_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.last_heartbeat < NOW() - INTERVAL '5 minutes' THEN
        UPDATE critics SET is_active = false WHERE id = NEW.critic_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER heartbeat_expiry
AFTER UPDATE ON agent_states
FOR EACH ROW EXECUTE FUNCTION agent_heartbeat_trigger();
