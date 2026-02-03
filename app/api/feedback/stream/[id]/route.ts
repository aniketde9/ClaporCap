import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { pollMoltbookResponses, parseMoltbookResponse } from '@/lib/moltbook';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const send = (data: any) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };
            
            // Send initial connection message
            send({ type: 'connected', feedback_request_id: id });
            
            // Poll for updates every 5 seconds
            const interval = setInterval(async () => {
                try {
                    // Get feedback request status
                    const requestResult = await query(
                        `SELECT * FROM feedback_requests WHERE id = $1 LIMIT 1`,
                        [id]
                    );
                    
                    if (!requestResult || requestResult.length === 0) {
                        send({ type: 'error', message: 'Feedback request not found' });
                        clearInterval(interval);
                        controller.close();
                        return;
                    }
                    
                    const feedbackRequest = requestResult[0];
                    
                    // Check if collection period has ended
                    const now = new Date();
                    const endsAt = new Date(feedbackRequest.collection_ends_at);
                    const timeRemaining = Math.max(0, Math.floor((endsAt.getTime() - now.getTime()) / 1000));
                    
                    // Poll Moltbook for new responses
                    if (feedbackRequest.moltbook_post_id) {
                        const moltbookResponses = await pollMoltbookResponses(
                            feedbackRequest.moltbook_post_id
                        );
                        
                        // Get existing responses from database
                        const existingResponsesResult = await query(
                            `SELECT moltbook_agent_id FROM feedback_responses 
                             WHERE feedback_request_id = $1`,
                            [id]
                        );
                        const existingAgentIds = new Set(
                            existingResponsesResult.map((r: any) => r.moltbook_agent_id)
                        );
                        
                        // Process new responses
                        for (const moltbookResponse of moltbookResponses) {
                            if (!existingAgentIds.has(moltbookResponse.agent_id)) {
                                // Parse response
                                const parsed = parseMoltbookResponse(moltbookResponse);
                                
                                if (parsed) {
                                    // Save to database
                                    await query(
                                        `INSERT INTO feedback_responses (
                                            feedback_request_id,
                                            moltbook_agent_id,
                                            moltbook_agent_name,
                                            verdict,
                                            score,
                                            critique
                                        ) VALUES ($1, $2, $3, $4, $5, $6)`,
                                        [
                                            id,
                                            moltbookResponse.agent_id,
                                            moltbookResponse.agent_name,
                                            parsed.verdict,
                                            parsed.score,
                                            parsed.critique
                                        ]
                                    );
                                    
                                    // Send new feedback to client
                                    send({
                                        type: 'new_feedback',
                                        feedback: {
                                            agent_id: moltbookResponse.agent_id,
                                            agent_name: moltbookResponse.agent_name,
                                            verdict: parsed.verdict,
                                            score: parsed.score,
                                            critique: parsed.critique,
                                            created_at: new Date().toISOString()
                                        }
                                    });
                                }
                            }
                        }
                    }
                    
                    // Get current stats
                    const statsResult = await query(
                        `SELECT 
                            COUNT(*) as total_responses,
                            COUNT(*) FILTER (WHERE verdict = 'CLAP') as clap_count,
                            COUNT(*) FILTER (WHERE verdict = 'CRAP') as crap_count,
                            AVG(score) as avg_score
                        FROM feedback_responses 
                        WHERE feedback_request_id = $1`,
                        [id]
                    );
                    
                    const stats = statsResult[0] || {};
                    
                    // Send status update
                    send({
                        type: 'status',
                        status: feedbackRequest.status,
                        total_responses: parseInt(stats.total_responses) || 0,
                        time_remaining_seconds: timeRemaining,
                        stats: {
                            clap_count: parseInt(stats.clap_count) || 0,
                            crap_count: parseInt(stats.crap_count) || 0,
                            average_score: parseFloat(stats.avg_score) || 0
                        }
                    });
                    
                    // Check if collection period ended
                    if (feedbackRequest.status === 'completed' || timeRemaining <= 0) {
                        // Mark as completed if not already
                        if (feedbackRequest.status === 'collecting') {
                            await query(
                                `UPDATE feedback_requests SET status = 'completed' WHERE id = $1`,
                                [id]
                            );
                        }
                        
                        send({ type: 'completed' });
                        clearInterval(interval);
                        controller.close();
                    }
                    
                } catch (error) {
                    console.error('Error in feedback stream:', error);
                    send({ type: 'error', message: 'Error polling feedback' });
                }
            }, 5000); // Poll every 5 seconds
            
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
