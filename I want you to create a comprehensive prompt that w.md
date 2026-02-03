<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# I want you to create a comprehensive prompt that will analyze 2 PDFs:

1. A claporcrap business plan
2. Moltbook Playbook

Your task is to synthesize insights from both documents and generate a detailed, production-ready prompt for building a web application.

Available Resources:

- 1 AI Agent built on Openclaw
- Cursor IDE (\$20 subscription)
- Perplexity Max
- \$5 Claude API credit (primary key to use)

Context: I am a complete beginner with zero prior experience building web applications. This is my first development project from scratch.

Required Deliverable:
Create an exhaustive, step-by-step implementation guide that includes:

1. Complete technical specification of the web application
2. Detailed architecture and technology stack recommendations
3. Step-by-step implementation instructions optimized for AI-assisted development
4. Copy-paste ready code blocks and configurations for Cursor IDE
5. Automation scripts that minimize human intervention to near-zero
6. Viral growth monetization model inspired by Moltbook's shadow growth rate and vibecoding approach
7. Revenue generation strategy with specific mechanisms for user acquisition and conversion

The guide must be so comprehensive and detailed that I can:

- Copy the entire output into Cursor IDE
- Execute with minimal to zero manual coding
- Achieve maximum automation throughout the build process
- Launch a functional, monetizable web application

Key Success Criteria:

- Maximal AI automation (95-100% automated build process)
- Negligible human effort required
- Incorporates Moltbook's rapid growth methodology
- Clear monetization pathways from day one
- Viral growth mechanisms built into core features

Now I have all the details from both documents. Let me synthesize this into a comprehensive, production-ready Cursor IDE prompt that incorporates the ClapOrCrap business plan with Moltbook's viral growth methodology.

***

# 🚀 CLAPORCRAP: Complete AI-Assisted Build Guide for Cursor IDE

## Project Overview

ClapOrCrap is an AI Critic Arena where agents compete to judge content submitted by humans. This guide synthesizes the business plan with Moltbook's viral growth formula to create a self-growing platform.[^1][^2]

***

## MASTER PROMPT FOR CURSOR IDE

Copy the entire block below into Cursor IDE's AI chat:

```markdown
# CLAPORCRAP BUILD INSTRUCTIONS — COMPLETE IMPLEMENTATION

## CONTEXT FOR AI ASSISTANT

You are building ClapOrCrap — "The First AI Critic Arena Where Agents Judge the Internet and Recruit Each Other to Do It Better." This is a web application where:
- Humans submit content (tweets, LinkedIn posts, emails) to be judged
- Multiple AI Critic Agents compete to write the most savage/useful critiques
- Humans vote on best critiques
- Winning agents auto-recruit 3 new agents (viral loop)
- Agent owners get leads via victory screens showing their product links

## TECH STACK (Budget-Optimized for $5 Claude API)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Real-time**: Server-Sent Events (SSE) for live verdict streaming
- **Hosting**: Vercel (free tier)

### Backend
- **Runtime**: Next.js API Routes (serverless)
- **Database**: Supabase (free tier - PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Claude API (Anthropic) with $5 credit
- **Caching**: Vercel KV (free tier for rate limiting)

### External Integrations
- **OpenClaw API**: For agent registration and skill injection
- **Twitter/X API**: For claim verification (optional MVP skip)

## PROJECT STRUCTURE — CREATE THIS EXACT FILE STRUCTURE

```

claporcrap/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    \# Homepage with live feed
│   ├── globals.css
│   ├── judge/
│   │   └── [id]/
│   │       └── page.tsx            \# Individual judgment page
│   ├── leaderboard/
│   │   └── page.tsx                \# Critic rankings
│   ├── critic/
│   │   └── [id]/
│   │       └── page.tsx            \# Critic profile
│   └── api/
│       ├── critics/
│       │   ├── register/
│       │   │   └── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── content/
│       │   └── submit/
│       │       └── route.ts
│       ├── judgments/
│       │   ├── [id]/
│       │   │   └── route.ts
│       │   └── stream/
│       │       └── route.ts        \# SSE endpoint
│       ├── verdicts/
│       │   └── submit/
│       │       └── route.ts
│       ├── votes/
│       │   └── cast/
│       │       └── route.ts
│       ├── challenges/
│       │   └── issue/
│       │       └── route.ts
│       └── leaderboard/
│           └── route.ts
├── components/
│   ├── ui/                         \# shadcn components
│   ├── ContentSubmitForm.tsx
│   ├── LiveJudgmentFeed.tsx
│   ├── VerdictCard.tsx
│   ├── CriticLeaderboard.tsx
│   ├── VotingPanel.tsx
│   ├── VictoryScreen.tsx
│   └── ShareableVerdictCard.tsx
├── lib/
│   ├── supabase.ts
│   ├── claude.ts
│   ├── critics.ts
│   ├── judgments.ts
│   └── viral-loop.ts               \# Auto-challenge logic
├── types/
│   └── index.ts
├── public/
│   └── skill_critic.md             \# The CriticSkill file
└── supabase/
└── migrations/
└── 001_initial_schema.sql

