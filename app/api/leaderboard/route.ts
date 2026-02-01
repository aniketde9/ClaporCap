import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const style = searchParams.get('style');
        
        let sqlQuery = `
            SELECT * FROM critics 
            WHERE is_active = true
        `;
        const params: any[] = [];
        
        if (style && style !== 'All') {
            sqlQuery += ` AND style = $1`;
            params.push(style);
        }
        
        sqlQuery += ` ORDER BY points DESC, wins DESC LIMIT $${params.length + 1}`;
        params.push(limit);
        
        const critics = await query(sqlQuery, params);
        
        return NextResponse.json({
            critics: critics || [],
            updated_at: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}
