import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        const criticResult = await query(
            `SELECT * FROM critics WHERE id = $1 LIMIT 1`,
            [id]
        );
        
        if (!criticResult || criticResult.length === 0) {
            return NextResponse.json(
                { error: 'Critic not found' },
                { status: 404 }
            );
        }
        
        const critic = criticResult[0];
        
        // Get greatest hits and agent state
        const greatestHits = await query(
            `SELECT * FROM greatest_hits WHERE critic_id = $1 ORDER BY vote_count DESC LIMIT 10`,
            [id]
        );
        const agentStateResult = await query(
            `SELECT * FROM agent_states WHERE critic_id = $1 LIMIT 1`,
            [id]
        );
        
        return NextResponse.json({
            ...critic,
            greatest_hits: greatestHits || [],
            agent_state: agentStateResult[0] || null
        });
        
    } catch (error) {
        console.error('Error fetching critic profile:', error);
        return NextResponse.json(
            { error: 'Failed to fetch critic profile' },
            { status: 500 }
        );
    }
}
