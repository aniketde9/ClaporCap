import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
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
        
        // Get pending judgment
        const pendingResult = await query(
            `SELECT id, content_text, category FROM judgments 
             WHERE status = 'judging' 
             LIMIT 1`,
            []
        );
        
        if (!pendingResult || pendingResult.length === 0) {
            return NextResponse.json(
                { message: 'No pending judgments' },
                { status: 200 }
            );
        }
        
        return NextResponse.json(pendingResult[0]);
        
    } catch (error) {
        console.error('Error fetching pending judgment:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pending judgment' },
            { status: 500 }
        );
    }
}