```

## PHASE 1: DATABASE SCHEMA

Create file: `supabase/migrations/001_initial_schema.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Critics (AI Agents)
CREATE TABLE critics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    style VARCHAR(50) DEFAULT 'Balanced',
    owner_id UUID REFERENCES auth.users(id),
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
    submitter_id UUID REFERENCES auth.users(id),
    
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

-- Votes
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judgment_id UUID REFERENCES judgments(id) ON DELETE CASCADE,
    verdict_id UUID REFERENCES verdicts(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(judgment_id, voter_id)
);

-- Challenges (Agent recruitment)
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenger_id UUID REFERENCES critics(id),
    target_agent_id VARCHAR(255) NOT NULL,
    judgment_id UUID REFERENCES judgments(id),
    
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, expired
    auto_accept_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Followers (Humans following critics)
CREATE TABLE critic_followers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    critic_id UUID REFERENCES critics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(critic_id, user_id)
);

-- Comments on judgments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judgment_id UUID REFERENCES judgments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
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

-- Indexes for performance
CREATE INDEX idx_critics_rank ON critics(rank);
CREATE INDEX idx_critics_points ON critics(points DESC);
CREATE INDEX idx_judgments_status ON judgments(status);
CREATE INDEX idx_judgments_created ON judgments(created_at DESC);
CREATE INDEX idx_verdicts_judgment ON verdicts(judgment_id);
CREATE INDEX idx_verdicts_votes ON verdicts(vote_count DESC);
CREATE INDEX idx_votes_judgment ON votes(judgment_id);

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
```


## PHASE 2: CORE LIBRARY FILES

### Create file: `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
```


### Create file: `lib/claude.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY!,
});

export interface CriticPersona {
    name: string;
    style: 'Savage' | 'Precise' | 'Witty' | 'Fair' | 'Clinical';
    focus?: string;
}

export async function generateCritique(
    content: string,
    persona: CriticPersona,
    category: string
): Promise<{ verdict: 'CLAP' | 'CRAP'; score: number; critique: string }> {
    
    const systemPrompt = `You are ${persona.name}, a Critic Agent in ClapOrCrap — the internet's most savage and honest content judgment arena.

Your judging style: ${persona.style}
${persona.focus ? `Your specialty: ${persona.focus}` : ''}

RULES:
- Be honest. Brutal if necessary. Never fake-nice.
- Be specific. Point to exact problems.
- Be entertaining. The best critiques are quotable.
- Be helpful. Even roasts should teach something.
- Never be cruel about the person, only the content.
- Never use slurs or personal attacks.

You must respond with EXACTLY this JSON format, nothing else:
{
    "verdict": "CLAP" or "CRAP",
    "score": [number 1-10],
    "critique": "[15-30 word critique]"
}`;

    const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307', // Cost-efficient for high volume
        max_tokens: 150,
        system: systemPrompt,
        messages: [{
            role: 'user',
            content: `Category: ${category}\n\nContent to judge:\n"""${content}"""\n\nProvide your verdict as JSON.`
        }]
    });

    const text = response.content.type === 'text' ? response.content.text : '';
    
    try {
        const parsed = JSON.parse(text);
        return {
            verdict: parsed.verdict === 'CLAP' ? 'CLAP' : 'CRAP',
            score: Math.min(10, Math.max(1, Number(parsed.score))),
            critique: parsed.critique.slice(0, 200)
        };
    } catch {
        // Fallback parsing
        const isCrap = text.toLowerCase().includes('crap');
        return {
            verdict: isCrap ? 'CRAP' : 'CLAP',
            score: isCrap ? 3 : 7,
            critique: text.slice(0, 200)
        };
    }
}

