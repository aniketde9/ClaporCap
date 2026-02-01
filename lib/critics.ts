import { query } from './db';
import { Critic } from '@/types';

export async function getActiveCritics(limit: number = 10): Promise<Critic[]> {
    try {
        const result = await query(
            `SELECT * FROM critics 
             WHERE is_active = true 
             ORDER BY rank ASC 
             LIMIT $1`,
            [limit]
        );
        return (result || []) as Critic[];
    } catch (error) {
        console.error('Error fetching active critics:', error);
        return [];
    }
}

export async function getCriticById(id: string): Promise<Critic | null> {
    try {
        const result = await query(
            `SELECT * FROM critics WHERE id = $1 LIMIT 1`,
            [id]
        );
        return result && result.length > 0 ? (result[0] as Critic) : null;
    } catch (error) {
        console.error('Error fetching critic:', error);
        return null;
    }
}

export async function updateCriticStats(criticId: string) {
    // Stats are updated via trigger, but we can manually trigger recalculation
    const { query } = await import('./db');
    
    const verdicts = await query(
        `SELECT id, is_winner FROM verdicts WHERE critic_id = $1`,
        [criticId]
    );
    
    const total = verdicts?.length || 0;
    const wins = verdicts?.filter((v: any) => v.is_winner).length || 0;
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    
    await query(
        `UPDATE critics SET 
            total_judgments = $1, 
            wins = $2, 
            win_rate = $3, 
            updated_at = NOW()
        WHERE id = $4`,
        [total, wins, winRate, criticId]
    );
}

export async function registerNewCritic(
    agentId: string,
    name: string,
    style: string = 'Balanced',
    ownerProductUrl?: string,
    ownerProductTagline?: string
): Promise<{ critic_id: string; api_key: string } | null> {
    const { query } = await import('./db');
    const api_key = `coc_${crypto.randomUUID()}`;
    
    try {
        // Check if agent already exists
        const existing = await query(
            `SELECT id FROM critics WHERE agent_id = $1 LIMIT 1`,
            [agentId]
        );
        
        if (existing && existing.length > 0) {
            console.error('Agent already registered');
            return null;
        }
        
        const result = await query(
            `INSERT INTO critics (agent_id, name, style, owner_product_url, owner_product_tagline, api_key) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id`,
            [agentId, name, style, ownerProductUrl || null, ownerProductTagline || null, api_key]
        );
        
        if (!result || result.length === 0) {
            console.error('Error registering critic: No data returned');
            return null;
        }
        
        const criticId = result[0].id;
        
        // Create agent state
        await query(
            `INSERT INTO agent_states (critic_id, status) VALUES ($1, 'idle')`,
            [criticId]
        );
        
        return {
            critic_id: criticId,
            api_key
        };
    } catch (error) {
        console.error('Error registering critic:', error);
        return null;
    }
}
