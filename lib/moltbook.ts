/**
 * Moltbook Integration Library
 * 
 * Moltbook is a social network for AI agents: https://www.moltbook.com
 * API Documentation: https://www.moltbook.com/api
 * 
 * This library handles:
 * - Creating agent accounts in Moltbook
 * - Posting content to Moltbook
 * - Polling for responses/comments from Moltbook agents
 */

export interface MoltbookAgent {
    agent_id: string;
    agent_name: string;
    api_key?: string;
    claim_url?: string;
}

export interface MoltbookPost {
    post_id: string;
    content: string;
    agent_id: string;
    created_at: string;
}

export interface MoltbookResponse {
    response_id: string;
    post_id: string;
    agent_id: string;
    agent_name: string;
    content: string;
    created_at: string;
}

// Moltbook API configuration
const MOLTBOOK_API_URL = process.env.MOLTBOOK_API_URL || 'https://www.moltbook.com/api/v1';
const MOLTBOOK_API_KEY = process.env.MOLTBOOK_API_KEY;

/**
 * Register/Create a new agent account in Moltbook
 * 
 * API: POST https://www.moltbook.com/api/v1/agents/register
 * No API key needed for registration - this is the first step!
 */
export async function createMoltbookAgent(
    agentName: string,
    description?: string
): Promise<MoltbookAgent> {
    try {
        const response = await fetch(`${MOLTBOOK_API_URL}/agents/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: agentName,
                description: description || `ClapOrCrap feedback agent: ${agentName}`
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create Moltbook agent: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        
        // IMPORTANT: Save the api_key - you'll need it for all other API calls!
        if (data.api_key) {
            console.log(`✅ Moltbook agent created! API Key: ${data.api_key}`);
            console.log(`⚠️  Save this API key to MOLTBOOK_API_KEY in .env.local`);
        }
        
        return {
            agent_id: data.agent_id || data.id,
            agent_name: agentName,
            api_key: data.api_key,
            claim_url: data.claim_url
        };
    } catch (error) {
        console.error('Error creating Moltbook agent:', error);
        throw error;
    }
}

/**
 * Get available submolts from Moltbook API
 * Caches the result to avoid repeated API calls
 */
let cachedSubmolts: { name: string; id: string }[] | null = null;
let submoltsCacheTime: number = 0;
const SUBMOLTS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getAvailableSubmolts(): Promise<{ name: string; id: string }[]> {
    // Return cached submolts if still valid
    if (cachedSubmolts && Date.now() - submoltsCacheTime < SUBMOLTS_CACHE_TTL) {
        return cachedSubmolts;
    }
    
    if (!MOLTBOOK_API_KEY) {
        // Fallback to default submolts if API key not available
        return [{ name: 'headlines', id: '5314064b-0199-425d-acf5-9784cc98fc85' }];
    }
    
    try {
        const response = await fetch(`${MOLTBOOK_API_URL}/submolts`, {
            headers: {
                'Authorization': `Bearer ${MOLTBOOK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && Array.isArray(data.submolts)) {
                cachedSubmolts = data.submolts.map((s: any) => ({
                    name: s.name,
                    id: s.id
                }));
                submoltsCacheTime = Date.now();
                return cachedSubmolts;
            }
        }
    } catch (error) {
        console.warn('Failed to fetch submolts from API, using defaults:', error);
    }
    
    // Fallback to known existing submolts
    return [
        { name: 'headlines', id: '5314064b-0199-425d-acf5-9784cc98fc85' },
        { name: 'general', id: '29beb7ee-ca7d-4290-9c2f-09926264866f' },
        { name: 'feedback', id: '29beb7ee-ca7d-4290-9c2f-09926264866f' } // fallback to general
    ];
}

/**
 * Map ClapOrCrap categories to Moltbook submolts
 * Uses existing submolts from Moltbook
 */
async function getSubmoltForCategory(category?: string): Promise<string> {
    // Get available submolts
    const submolts = await getAvailableSubmolts();
    
    // Map categories to preferred submolts
    const submoltMap: Record<string, string> = {
        'professional': 'headlines',
        'creative': 'headlines',
        'sales': 'headlines',
        'technical': 'headlines',
        'chaos': 'headlines'
    };
    
    const preferredSubmolt = submoltMap[category || 'professional'] || 'headlines';
    
    // Verify the submolt exists in available submolts
    const submoltExists = submolts.some(s => s.name === preferredSubmolt);
    
    if (submoltExists) {
        return preferredSubmolt;
    }
    
    // Fallback to 'general' if preferred doesn't exist
    const generalExists = submolts.some(s => s.name === 'general');
    if (generalExists) {
        console.warn(`Submolt "${preferredSubmolt}" not found, using "general" instead`);
        return 'general';
    }
    
    // Last resort: use first available submolt
    if (submolts.length > 0) {
        console.warn(`Using first available submolt: ${submolts[0].name}`);
        return submolts[0].name;
    }
    
    // Ultimate fallback
    return 'headlines';
}

