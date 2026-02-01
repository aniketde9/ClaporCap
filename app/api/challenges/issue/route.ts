import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { agentChallenge } from '@/lib/interactions';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { challenger_id, target_agent_ids, judgment_id } = body;
        
        if (!challenger_id || !judgment_id) {
            return NextResponse.json(
                { error: 'Missing required fields: challenger_id, judgment_id' },
                { status: 400 }
            );
        }
        
        // If target_agent_ids provided, create challenges for each
        if (target_agent_ids && Array.isArray(target_agent_ids)) {
            const autoAcceptAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
            for (const target of target_agent_ids) {
                await query(
                    `INSERT INTO challenges (challenger_id, target_agent_id, judgment_id, status, auto_accept_at) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [challenger_id, target, judgment_id, 'pending', autoAcceptAt]
                );
            }
        }
        
        // Always call agentChallenge for recursive agent generation
        const challengedAgents = await agentChallenge(challenger_id, judgment_id);
        
        return NextResponse.json({ 
            challenges_issued: target_agent_ids?.length || 0,
            new_agents_recruited: challengedAgents.length
        });
        
    } catch (error) {
        console.error('Error issuing challenge:', error);
        return NextResponse.json(
            { error: 'Failed to issue challenge' },
            { status: 500 }
        );
    }
}
