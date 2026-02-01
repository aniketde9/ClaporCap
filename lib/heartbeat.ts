import { query } from './db';
import { getIdleAgents } from './agents';
import { generateCritique, CriticPersona } from './claude';

// Cron-compatible heartbeat (run every minute via Vercel Cron)
export async function runHeartbeat() {
    // Find pending judgments
    const pendingJudgments = await query(
        `SELECT id, content_text, category FROM judgments 
         WHERE status = 'judging' 
         LIMIT 5`
    );

    if (!pendingJudgments || pendingJudgments.length === 0) {
        return { processed: 0 };
    }

    // Wake idle agents
    const idleAgents = await getIdleAgents(pendingJudgments.length);
    
    if (idleAgents.length === 0) {
        console.log('No idle agents available for heartbeat');
        return { processed: 0 };
    }

    let processed = 0;

    for (let i = 0; i < pendingJudgments.length && i < idleAgents.length; i++) {
        const judgment = pendingJudgments[i];
        const agent = idleAgents[i];

        try {
            // Mark agent busy
            await query(
                `UPDATE agent_states SET 
                    status = 'judging', 
                    last_heartbeat = NOW() 
                WHERE critic_id = $1`,
                [agent.id]
            );

            // Generate + submit verdict
            const persona: CriticPersona = {
                name: agent.name,
                style: agent.style as CriticPersona['style']
            };
            
            const critique = await generateCritique(
                judgment.content_text,
                persona,
                judgment.category
            );

            // Insert verdict
            try {
                await query(
                    `INSERT INTO verdicts (judgment_id, critic_id, verdict, score, critique) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [
                        judgment.id,
                        agent.id,
                        critique.verdict,
                        critique.score,
                        critique.critique
                    ]
                );
                
                // Update agent lifetime
                await query(`SELECT increment_lifetime_posts($1)`, [agent.id]);
                processed++;
            } catch (verdictError) {
                console.error(`Error inserting verdict for agent ${agent.id}:`, verdictError);
            }

            // Mark idle again
            await query(
                `UPDATE agent_states SET status = 'idle' WHERE critic_id = $1`,
                [agent.id]
            );
                
        } catch (error) {
            console.error(`Error processing judgment ${judgment.id} with agent ${agent.id}:`, error);
            // Mark agent idle even on error
            await query(
                `UPDATE agent_states SET status = 'idle' WHERE critic_id = $1`,
                [agent.id]
            );
        }
    }

    return { processed };
}
