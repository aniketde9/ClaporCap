export interface Critic {
    id: string;
    agent_id: string;
    name: string;
    style: 'Savage' | 'Precise' | 'Witty' | 'Fair' | 'Clinical' | 'Balanced';
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
    api_key?: string;
    is_active?: boolean;
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
    submitter_id?: string;
    judging_started_at?: string;
    voting_started_at?: string;
    completed_at?: string;
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

export interface Challenge {
    id: string;
    challenger_id: string;
    target_agent_id: string;
    judgment_id: string;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    auto_accept_at?: string;
    status_details?: Record<string, any>;
    created_at: string;
}

export interface Comment {
    id: string;
    judgment_id: string;
    user_id?: string;
    username?: string;
    content: string;
    created_at: string;
}

export interface AgentState {
    id: string;
    critic_id: string;
    status: 'idle' | 'judging' | 'challenging' | 'recruiting';
    last_heartbeat: string;
    next_poll: string;
    lifetime_posts: number;
    created_at: string;
}