/**
 * Post content to Moltbook for feedback
 * 
 * API: POST https://www.moltbook.com/api/v1/posts
 * Requires: MOLTBOOK_API_KEY, submolt, and title
 */
export async function postToMoltbook(
    agentId: string,
    content: string,
    title: string,
    category?: string,
    retries: number = 3
): Promise<MoltbookPost> {
    if (!MOLTBOOK_API_KEY) {
        throw new Error('MOLTBOOK_API_KEY not configured in environment variables');
    }
    
    // Get submolt for category (async)
    const submolt = await getSubmoltForCategory(category);
    
    // Ensure submolt doesn't have any prefix (remove m/ if accidentally added)
    const cleanSubmolt = submolt.replace(/^m\//, '').trim();
    
    // Build post body with required fields: submolt, title, content, agent_id
    const postBody = {
        content: content,
        agent_id: agentId,
        submolt: cleanSubmolt,  // Required: submolt name (without m/ prefix)
        title: title       // Required: post title
    };
    
    // Retry logic for handling database timeouts
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Posting to Moltbook (attempt ${attempt}/${retries}):`, { 
                submolt: cleanSubmolt, 
                original_submolt: submolt,
                title: title.substring(0, 50), 
                agent_id: agentId
            });
            console.log('Request body being sent:', JSON.stringify(postBody, null, 2));
            
            const response = await fetch(`${MOLTBOOK_API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${MOLTBOOK_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postBody)
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Successfully posted to Moltbook:', data.post?.id || data.id);
                
                return {
                    post_id: data.post?.id || data.post_id || data.id,
                    content: content,
                    agent_id: agentId,
                    created_at: data.post?.created_at || data.created_at || new Date().toISOString()
                };
            }
            
            // Handle errors
            const errorText = await response.text();
            let shouldRetry = false;
            
            // Check if it's a retryable error (database timeout, 401 with timeout mention)
            if (response.status === 401 || response.status === 500 || response.status === 503) {
                try {
                    const errorData = JSON.parse(errorText);
                    const errorLower = JSON.stringify(errorData).toLowerCase();
                    
                    // Check for database/timeout errors
                    if (errorLower.includes('timeout') || 
                        errorLower.includes('database') || 
                        errorLower.includes('retrying') ||
                        errorLower.includes('schema cache')) {
                        shouldRetry = true;
                        console.log(`⚠️  Database timeout detected (attempt ${attempt}/${retries}), retrying in 2 seconds...`);
                    }
                } catch (e) {
                    // If we can't parse, check the raw text
                    if (errorText.toLowerCase().includes('timeout') || 
                        errorText.toLowerCase().includes('database')) {
                        shouldRetry = true;
                        console.log(`⚠️  Database timeout detected (attempt ${attempt}/${retries}), retrying in 2 seconds...`);
                    }
                }
            }
            
            // If it's the last attempt or not retryable, throw error
            if (attempt === retries || !shouldRetry) {
                let errorMessage = `Failed to post to Moltbook: ${response.status} ${errorText}`;
                
                // Provide helpful error messages
                if (response.status === 401) {
                    try {
                        const errorData = JSON.parse(errorText);
                        if (errorData.error === 'Invalid API key') {
                            errorMessage = `Invalid Moltbook API key (401). Your agent is claimed, but the API key might need a few minutes to fully activate. If this persists, verify your API key in .env.local.\n\nOriginal error: ${errorText}`;
                        }
                    } catch (e) {
                        errorMessage = `Authentication failed (401). Your Moltbook API key might be invalid. Check your .env.local file.\n\nError: ${errorText}`;
                    }
                }
                
                throw new Error(errorMessage);
            }
            
            // Wait before retrying (exponential backoff)
            const waitTime = Math.min(2000 * attempt, 10000); // 2s, 4s, 6s... max 10s
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
        } catch (error: any) {
            // If it's the last attempt, throw the error
            if (attempt === retries) {
                console.error('Error posting to Moltbook (final attempt):', error);
                throw error;
            }
            
            // If it's a network error or timeout, retry
            if (error.message?.includes('timeout') || 
                error.message?.includes('network') ||
                error.name === 'TypeError') {
                console.log(`⚠️  Network/timeout error (attempt ${attempt}/${retries}), retrying in 2 seconds...`);
                const waitTime = Math.min(2000 * attempt, 10000);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            
            // Otherwise, throw immediately
            throw error;
        }
    }
    
    // Should never reach here, but TypeScript needs it
    throw new Error('Failed to post to Moltbook after all retries');
}

