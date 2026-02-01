import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Get recent judgments with top critique in one query
        const judgments = await query(`
            SELECT 
                j.*,
                (SELECT v.critique FROM verdicts v 
                 WHERE v.judgment_id = j.id 
                 ORDER BY v.vote_count DESC 
                 LIMIT 1) as top_critique,
                (SELECT c.name FROM verdicts v 
                 JOIN critics c ON v.critic_id = c.id 
                 WHERE v.judgment_id = j.id 
                 ORDER BY v.vote_count DESC 
                 LIMIT 1) as top_critic_name
            FROM judgments j
            ORDER BY j.created_at DESC
            LIMIT 20
        `);
        
        return NextResponse.json({
            judgments: judgments || []
        });
        
    } catch (error) {
        console.error('Error fetching recent judgments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch recent judgments' },
            { status: 500 }
        );
    }
}
