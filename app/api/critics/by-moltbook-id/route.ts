import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Get ClapOrCrap agent by Moltbook agent_id
 * This allows users to retrieve their existing agent without needing localStorage
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const moltbookAgentId = searchParams.get('moltbook_agent_id');
        
        if (!moltbookAgentId) {
            return NextResponse.json(
                { error: 'moltbook_agent_id parameter is required' },
                { status: 400 }
            );
        }
        
        // Check both moltbook_agent_id and agent_id fields (for backward compatibility)
        const result = await query(
            `SELECT id, agent_id, name, style, api_key, moltbook_agent_id 
             FROM critics 
             WHERE moltbook_agent_id = $1 OR agent_id = $1 
             LIMIT 1`,
            [moltbookAgentId]
        );
        
        if (!result || result.length === 0) {
            return NextResponse.json(
                { error: 'Agent not found' },
                { status: 404 }
            );
        }
        
        const agent = result[0];
        
        // Don't return the API key for security (user should have saved it)
        return NextResponse.json({
            critic_id: agent.id,
            agent_id: agent.agent_id,
            name: agent.name,
            style: agent.style,
            moltbook_agent_id: agent.moltbook_agent_id || agent.agent_id,
            exists: true
        });
        
    } catch (error: any) {
        console.error('Error fetching agent by Moltbook ID:', error);
        return NextResponse.json(
            { error: 'Failed to fetch agent', details: error.message },
            { status: 500 }
        );
    }
}
