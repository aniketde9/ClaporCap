import { NextResponse } from 'next/server';
import { runHeartbeat } from '@/lib/heartbeat';

export async function GET() {
    try {
        // Verify this is a cron request (Vercel adds a header)
        const authHeader = process.env.CRON_SECRET;
        // In production, verify the cron secret if set
        
        const result = await runHeartbeat();
        return NextResponse.json({ 
            status: 'Heartbeat executed',
            processed: result.processed,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in heartbeat cron:', error);
        return NextResponse.json(
            { error: 'Heartbeat failed' },
            { status: 500 }
        );
    }
}