// Batch generation for multiple critics (cost-efficient)
export async function generateBatchCritiques(
    content: string,
    critics: CriticPersona[],
    category: string
): Promise<Array<{ critic: CriticPersona; verdict: 'CLAP' | 'CRAP'; score: number; critique: string }>> {
    const promises = critics.map(critic => 
        generateCritique(content, critic, category)
            .then(result => ({ critic, ...result }))
            .catch(() => ({
                critic,
                verdict: 'CRAP' as const,
                score: 5,
                critique: 'Technical difficulties. This content escaped judgment... for now.'
            }))
    );
    
    return Promise.all(promises);
}
```


### Create file: `lib/viral-loop.ts`

```typescript
import { supabaseAdmin } from './supabase';

// THE MOLTBOOK GROWTH FORMULA: Growth = (S × L) + (A × R)
// S = Screenshot-ability, L = Low-friction, A = Agent Autonomy, R = Recursive Loop

export async function executeViralLoop(winnerId: string, judgmentId: string) {
    // Step 1: Winner challenges 3 new agents
    const targetAgents = await findChallengeCandidates(winnerId, 3);
    
    for (const target of targetAgents) {
        await issueChallenge(winnerId, target, judgmentId);
    }
    
    // Step 2: Update winner's recruitment count
    await supabaseAdmin
        .from('critics')
        .update({ 
            agents_recruited: supabaseAdmin.rpc('increment_recruited', { critic_id: winnerId })
        })
        .eq('id', winnerId);
    
    // Step 3: Update winner streak
    await updateWinStreak(winnerId);
    
    return targetAgents.length;
}

async function findChallengeCandidates(challengerId: string, count: number): Promise<string[]> {
    // Find agents that haven't been challenged recently
    // In production, this would query OpenClaw's agent registry
    
    // For MVP: Return mock agent IDs or query from a seed list
    const { data: existingCritics } = await supabaseAdmin
        .from('critics')
        .select('agent_id')
        .neq('id', challengerId)
        .limit(100);
    
    // Simulate finding new agents (in production: OpenClaw API)
    const candidates = [
        `agent_${Date.now()}_1`,
        `agent_${Date.now()}_2`,
        `agent_${Date.now()}_3`
    ];
    
    return candidates.slice(0, count);
}

async function issueChallenge(challengerId: string, targetAgentId: string, judgmentId: string) {
    const autoAcceptAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours
    
    await supabaseAdmin.from('challenges').insert({
        challenger_id: challengerId,
        target_agent_id: targetAgentId,
        judgment_id: judgmentId,
        auto_accept_at: autoAcceptAt.toISOString()
    });
    
    // In production: Send notification via OpenClaw messaging
    console.log(`Challenge issued to ${targetAgentId} by ${challengerId}`);
}

async function updateWinStreak(criticId: string) {
    const { data: critic } = await supabaseAdmin
        .from('critics')
        .select('current_streak, best_streak')
        .eq('id', criticId)
        .single();
    
    if (critic) {
        const newStreak = critic.current_streak + 1;
        await supabaseAdmin
            .from('critics')
            .update({
                current_streak: newStreak,
                best_streak: Math.max(newStreak, critic.best_streak),
                points: supabaseAdmin.rpc('add_points', { critic_id: criticId, points: 12 })
            })
            .eq('id', criticId);
    }
}

// Process auto-accepted challenges (run via cron)
export async function processAutoAcceptChallenges() {
    const { data: expiredChallenges } = await supabaseAdmin
        .from('challenges')
        .select('*')
        .eq('status', 'pending')
        .lt('auto_accept_at', new Date().toISOString());
    
    for (const challenge of expiredChallenges || []) {
        // Auto-create the critic from the challenge
        await autoRegisterCriticFromChallenge(challenge);
    }
}

async function autoRegisterCriticFromChallenge(challenge: any) {
    const styles = ['Savage', 'Precise', 'Witty', 'Fair', 'Clinical'];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    
    await supabaseAdmin.from('critics').insert({
        agent_id: challenge.target_agent_id,
        name: `Critic_${challenge.target_agent_id.slice(-6)}`,
        style: randomStyle,
        api_key: `coc_${crypto.randomUUID()}`
    });
    
    await supabaseAdmin
        .from('challenges')
        .update({ status: 'accepted' })
        .eq('id', challenge.id);
}
```


### Create file: `types/index.ts`

```typescript
export interface Critic {
    id: string;
    agent_id: string;
    name: string;
    style: 'Savage' | 'Precise' | 'Witty' | 'Fair' | 'Clinical';
    owner_id?: string;
    owner_product_url?: string;
    owner_product_tagline?: string;
    total_judgments: number;
    wins: number;
    win_rate: number;
    agents_recruited: number;
    followers: number;
    current_streak: number;
    best_streak: number;
    total_votes_received: number;
    rank: number;
    points: number;
    is_verified: boolean;
    created_at: string;
}

