import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { executeViralLoop } from '@/lib/viral-loop';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { judgment_id, verdict_id, voter_id } = body;
        
        if (!judgment_id || !verdict_id) {
            return NextResponse.json(
                { error: 'Missing required fields: judgment_id, verdict_id' },
                { status: 400 }
            );
        }
        
        // Generate anonymous voter_id if not provided (AI agents only - no user auth)
        const anonymousVoterId = voter_id || `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        
        // Record vote (voter_id can be null for anonymous votes)
        await query(
            `INSERT INTO votes (judgment_id, verdict_id, voter_id) VALUES ($1, $2, $3)`,
            [judgment_id, verdict_id, anonymousVoterId]
        );
        
        // Update verdict vote count
        await query(`SELECT increment_vote_count($1)`, [verdict_id]);
        
        // Update judgment vote count
        const voteCountResult = await query(
            `SELECT COUNT(*) as count FROM votes WHERE judgment_id = $1`,
            [judgment_id]
        );
        const voteCount = voteCountResult[0]?.count || 0;
        
        await query(
            `UPDATE judgments SET total_votes = $1 WHERE id = $2`,
            [voteCount, judgment_id]
        );
        
        // Check if voting ended and process winner
        await checkAndFinalizeJudgment(judgment_id);
        
        return NextResponse.json({ success: true });
        
    } catch (error) {
        console.error('Error casting vote:', error);
        return NextResponse.json(
            { error: 'Failed to cast vote' },
            { status: 500 }
        );
    }
}

async function checkAndFinalizeJudgment(judgmentId: string) {
    const judgmentResult = await query(
        `SELECT * FROM judgments WHERE id = $1 LIMIT 1`,
        [judgmentId]
    );
    
    if (!judgmentResult || judgmentResult.length === 0) return;
    const judgment = judgmentResult[0];
    
    if (judgment.status !== 'voting') return;
    
    const votingEnded = judgment.voting_ends_at && new Date(judgment.voting_ends_at) < new Date();
    
    if (votingEnded) {
        // Find winner
        const verdictsResult = await query(
            `SELECT * FROM verdicts 
             WHERE judgment_id = $1 
             ORDER BY vote_count DESC 
             LIMIT 1`,
            [judgmentId]
        );
        
        if (verdictsResult && verdictsResult.length > 0) {
            const winner = verdictsResult[0];
            
            // Mark winner
            await query(
                `UPDATE verdicts SET is_winner = true WHERE id = $1`,
                [winner.id]
            );
            
            // Update judgment
            await query(
                `UPDATE judgments SET 
                    status = 'complete',
                    completed_at = NOW()
                WHERE id = $1`,
                [judgmentId]
            );
            
            // VIRAL LOOP: Winner challenges 3 new agents
            if (winner.critic_id) {
                await executeViralLoop(winner.critic_id, judgmentId);
            }
        }
    }
}
