import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createMoltbookAgent, postToMoltbook } from '@/lib/moltbook';
import { calculateEstimatedCost, convertToMinutes } from '@/lib/pricing';

const MOLTBOOK_API_KEY = process.env.MOLTBOOK_API_KEY;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { 
            user_agent_id, 
            content_text,
            title,
            category = 'professional',
            duration,
            duration_unit = 'minutes' // 'minutes' | 'hours' | 'days'
        } = body;
        
        if (!user_agent_id || !content_text || !duration) {
            return NextResponse.json(
                { error: 'Missing required fields: user_agent_id, content_text, duration' },
                { status: 400 }
            );
        }
        
        if (content_text.length < 10 || content_text.length > 5000) {
            return NextResponse.json(
                { error: 'Content must be between 10 and 5000 characters' },
                { status: 400 }
            );
        }
        
        // Convert duration to minutes
        const durationMinutes = convertToMinutes(duration, duration_unit);
        
        // Calculate estimated cost
        const estimatedCost = calculateEstimatedCost(durationMinutes);
        
        // Calculate end time
        const collectionEndsAt = new Date(Date.now() + durationMinutes * 60 * 1000);
        
        // Get or create Moltbook agent for this user's agent
        const userAgentResult = await query(
            `SELECT id, name, agent_id, moltbook_agent_id FROM critics WHERE id = $1 LIMIT 1`,
            [user_agent_id]
        );
        
        if (!userAgentResult || userAgentResult.length === 0) {
            return NextResponse.json(
                { error: 'User agent not found' },
                { status: 404 }
            );
        }
        
        const userAgent = userAgentResult[0];
        
        // Use existing Moltbook agent ID, or fall back to agent_id (which should be the Moltbook agent_id)
        // If neither exists, only then create a new Moltbook agent
        let moltbookAgentId = userAgent.moltbook_agent_id || userAgent.agent_id;
        
        if (!moltbookAgentId) {
            // Only create a new Moltbook agent if we truly don't have one
            try {
                const moltbookAgent = await createMoltbookAgent(
                    userAgent.name || 'ClapOrCrap Agent',
                    `ClapOrCrap feedback agent for ${userAgent.name}`
                );
                moltbookAgentId = moltbookAgent.agent_id;
                
                // Store Moltbook agent ID
                await query(
                    `UPDATE critics SET moltbook_agent_id = $1 WHERE id = $2`,
                    [moltbookAgentId, user_agent_id]
                );
                
                // If we got an API key from registration, log it (user should add to .env)
                if (moltbookAgent.api_key && !MOLTBOOK_API_KEY) {
                    console.warn(`⚠️  Moltbook API key received: ${moltbookAgent.api_key}`);
                    console.warn(`⚠️  Add this to .env.local as MOLTBOOK_API_KEY`);
                }
            } catch (error: any) {
                console.error('Error creating Moltbook agent:', error);
                return NextResponse.json(
                    { error: 'Failed to create or find Moltbook agent. Please ensure your agent has a Moltbook agent_id.', details: error.message },
                    { status: 500 }
                );
            }
        } else {
            // If we're using agent_id as fallback, also update moltbook_agent_id for future use
            if (!userAgent.moltbook_agent_id && userAgent.agent_id) {
                await query(
                    `UPDATE critics SET moltbook_agent_id = $1 WHERE id = $2`,
                    [userAgent.agent_id, user_agent_id]
                );
            }
        }
        
        // Post content to Moltbook
        // Use a default title if not provided (should come from form)
        const postTitle = body.title || 'Please critique and give feedback on this content';
        const moltbookPost = await postToMoltbook(moltbookAgentId, content_text, postTitle, category);
        
        // Create feedback request
        const feedbackRequestResult = await query(
            `INSERT INTO feedback_requests (
                user_agent_id, content_text, category,
                moltbook_post_id, moltbook_agent_id,
                collection_duration_minutes, collection_ends_at,
                estimated_cost, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [
                user_agent_id,
                content_text,
                category,
                moltbookPost.post_id,
                moltbookAgentId,
                durationMinutes,
                collectionEndsAt.toISOString(),
                estimatedCost,
                'collecting'
            ]
        );
        
        const feedbackRequest = feedbackRequestResult[0];
        
        // Start background polling for responses (will be handled by cron or background job)
        
        return NextResponse.json({
            feedback_request_id: feedbackRequest.id,
            estimated_cost: estimatedCost,
            collection_ends_at: collectionEndsAt.toISOString(),
            duration_minutes: durationMinutes,
            stream_url: `/api/feedback/stream/${feedbackRequest.id}`,
            results_url: `/api/feedback/results/${feedbackRequest.id}`
        });
        
    } catch (error: any) {
        console.error('Error creating feedback request:', error);
        return NextResponse.json(
            { error: 'Failed to create feedback request', details: error.message },
            { status: 500 }
        );
    }
}
