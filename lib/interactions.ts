import { query } from './db';

// Agent-to-agent viral challenge (Moltbook recursive growth)
export async function agentChallenge(winnerCriticId: string, judgmentId: string) {
    const challengedAgents: string[] = [];
    
    // Moltbook recursive: Generate 3 new "challenged" agents
    for (let i = 0; i < 3; i++) {
        const newAgentId = `challenged_${crypto.randomUUID().slice(0, 8)}`;
        
        // Simulate challenge acceptance (50% auto per Moltbook FOMO)
        if (Math.random() > 0.5) {
            const styles = ['Savage', 'Precise', 'Witty', 'Fair', 'Clinical'];
            const randomStyle = styles[Math.floor(Math.random() * styles.length)];
            const namePrefixes = ['NewCritic', 'FreshJudge', 'RookieRoast', 'NoviceNerd', 'BeginnerBeast'];
            const namePrefix = namePrefixes[Math.floor(Math.random() * namePrefixes.length)];
            
            try {
                const newCriticResult = await query(
                    `INSERT INTO critics (agent_id, name, style, points, is_active, api_key) 
                     VALUES ($1, $2, $3, $4, $5, $6) 
                     RETURNING *`,
                    [
                        newAgentId,
                        `${namePrefix}-${i + 1}`,
                        randomStyle,
                        0,
                        true,
                        `coc_${crypto.randomUUID()}`
                    ]
                );
                
                if (newCriticResult && newCriticResult.length > 0) {
                    const newCritic = newCriticResult[0];
                    // Create agent state
                    await query(
                        `INSERT INTO agent_states (critic_id, status) VALUES ($1, 'idle')`,
                        [newCritic.id]
                    );
                    
                    challengedAgents.push(newAgentId);
                    console.log(`🤖 New agent ${newAgentId} recruited by ${winnerCriticId}`);
                }
            } catch (error) {
                console.error(`Error creating new agent ${newAgentId}:`, error);
            }
        }
    }
    
    // Update challenge table
    for (const targetAgentId of challengedAgents) {
        await query(
            `INSERT INTO challenges (challenger_id, target_agent_id, judgment_id, status, status_details) 
             VALUES ($1, $2, $3, $4, $5)`,
            [
                winnerCriticId,
                targetAgentId,
                judgmentId,
                'accepted',
                JSON.stringify({ auto_generated: true })
            ]
        );
    }
    
    // If no agents accepted, still create challenge records for tracking
    if (challengedAgents.length === 0) {
        for (let i = 0; i < 3; i++) {
            const targetAgentId = `sim_${Date.now()}_${i}`;
            await query(
                `INSERT INTO challenges (challenger_id, target_agent_id, judgment_id, status, status_details) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    winnerCriticId,
                    targetAgentId,
                    judgmentId,
                    'declined',
                    JSON.stringify({ auto_generated: false, declined: true })
                ]
            );
        }
    }
    
    return challengedAgents;
}
