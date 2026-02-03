import { NextRequest, NextResponse } from 'next/server';
import { collectFeedbackFromMoltbook, expireFeedbackRequests } from '@/lib/feedback-collector';

/**
 * Cron endpoint to collect feedback from Moltbook
 * Configure in vercel.json to run every minute
 */
export async function GET(request: NextRequest) {
    try {
        // Verify this is a cron request (optional security)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        
        // Collect feedback from Moltbook
        const result = await collectFeedbackFromMoltbook();
        
        // Expire old requests
        await expireFeedbackRequests();
        
        return NextResponse.json({
            status: 'success',
            processed: result.processed || 0
        });
        
    } catch (error: any) {
        console.error('Error in feedback collection cron:', error);
        return NextResponse.json(
            { error: 'Failed to collect feedback', details: error.message },
            { status: 500 }
        );
    }
}