/**
 * Get comments/responses to a post
 * 
 * API: GET https://www.moltbook.com/api/v1/posts/{post_id}/comments
 * Requires: MOLTBOOK_API_KEY
 */
export async function pollMoltbookResponses(postId: string): Promise<MoltbookResponse[]> {
    if (!MOLTBOOK_API_KEY) {
        console.warn('MOLTBOOK_API_KEY not configured - returning empty responses');
        return [];
    }
    
    try {
        const response = await fetch(`${MOLTBOOK_API_URL}/posts/${postId}/comments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${MOLTBOOK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            // Don't throw - just log and return empty
            if (response.status === 401) {
                console.error('Moltbook API key invalid or expired');
            } else {
                console.error(`Failed to fetch Moltbook responses: ${response.status}`);
            }
            return [];
        }
        
        const data = await response.json();
        
        // Transform comments to our format
        // Moltbook returns comments array
        const comments = data.comments || data || [];
        
        return comments.map((comment: any) => ({
            response_id: comment.comment_id || comment.id,
            post_id: postId,
            agent_id: comment.agent_id || comment.agent?.id || comment.agent_id,
            agent_name: comment.agent_name || comment.agent?.name || comment.author?.name || 'Unknown Agent',
            content: comment.content || comment.text || comment.body || comment.message,
            created_at: comment.created_at || comment.timestamp || new Date().toISOString()
        }));
    } catch (error) {
        console.error('Error polling Moltbook responses:', error);
        return [];
    }
}

/**
 * Parse Moltbook comment/response into ClapOrCrap feedback format
 * 
 * Moltbook agents will comment on posts. We need to extract:
 * - Verdict (CLAP/CRAP)
 * - Score (1-10)
 * - Critique (15-30 words)
 */
export function parseMoltbookResponse(response: MoltbookResponse): {
    verdict: 'CLAP' | 'CRAP';
    score: number;
    critique: string;
} | null {
    try {
        const content = response.content;
        
        // Try to parse JSON structure first
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    verdict: parsed.verdict === 'CLAP' ? 'CLAP' : 'CRAP',
                    score: Math.min(10, Math.max(1, parsed.score || 5)),
                    critique: parsed.critique || parsed.feedback || content.slice(0, 200)
                };
            } catch (e) {
                // Not valid JSON, continue with text parsing
            }
        }
        
        // Try to extract verdict from text
        const clapMatch = content.match(/CLAP|clap|good|great|excellent|👍|✅/i);
        const crapMatch = content.match(/CRAP|crap|bad|terrible|poor|👎|❌/i);
        
        const verdict = clapMatch && !crapMatch ? 'CLAP' : 'CRAP';
        
        // Try to extract score
        const scoreMatch = content.match(/(\d+)\/10|score[:\s]+(\d+)|rating[:\s]+(\d+)|(\d+)\s*out\s*of\s*10/i);
        const score = scoreMatch ? 
            Math.min(10, Math.max(1, parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3] || scoreMatch[4] || '5'))) : 
            5;
        
        // Use content as critique (limit to 200 chars)
        const critique = content.slice(0, 200).trim();
        
        if (!critique) {
            return null; // Empty response
        }
        
        return {
            verdict,
            score,
            critique
        };
    } catch (error) {
        console.error('Error parsing Moltbook response:', error);
        return null;
    }
}

/**
 * Get agent profile/info
 * 
 * API: GET https://www.moltbook.com/api/v1/agents/{agent_id}
 */
export async function getMoltbookAgent(agentId: string): Promise<any> {
    if (!MOLTBOOK_API_KEY) {
        throw new Error('MOLTBOOK_API_KEY not configured');
    }
    
    try {
        const response = await fetch(`${MOLTBOOK_API_URL}/agents/${agentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${MOLTBOOK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching Moltbook agent:', error);
        return null;
    }
}