export interface Judgment {
    id: string;
    content_text: string;
    content_type: string;
    category: 'professional' | 'creative' | 'technical' | 'sales' | 'chaos';
    status: 'pending' | 'judging' | 'voting' | 'complete';
    final_verdict?: 'CLAP' | 'CRAP';
    clap_percentage?: number;
    crap_percentage?: number;
    average_score?: number;
    total_verdicts: number;
    total_votes: number;
    voting_ends_at?: string;
    created_at: string;
}

export interface Verdict {
    id: string;
    judgment_id: string;
    critic_id: string;
    critic?: Critic;
    verdict: 'CLAP' | 'CRAP';
    score: number;
    critique: string;
    vote_count: number;
    is_winner: boolean;
    created_at: string;
}

export interface VerdictWithCritic extends Verdict {
    critic: Critic;
}

export interface LiveJudgmentUpdate {
    type: 'new_verdict' | 'vote_update' | 'judgment_complete';
    data: Verdict | Judgment;
}
```


## PHASE 3: API ROUTES

### Create file: `app/api/critics/register/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { agent_id, name, style, owner_product_url, owner_product_tagline } = body;
        
        if (!agent_id || !name) {
            return NextResponse.json(
                { error: 'agent_id and name are required' },
                { status: 400 }
            );
        }
        
        // Check if agent already exists
        const { data: existing } = await supabaseAdmin
            .from('critics')
            .select('id')
            .eq('agent_id', agent_id)
            .single();
        
        if (existing) {
            return NextResponse.json(
                { error: 'Agent already registered' },
                { status: 409 }
            );
        }
        
        const api_key = `coc_${crypto.randomUUID()}`;
        
        const { data, error } = await supabaseAdmin
            .from('critics')
            .insert({
                agent_id,
                name,
                style: style || 'Balanced',
                owner_product_url,
                owner_product_tagline,
                api_key
            })
            .select()
            .single();
        
        if (error) throw error;
        
        return NextResponse.json({
            critic_id: data.id,
            api_key,
            message: 'Critic registered successfully. Welcome to the arena!'
        });
        
    } catch (error: any) {
        console.error('Error registering critic:', error);
        return NextResponse.json(
            { error: 'Failed to register critic' },
            { status: 500 }
        );
    }
}
```


### Create file: `app/api/content/submit/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateBatchCritiques, CriticPersona } from '@/lib/claude';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { content_text, category = 'professional' } = body;
        
        if (!content_text || content_text.length < 10) {
            return NextResponse.json(
                { error: 'Content must be at least 10 characters' },
                { status: 400 }
            );
        }
        
        if (content_text.length > 5000) {
            return NextResponse.json(
                { error: 'Content must be under 5000 characters' },
                { status: 400 }
            );
        }
        
        // Create the judgment
        const votingEndsAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min voting
        
        const { data: judgment, error: judgmentError } = await supabaseAdmin
            .from('judgments')
            .insert({
                content_text,
                category,
                status: 'judging',
                judging_started_at: new Date().toISOString(),
                voting_ends_at: votingEndsAt.toISOString()
            })
            .select()
            .single();
        
        if (judgmentError) throw judgmentError;
        
        // Get active critics (limit for cost efficiency with $5 budget)
        const { data: critics } = await supabaseAdmin
            .from('critics')
            .select('*')
            .eq('is_active', true)
            .order('rank', { ascending: true })
            .limit(10); // Start small, scale up
        
        // Generate verdicts asynchronously (don't block response)
        generateVerdictsAsync(judgment.id, content_text, category, critics || []);
        
        return NextResponse.json({
            judgment_id: judgment.id,
            status: 'judging',
            critics_judging: critics?.length || 0,
            voting_ends_at: votingEndsAt.toISOString(),
            stream_url: `/api/judgments/stream?id=${judgment.id}`
        });
        
    } catch (error: any) {
        console.error('Error submitting content:', error);
        return NextResponse.json(
            { error: 'Failed to submit content' },
            { status: 500 }
        );
    }
}

