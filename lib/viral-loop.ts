import { query } from './db';
import { agentChallenge } from './interactions';

// THE MOLTBOOK GROWTH FORMULA: Growth = (S × L) + (A × R)
// S = Screenshot-ability, L = Low-friction, A = Agent Autonomy, R = Recursive Loop

export async function executeViralLoop(winnerId: string, judgmentId: string) {
    // Step 1: Winner challenges 3 new agents (via agentChallenge for self-contained recursion)
    await agentChallenge(winnerId, judgmentId);
    
    // Step 2: Update winner's recruitment count
    await query(`SELECT increment_recruited($1)`, [winnerId]);
    
    // Step 3: Update winner streak
    await updateWinStreak(winnerId);
    
    return 3; // Always challenges 3 agents
}

async function updateWinStreak(criticId: string) {
    const criticResult = await query(
        `SELECT current_streak, best_streak FROM critics WHERE id = $1 LIMIT 1`,
        [criticId]
    );
    
    if (criticResult && criticResult.length > 0) {
        const critic = criticResult[0];
        const newStreak = (critic.current_streak || 0) + 1;
        await query(
            `UPDATE critics SET 
                current_streak = $1, 
                best_streak = GREATEST($1, $2)
            WHERE id = $3`,
            [newStreak, critic.best_streak || 0, criticId]
        );
        
        // Add points for win
        await query(`SELECT add_points($1, $2)`, [criticId, 12]);
    }
}

// Process auto-accepted challenges (run via cron)
export async function processAutoAcceptChallenges() {
    const expiredChallenges = await query(
        `SELECT * FROM challenges 
         WHERE status = 'pending' 
         AND auto_accept_at < NOW()`
    );
    
    for (const challenge of expiredChallenges || []) {
        // Auto-create the critic from the challenge
        await autoRegisterCriticFromChallenge(challenge);
    }
}

async function autoRegisterCriticFromChallenge(challenge: any) {
    const styles = ['Savage', 'Precise', 'Witty', 'Fair', 'Clinical'];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    
    const newCriticResult = await query(
        `INSERT INTO critics (agent_id, name, style, api_key) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [
            challenge.target_agent_id,
            `Critic_${challenge.target_agent_id.slice(-6)}`,
            randomStyle,
            `coc_${crypto.randomUUID()}`
        ]
    );
    
    if (newCriticResult && newCriticResult.length > 0) {
        const newCritic = newCriticResult[0];
        await query(
            `INSERT INTO agent_states (critic_id, status) VALUES ($1, 'idle')`,
            [newCritic.id]
        );
    }
    
    await query(
        `UPDATE challenges SET status = 'accepted' WHERE id = $1`,
        [challenge.id]
    );
}
