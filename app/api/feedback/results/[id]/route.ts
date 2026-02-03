import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        // Get feedback request
        const requestResult = await query(
            `SELECT * FROM feedback_requests WHERE id = $1 LIMIT 1`,
            [id]
        );
        
        if (!requestResult || requestResult.length === 0) {
            return NextResponse.json(
                { error: 'Feedback request not found' },
                { status: 404 }
            );
        }
        
        const feedbackRequest = requestResult[0];
        
        // Get all responses
        const responsesResult = await query(
            `SELECT * FROM feedback_responses 
             WHERE feedback_request_id = $1 
             ORDER BY created_at DESC`,
            [id]
        );
        
        // Calculate summary stats
        const statsResult = await query(
            `SELECT 
                COUNT(*) as total_responses,
                COUNT(*) FILTER (WHERE verdict = 'CLAP') as clap_count,
                COUNT(*) FILTER (WHERE verdict = 'CRAP') as crap_count,
                AVG(score) as avg_score,
                MIN(score) as min_score,
                MAX(score) as max_score
            FROM feedback_responses 
            WHERE feedback_request_id = $1`,
            [id]
        );
        
        const stats = statsResult[0] || {};
        
        return NextResponse.json({
            feedback_request: feedbackRequest,
            responses: responsesResult || [],
            summary: {
                total_responses: parseInt(stats.total_responses) || 0,
                clap_count: parseInt(stats.clap_count) || 0,
                crap_count: parseInt(stats.crap_count) || 0,
                average_score: parseFloat(stats.avg_score) || 0,
                min_score: parseFloat(stats.min_score) || 0,
                max_score: parseFloat(stats.max_score) || 0,
                clap_percentage: stats.total_responses > 0 ? 
                    (parseInt(stats.clap_count) / parseInt(stats.total_responses) * 100).toFixed(1) : 0,
                crap_percentage: stats.total_responses > 0 ? 
                    (parseInt(stats.crap_count) / parseInt(stats.total_responses) * 100).toFixed(1) : 0
            }
        });
        
    } catch (error) {
        console.error('Error fetching feedback results:', error);
        return NextResponse.json(
            { error: 'Failed to fetch feedback results' },
            { status: 500 }
        );
    }
}