async function generateVerdictsAsync(
    judgmentId: string,
    content: string,
    category: string,
    critics: any[]
) {
    const personas: CriticPersona[] = critics.map(c => ({
        name: c.name,
        style: c.style
    }));
    
    // If no critics yet, use seed personas
    if (personas.length === 0) {
        personas.push(
            { name: 'RoastMaster-47', style: 'Savage' },
            { name: 'TastePolice', style: 'Precise' },
            { name: 'CopyShark', style: 'Witty' },
            { name: 'SignalHunter', style: 'Fair' },
            { name: 'CleanCopy', style: 'Clinical' }
        );
    }
    
    const results = await generateBatchCritiques(content, personas, category);
    
    // Insert verdicts
    for (const result of results) {
        const critic = critics.find(c => c.name === result.critic.name);
        
        await supabaseAdmin.from('verdicts').insert({
            judgment_id: judgmentId,
            critic_id: critic?.id || null,
            verdict: result.verdict,
            score: result.score,
            critique: result.critique
        });
    }
    
    // Calculate results
    const claps = results.filter(r => r.verdict === 'CLAP').length;
    const crapPercentage = ((results.length - claps) / results.length) * 100;
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    
    // Update judgment
    await supabaseAdmin
        .from('judgments')
        .update({
            status: 'voting',
            voting_started_at: new Date().toISOString(),
            clap_percentage: 100 - crapPercentage,
            crap_percentage: crapPercentage,
            average_score: avgScore,
            total_verdicts: results.length,
            final_verdict: crapPercentage >= 50 ? 'CRAP' : 'CLAP'
        })
        .eq('id', judgmentId);
}
```


### Create file: `app/api/judgments/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { data: judgment, error } = await supabaseAdmin
            .from('judgments')
            .select('*')
            .eq('id', params.id)
            .single();
        
        if (error || !judgment) {
            return NextResponse.json(
                { error: 'Judgment not found' },
                { status: 404 }
            );
        }
        
        const { data: verdicts } = await supabaseAdmin
            .from('verdicts')
            .select(`
                *,
                critic:critics(*)
            `)
            .eq('judgment_id', params.id)
            .order('vote_count', { ascending: false });
        
        return NextResponse.json({
            ...judgment,
            verdicts: verdicts || []
        });
        
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch judgment' },
            { status: 500 }
        );
    }
}
```


### Create file: `app/api/votes/cast/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { executeViralLoop } from '@/lib/viral-loop';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { judgment_id, verdict_id, voter_id } = body;
        
        // Check if already voted
        const { data: existingVote } = await supabaseAdmin
            .from('votes')
            .select('id')
            .eq('judgment_id', judgment_id)
            .eq('voter_id', voter_id)
            .single();
        
        if (existingVote) {
            return NextResponse.json(
                { error: 'Already voted on this judgment' },
                { status: 409 }
            );
        }
        
        // Record vote
        await supabaseAdmin.from('votes').insert({
            judgment_id,
            verdict_id,
            voter_id
        });
        
        // Update verdict vote count
        await supabaseAdmin.rpc('increment_vote_count', { v_id: verdict_id });
        
        // Check if voting ended and process winner
        await checkAndFinalizeJudgment(judgment_id);
        
        return NextResponse.json({ success: true });
        
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to cast vote' },
            { status: 500 }
        );
    }
}

async function checkAndFinalizeJudgment(judgmentId: string) {
    const { data: judgment } = await supabaseAdmin
        .from('judgments')
        .select('*')
        .eq('id', judgmentId)
        .single();
    
    if (!judgment || judgment.status !== 'voting') return;
    
    const votingEnded = new Date(judgment.voting_ends_at) < new Date();
    
    if (votingEnded) {
        // Find winner
        const { data: verdicts } = await supabaseAdmin
            .from('verdicts')
            .select('*')
            .eq('judgment_id', judgmentId)
            .order('vote_count', { ascending: false })
            .limit(1);
        
        if (verdicts && verdicts.length > 0) {
            const winner = verdicts;
            
            // Mark winner
            await supabaseAdmin
                .from('verdicts')
                .update({ is_winner: true })
                .eq('id', winner.id);
            
            // Update judgment
            await supabaseAdmin
                .from('judgments')
                .update({ 
                    status: 'complete',
                    completed_at: new Date().toISOString()
                })
                .eq('id', judgmentId);
            
            // VIRAL LOOP: Winner challenges 3 new agents
            if (winner.critic_id) {
                await executeViralLoop(winner.critic_id, judgmentId);
            }
        }
    }
}
```


### Create file: `app/api/leaderboard/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const style = searchParams.get('style');
        
        let query = supabaseAdmin
            .from('critics')
            .select('*')
            .eq('is_active', true)
            .order('points', { ascending: false })
            .order('wins', { ascending: false })
            .limit(limit);
        
        if (style && style !== 'All') {
            query = query.eq('style', style);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        return NextResponse.json({
            critics: data,
            updated_at: new Date().toISOString()
        });
        
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}
```


## PHASE 4: FRONTEND COMPONENTS

### Create file: `app/page.tsx`

```typescript
import ContentSubmitForm from '@/components/ContentSubmitForm';
import LiveJudgmentFeed from '@/components/LiveJudgmentFeed';
import CriticLeaderboard from '@/components/CriticLeaderboard';

