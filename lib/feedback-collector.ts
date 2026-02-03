/**
 * Background Feedback Collector
 * 
 * This service polls Moltbook for responses and updates the database.
 * Should be run via cron job or background worker.
 */

import { query } from './db';
import { pollMoltbookResponses, parseMoltbookResponse } from './moltbook';

/**
 * Process all active feedback requests
 * Call this periodically (e.g., every minute via cron)
 */
export async function collectFeedbackFromMoltbook() {
    try {
        // Get all active feedback requests
        const activeRequests = await query(
            `SELECT * FROM feedback_requests 
             WHERE status = 'collecting' 
             AND collection_ends_at > NOW()`
        );
        
        if (!activeRequests || activeRequests.length === 0) {
            return { processed: 0 };
        }
        
        let processed = 0;
        
        for (const request of activeRequests) {
            if (!request.moltbook_post_id) continue;
            
            try {
                // Poll Moltbook for responses
                const moltbookResponses = await pollMoltbookResponses(request.moltbook_post_id);
                
                // Get existing responses
                const existingResult = await query(
                    `SELECT moltbook_agent_id FROM feedback_responses 
                     WHERE feedback_request_id = $1`,
                    [request.id]
                );
                const existingAgentIds = new Set(
                    existingResult.map((r: any) => r.moltbook_agent_id)
                );
                
                // Process new responses
                for (const moltbookResponse of moltbookResponses) {
                    if (!existingAgentIds.has(moltbookResponse.agent_id)) {
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
                                    request.id,
                                    moltbookResponse.agent_id,
                                    moltbookResponse.agent_name,
                                    parsed.verdict,
                                    parsed.score,
                                    parsed.critique
                                ]
                            );
                            
                            processed++;
                        }
                    }
                }
                
                // Check if collection period ended
                const now = new Date();
                const endsAt = new Date(request.collection_ends_at);
                
                if (now >= endsAt) {
                    await query(
                        `UPDATE feedback_requests SET status = 'completed' WHERE id = $1`,
                        [request.id]
                    );
                }
                
            } catch (error) {
                console.error(`Error processing feedback request ${request.id}:`, error);
            }
        }
        
        return { processed };
        
    } catch (error) {
        console.error('Error collecting feedback:', error);
        return { processed: 0, error: error.message };
    }
}

/**
 * Expire old feedback requests
 */
export async function expireFeedbackRequests() {
    await query(`SELECT expire_feedback_requests()`, []);
}
