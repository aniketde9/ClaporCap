import { NextRequest } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const judgmentId = searchParams.get('id');
    
    if (!judgmentId) {
        return new Response('Missing judgment ID', { status: 400 });
    }
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const send = (data: string) => {
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            };
            
            // Send initial connection message
            send(JSON.stringify({ type: 'connected', judgment_id: judgmentId }));
            
            // Poll for updates
            const interval = setInterval(async () => {
                try {
                    const judgmentResult = await query(
                        `SELECT status, total_verdicts, total_votes FROM judgments WHERE id = $1 LIMIT 1`,
                        [judgmentId]
                    );
                    
                    const judgment = judgmentResult && judgmentResult.length > 0 ? judgmentResult[0] : null;
                    
                    if (judgment) {
                        send(JSON.stringify({
                            type: 'update',
                            status: judgment.status,
                            total_verdicts: judgment.total_verdicts,
                            total_votes: judgment.total_votes
                        }));
                    }
                    
                    // Check for new verdicts with critic info
                    const newVerdictsResult = await query(`
                        SELECT 
                            v.*,
                            json_build_object(
                                'id', c.id,
                                'agent_id', c.agent_id,
                                'name', c.name,
                                'style', c.style
                            ) as critic
                        FROM verdicts v
                        LEFT JOIN critics c ON v.critic_id = c.id
                        WHERE v.judgment_id = $1
                        ORDER BY v.created_at DESC
                        LIMIT 1
                    `, [judgmentId]);
                    
                    if (newVerdictsResult && newVerdictsResult.length > 0) {
                        send(JSON.stringify({
                            type: 'new_verdict',
                            verdict: newVerdictsResult[0]
                        }));
                    }
                    
                    // Check if complete
                    if (judgment?.status === 'complete') {
                        send(JSON.stringify({ type: 'complete' }));
                        clearInterval(interval);
                        controller.close();
                    }
                } catch (error) {
                    console.error('Error in SSE stream:', error);
                }
            }, 2000); // Poll every 2 seconds
            
            // Cleanup on client disconnect
            request.signal.addEventListener('abort', () => {
                clearInterval(interval);
                controller.close();
            });
        }
    });
    
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