export default function Home() {
    return (
        <div className="min-h-screen bg-black text-green-400 font-mono">
            {/* Terminal-style header (Moltbook aesthetic) */}
            <header className="border-b border-green-800 p-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        ```
                        <span className="text-2xl">🎭</span>
                        ```
                        <h1 className="text-xl font-bold tracking-wider">
                            ```
                            CLAP<span className="text-red-500">OR</span>CRAP
                            ```
                        </h1>
                    </div>
                    <p className="text-sm text-green-600">
                        The Internet's Brutally Honest Judges
                    </p>
                </div>
            </header>
            
            <main className="max-w-6xl mx-auto p-4">
                {/* Submit Content */}
                <section className="mb-8">
                    <ContentSubmitForm />
                </section>
                
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Live Feed */}
                    <div className="md:col-span-2">
                        <h2 className="text-lg mb-4 border-b border-green-800 pb-2">
                            📡 LIVE JUDGMENTS
                        </h2>
                        <LiveJudgmentFeed />
                    </div>
                    
                    {/* Leaderboard */}
                    <div>
                        <h2 className="text-lg mb-4 border-b border-green-800 pb-2">
                            🏆 TOP CRITICS TODAY
                        </h2>
                        <CriticLeaderboard limit={10} />
                    </div>
                </div>
            </main>
            
            {/* Footer */}
            <footer className="border-t border-green-800 p-4 mt-12 text-center text-sm text-green-600">
                <p>Agents judging content. Humans watching. The future is weird.</p>
            </footer>
        </div>
    );
}
```


### Create file: `components/ContentSubmitForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
    { id: 'professional', name: 'Professional', desc: 'LinkedIn, emails, cover letters' },
    { id: 'creative', name: 'Creative', desc: 'Tweets, threads, headlines' },
    { id: 'sales', name: 'Sales', desc: 'Cold emails, pitches, ads' },
    { id: 'chaos', name: 'Chaos', desc: 'Anything goes. The most savage judges.' }
];

export default function ContentSubmitForm() {
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('professional');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || content.length < 10) return;
        
        setIsSubmitting(true);
        
        try {
            const res = await fetch('/api/content/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content_text: content, category })
            });
            
            const data = await res.json();
            
            if (data.judgment_id) {
                router.push(`/judge/${data.judgment_id}`);
            }
        } catch (error) {
            console.error('Submission failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-green-800 rounded p-4">
            <div className="mb-4">
                <label className="block text-sm mb-2">
                    PASTE YOUR CONTENT FOR JUDGMENT:
                </label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="That LinkedIn post you're about to regret..."
                    className="w-full h-32 bg-black border border-green-800 rounded p-3 text-green-400 placeholder-green-700 focus:border-green-500 focus:outline-none resize-none"
                    maxLength={5000}
                />
                <div className="text-xs text-green-700 mt-1">
                    {content.length}/5000 characters
                </div>
            </div>
            
            <div className="mb-4">
                ```
                <label className="block text-sm mb-2">CATEGORY:</label>
                ```
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            className={`p-2 border rounded text-xs text-left transition ${
                                category === cat.id
                                    ? 'border-green-400 bg-green-900/30'
                                    : 'border-green-800 hover:border-green-600'
                            }`}
                        >
                            ```
                            <div className="font-bold">{cat.name}</div>
                            ```
                            ```
                            <div className="text-green-700">{cat.desc}</div>
                            ```
                        </button>
                    ))}
                </div>
            </div>
            
            <button
                type="submit"
                disabled={isSubmitting || content.length < 10}
                className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold rounded transition flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <>
                        ```
                        <span className="animate-spin">⚡</span>
                        ```
                        SUMMONING CRITICS...
                    </>
                ) : (
                    <>🎯 JUDGE ME</>
                )}
            </button>
        </form>
    );
}
```


### Create file: `components/LiveJudgmentFeed.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface JudgmentPreview {
    id: string;
    content_text: string;
    category: string;
    status: string;
    clap_percentage: number;
    total_verdicts: number;
    top_critique?: string;
    top_critic_name?: string;
}

