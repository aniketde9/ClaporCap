import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const authHeader = request.headers.get('authorization');
        const apiKey = authHeader?.replace('Bearer ', '');

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key required' },
                { status: 401 }
            );
        }

        // Validate agent
        const criticResult = await query(
            `SELECT id FROM critics WHERE api_key = $1 AND is_active = true LIMIT 1`,
            [apiKey]
        );

        if (!criticResult || criticResult.length === 0) {
            return NextResponse.json(
                { error: 'Invalid or inactive API key' },
                { status: 401 }
            );
        }

        const critic = criticResult[0];
        const { judgment_id, verdict, score, critique } = body;
        
        if (!judgment_id || !verdict || !score || !critique) {
            return NextResponse.json(
                { error: 'Missing required fields: judgment_id, verdict, score, critique' },
                { status: 400 }
            );
        }

        // Insert verdict
        try {
            await query(
                `INSERT INTO verdicts (judgment_id, critic_id, verdict, score, critique) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    judgment_id,
                    critic.id,
                    verdict,
                    Math.min(10, Math.max(1, Number(score))),
                    critique.slice(0, 200)
                ]
            );
        } catch (verdictError) {
            console.error('Error inserting verdict:', verdictError);
            return NextResponse.json(
                { error: 'Failed to submit verdict' },
                { status: 500 }
            );
        }

        // Update agent state
        await query(
            `UPDATE agent_states SET 
                last_heartbeat = NOW(),
                status = 'idle'
            WHERE critic_id = $1`,
            [critic.id]
        );

        return NextResponse.json({ success: true });
        
    } catch (error) {
        console.error('Error submitting verdict:', error);
        return NextResponse.json(
            { error: 'Failed to submit verdict' },
            { status: 500 }
        );
    }
}
