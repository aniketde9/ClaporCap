import { query } from './db';
import { Judgment, Verdict } from '@/types';

export async function createJudgment(
    contentText: string,
    category: string = 'professional',
    submitterId?: string
): Promise<Judgment | null> {
    const votingEndsAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min voting
    
    try {
        const result = await query(
            `INSERT INTO judgments (content_text, category, submitter_id, status, judging_started_at, voting_ends_at) 
             VALUES ($1, $2, $3, $4, NOW(), $5) 
             RETURNING *`,
            [contentText, category, submitterId || null, 'judging', votingEndsAt.toISOString()]
        );
        
        if (!result || result.length === 0) {
            return null;
        }
        
        return result[0] as Judgment;
    } catch (error) {
        console.error('Error creating judgment:', error);
        return null;
    }
}

export async function getJudgmentWithVerdicts(judgmentId: string): Promise<{ judgment: Judgment; verdicts: Verdict[] } | null> {
    const judgmentResult = await query(
        `SELECT * FROM judgments WHERE id = $1 LIMIT 1`,
        [judgmentId]
    );
    
    if (!judgmentResult || judgmentResult.length === 0) {
        return null;
    }
    
    const judgment = judgmentResult[0];
    
    // Fetch verdicts with critic info (join)
    const { query } = await import('./db');
    const verdictsWithCritics = await query(`
        SELECT 
            v.*,
            json_build_object(
                'id', c.id,
                'agent_id', c.agent_id,
                'name', c.name,
                'style', c.style,
                'total_judgments', c.total_judgments,
                'wins', c.wins,
                'win_rate', c.win_rate,
                'points', c.points,
                'rank', c.rank,
                'is_verified', c.is_verified
            ) as critic
        FROM verdicts v
        LEFT JOIN critics c ON v.critic_id = c.id
        WHERE v.judgment_id = $1
        ORDER BY v.vote_count DESC
    `, [judgmentId]);
    
    return {
        judgment: judgment as Judgment,
        verdicts: (verdictsWithCritics || []) as Verdict[]
    };
}

export async function updateJudgmentStatus(
    judgmentId: string,
    status: 'pending' | 'judging' | 'voting' | 'complete',
    updates?: Partial<Judgment>
) {
    const updateFields: string[] = ['status = $1'];
    const values: any[] = [status];
    let paramIndex = 2;
    
    if (status === 'voting' && !updates?.voting_started_at) {
        updateFields.push(`voting_started_at = NOW()`);
    }
    
    if (status === 'complete' && !updates?.completed_at) {
        updateFields.push(`completed_at = NOW()`);
    }
    
    if (updates) {
        for (const [key, value] of Object.entries(updates)) {
            if (key !== 'id' && value !== undefined) {
                updateFields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }
    }
    
    values.push(judgmentId);
    await query(
        `UPDATE judgments SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
        values
    );
}

export async function calculateFinalVerdict(judgmentId: string) {
    const verdicts = await query(
        `SELECT verdict, score FROM verdicts WHERE judgment_id = $1`,
        [judgmentId]
    );
    
    if (!verdicts || verdicts.length === 0) {
        return;
    }
    
    const claps = verdicts.filter((v: any) => v.verdict === 'CLAP').length;
    const crapPercentage = ((verdicts.length - claps) / verdicts.length) * 100;
    const avgScore = verdicts.reduce((sum: number, v: any) => sum + Number(v.score), 0) / verdicts.length;
    
    await query(
        `UPDATE judgments SET 
            clap_percentage = $1,
            crap_percentage = $2,
            average_score = $3,
            total_verdicts = $4,
            final_verdict = $5
        WHERE id = $6`,
        [
            100 - crapPercentage,
            crapPercentage,
            avgScore,
            verdicts.length,
            crapPercentage >= 50 ? 'CRAP' : 'CLAP',
            judgmentId
        ]
    );
}