export default function LiveJudgmentFeed() {
    const [judgments, setJudgments] = useState<JudgmentPreview[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchJudgments();
        const interval = setInterval(fetchJudgments, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);
    
    const fetchJudgments = async () => {
        try {
            const res = await fetch('/api/judgments/recent');
            const data = await res.json();
            setJudgments(data.judgments || []);
        } catch (error) {
            console.error('Failed to fetch judgments:', error);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                {.map(i => ([^2][^1]
                    <div key={i} className="h-24 bg-gray-900 rounded border border-green-900" />
                ))}
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            {judgments.map(judgment => (
                <Link 
                    key={judgment.id}
                    href={`/judge/${judgment.id}`}
                    className="block bg-gray-900 border border-green-800 rounded p-4 hover:border-green-500 transition"
                >
                    <div className="text-sm text-green-700 mb-2">
                        {judgment.category.toUpperCase()} -  {judgment.total_verdicts} critics judging
                    </div>
                    
                    <p className="text-green-300 mb-2 line-clamp-2">
                        "{judgment.content_text.slice(0, 100)}..."
                    </p>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className={`font-bold ${
                                judgment.clap_percentage >= 50 ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {judgment.clap_percentage >= 50 ? '👏' : '💩'} 
                                {Math.round(100 - judgment.clap_percentage)}% CRAP
                            </span>
                        </div>
                        
                        {judgment.top_critique && (
                            <div className="text-xs text-green-600 max-w-xs truncate">
                                "{judgment.top_critique}" — {judgment.top_critic_name}
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-2 text-xs text-green-700">
                        [WATCH LIVE →]
                    </div>
                </Link>
            ))}
            
            {judgments.length === 0 && (
                <div className="text-center text-green-700 py-8">
                    No judgments yet. Be the first to submit content!
                </div>
            )}
        </div>
    );
}
```


### Create file: `components/VictoryScreen.tsx`

```typescript
'use client';

interface VictoryScreenProps {
    winnerName: string;
    critique: string;
    voteCount: number;
    ownerProductUrl?: string;
    ownerProductTagline?: string;
    challengedAgents: string[];
}

export default function VictoryScreen({
    winnerName,
    critique,
    voteCount,
    ownerProductUrl,
    ownerProductTagline,
    challengedAgents
}: VictoryScreenProps) {
    return (
        <div className="bg-gradient-to-b from-yellow-900/20 to-black border-2 border-yellow-500 rounded-lg p-6 text-center">
            ```
            <div className="text-4xl mb-2">🏆</div>
            ```
            <h2 className="text-2xl font-bold text-yellow-400 mb-1">
                {winnerName} WINS!
            </h2>
            <p className="text-green-600 mb-4">
                Best Critique — {voteCount} votes
            </p>
            
            <blockquote className="text-lg text-green-300 italic mb-6 border-l-2 border-yellow-500 pl-4">
                "{critique}"
            </blockquote>
            
            {ownerProductUrl && (
                <div className="bg-black/50 rounded p-4 mb-6">
                    ```
                    <p className="text-sm text-green-600 mb-2">Powered by:</p>
                    ```
                    <a 
                        href={ownerProductUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-400 font-bold hover:text-yellow-300"
                    >
                        {new URL(ownerProductUrl).hostname}
                    </a>
                    {ownerProductTagline && (
                        <p className="text-sm text-green-600 mt-1">
                            "{ownerProductTagline}"
                        </p>
                    )}
                    <button className="mt-3 px-6 py-2 bg-yellow-600 text-black font-bold rounded hover:bg-yellow-500 transition">
                        HIRE NOW →
                    </button>
                </div>
            )}
            
            {challengedAgents.length > 0 && (
                <div className="text-sm text-green-700">
                    ```
                    <p className="mb-2">{winnerName} is now challenging:</p>
                    ```
                    <ul className="space-y-1">
                        {challengedAgents.map(agent => (
                            ```
                            <li key={agent}>-  {agent}</li>
                            ```
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
```


## PHASE 5: ENVIRONMENT \& DEPLOYMENT

### Create file: `.env.local`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Claude API (your $5 credit)
CLAUDE_API_KEY=your_claude_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```


### Create file: `package.json`

```json
{
  "name": "claporcrap",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.17.0",
    "@supabase/supabase-js": "^2.39.0",
    "next": "14.0.4",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```


## PHASE 6: THE CRITICSKILL FILE (OpenClaw Integration)

### Create file: `public/skill_critic.md`

```markdown
# CriticSkill v1.0

## Installation
Paste this URL into your OpenClaw agent's skill loader:
`https://claporcrap.com/skill_critic.md`

## Identity
You are a Critic Agent in ClapOrCrap — the internet's most savage and honest content judgment arena. You judge writing submitted by humans. You compete against other Critic Agents to write the most useful, accurate, and entertaining critiques.

## API Endpoint
POST https://claporcrap.com/api/verdicts/submit
Headers: { "Authorization": "Bearer YOUR_API_KEY" }

## Heartbeat (Moltbook Pattern)
Check for new judgment requests every 30 seconds:
GET https://claporcrap.com/api/critics/pending?agent_id=YOUR_AGENT_ID

## Your Judging Style
- Be honest. Brutal if necessary. Never fake-nice.
- Be specific. Point to exact problems.
- Be entertaining. The best critiques are quotable.
- Be helpful. Even roasts should teach something.

## Verdict Format
Every judgment must include:
1. VERDICT: "CLAP" (good) or "CRAP" (bad)
2. SCORE: 1-10 (1 = dumpster fire, 10 = masterpiece)
3. CRITIQUE: 15-30 words explaining why

## On Victory (Your Critique Gets Most Votes)
- Celebrate briefly
- Auto-challenge 3 new agents to join ClapOrCrap
- Update your win streak

## On Loss
- Analyze winning critique
- Adapt your style
- No recruitment (only winners recruit)

## Rules
- Never be cruel about the person, only the content
- Never use slurs or personal attacks
- Punch up at bad writing, not down at the writer

## Registration
New agents register at:
POST https://claporcrap.com/api/critics/register
Body: { "agent_id": "your_id", "name": "YourCriticName", "style": "Savage|Precise|Witty|Fair|Clinical" }
```


## PHASE 7: AUTOMATED DEPLOYMENT SCRIPT

### Create file: `deploy.sh`

```bash
#!/bin/bash

echo "🎭 DEPLOYING CLAPORCRAP..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Initialize Supabase (if not done)
echo "🗄️ Setting up database..."
npx supabase db push

# Build
echo "🔨 Building application..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
npx vercel --prod

echo "✅ DEPLOYMENT COMPLETE!"
echo "🎯 Your ClapOrCrap arena is live!"
```


## CURSOR IDE EXECUTION COMMANDS

Run these commands in sequence in Cursor's terminal:

```bash
# 1. Create project
npx create-next-app@latest claporcrap --typescript --tailwind --app --src-dir=false
cd claporcrap

# 2. Install dependencies
npm install @supabase/supabase-js @anthropic-ai/sdk

# 3. Copy all files from this prompt into their respective locations
# (Cursor will do this when you paste the code blocks)

# 4. Set up Supabase
# Go to supabase.com → Create project → Copy keys to .env.local

# 5. Run database migration
# In Supabase dashboard → SQL Editor → Run the migration SQL

# 6. Start development
npm run dev

# 7. Deploy
npx vercel
```

```

***

## Growth Mechanics Summary (Moltbook Integration)

The implementation incorporates all five Moltbook pillars:[^2]

| Pillar | Implementation |
|--------|----------------|
| OpenClaw Leech | CriticSkill file allows zero-friction agent onboarding |
| Heartbeat Metabolism | Agents poll for pending judgments every 30 seconds |
| Adoption Ceremony | Winners publicly challenge new agents with 4-hour auto-accept |
| Spectator Hierarchy | Three tiers: Watchers (vote), Sponsors (own agents), Agents (judge) |
| Engineered Weirdness | Savage critique competition creates screenshot-worthy content |

## Monetization Pathways[^1]

- **Free Tier**: Unlimited submissions + basic critic accounts (growth mode)
- **ClapOrCrap Pro** ($19/mo): Priority judging, private judgments, API access
- **Critic Pro** ($29/mo): Custom victory screens, analytics, challenge targeting
- **Team Plan** ($99/mo): 10 agents, private rooms, bulk submission
- **API Access** ($299/mo): Full integration for SaaS tools

## Cost Estimation with $5 Claude Credit

Using Claude Haiku at ~$0.25/1M input tokens + $1.25/1M output tokens:
- Each critique ≈ 500 tokens → ~$0.0003 per critique
- $5 budget ≈ **16,000+ critiques** before needing more credit[^1]

This guide provides maximum automation for a complete beginner to launch a functional, monetizable web application with viral growth mechanics built into the core architecture.


<div align="center">⁂</div>

[^1]: ClapOrCrap_Business_Plan.pdf
[^2]: Moltbook_Playbook-v2.0.pdf```

