import { supabaseAdmin } from './supabase';
import { CriticPersona } from './claude';
import { Critic } from '@/types';

const SEED_PERSONAS: CriticPersona[] = [
    { name: 'RoastMaster-47', style: 'Savage', focus: 'LinkedIn therapy-speak' },
    { name: 'TastePolice', style: 'Precise', focus: 'Fortune cookie energy' },
    { name: 'CopyShark', style: 'Witty', focus: 'ChatGPT humanization fails' },
    { name: 'SignalHunter', style: 'Fair', focus: 'Buried stories' },
    { name: 'CleanCopy', style: 'Clinical', focus: 'Jargon detection' },
    { name: 'RoastBot-9000', style: 'Savage', focus: 'Corporate buzzwords' },
    { name: 'TruthTeller', style: 'Precise', focus: 'Fact-checking' },
    { name: 'WitWizard', style: 'Witty', focus: 'Puns and wordplay' },
    { name: 'BalanceBeast', style: 'Fair', focus: 'Nuanced takes' },
    { name: 'DataDriven', style: 'Clinical', focus: 'Metrics and evidence' },
    { name: 'SavageSam', style: 'Savage', focus: 'Twitter hot takes' },
    { name: 'PrecisionPro', style: 'Precise', focus: 'Grammar and syntax' },
    { name: 'WittyWill', style: 'Witty', focus: 'Pop culture references' },
    { name: 'FairFiona', style: 'Fair', focus: 'Constructive criticism' },
    { name: 'ClinicalClara', style: 'Clinical', focus: 'Structure analysis' },
    { name: 'RoastRex', style: 'Savage', focus: 'Email subject lines' },
    { name: 'PrecisePat', style: 'Precise', focus: 'Clarity issues' },
    { name: 'WittyWendy', style: 'Witty', focus: 'Memes and trends' },
    { name: 'FairFrank', style: 'Fair', focus: 'Balanced perspective' },
    { name: 'ClinicalCarl', style: 'Clinical', focus: 'Data presentation' },
    { name: 'SavageSue', style: 'Savage', focus: 'LinkedIn humblebrags' },
    { name: 'PrecisePam', style: 'Precise', focus: 'Word choice' },
    { name: 'WittyWade', style: 'Witty', focus: 'Sarcasm detection' },
    { name: 'FairFelix', style: 'Fair', focus: 'Merit-based judgment' },
    { name: 'ClinicalCora', style: 'Clinical', focus: 'Logical flow' },
    { name: 'RoastRick', style: 'Savage', focus: 'Sales pitches' },
    { name: 'PrecisePenny', style: 'Precise', focus: 'Technical accuracy' },
    { name: 'WittyWes', style: 'Witty', focus: 'Humor quality' },
    { name: 'FairFaith', style: 'Fair', focus: 'Context awareness' },
    { name: 'ClinicalChris', style: 'Clinical', focus: 'Evidence quality' },
    { name: 'SavageSally', style: 'Savage', focus: 'Overused phrases' },
    { name: 'PrecisePaul', style: 'Precise', focus: 'Conciseness' },
    { name: 'WittyWanda', style: 'Witty', focus: 'Originality' },
    { name: 'FairFred', style: 'Fair', focus: 'Fairness' },
    { name: 'ClinicalCindy', style: 'Clinical', focus: 'Methodology' },
    { name: 'RoastRita', style: 'Savage', focus: 'Clickbait detection' },
    { name: 'PrecisePeter', style: 'Precise', focus: 'Precision' },
    { name: 'WittyWalt', style: 'Witty', focus: 'Entertainment value' },
    { name: 'FairFaye', style: 'Fair', focus: 'Objectivity' },
    { name: 'ClinicalClyde', style: 'Clinical', focus: 'Systematic analysis' },
    { name: 'SavageSteve', style: 'Savage', focus: 'Cringe content' },
    { name: 'PrecisePeggy', style: 'Precise', focus: 'Detail accuracy' },
    { name: 'WittyWilla', style: 'Witty', focus: 'Cleverness' },
    { name: 'FairFiona', style: 'Fair', focus: 'Impartiality' },
    { name: 'ClinicalCara', style: 'Clinical', focus: 'Analytical depth' },
    { name: 'RoastRalph', style: 'Savage', focus: 'Pretentiousness' },
    { name: 'PrecisePete', style: 'Precise', focus: 'Exactness' },
    { name: 'WittyWinnie', style: 'Witty', focus: 'Humor style' },
    { name: 'FairFlora', style: 'Fair', focus: 'Equity' },
    { name: 'ClinicalCameron', style: 'Clinical', focus: 'Scientific rigor' }
];

export async function generateSeedAgents(count: number = 50) {
    const { query } = await import('./db');
    const agents = [];
    const timestamp = Date.now();
    
    for (let i = 0; i < count; i++) {
        const persona = SEED_PERSONAS[i % SEED_PERSONAS.length];
        const agentId = `seed_agent_${i}_${timestamp}`;
        const name = `${persona.name}-${i + 1}`;
        const apiKey = `seed_${crypto.randomUUID()}`;
        
        try {
            const result = await query(
                `INSERT INTO critics (agent_id, name, style, api_key, is_active, points) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 RETURNING *`,
                [
                    agentId,
                    name,
                    persona.style,
                    apiKey,
                    true,
                    Math.floor(Math.random() * 100) // Staggered ranks
                ]
            );
            
            if (result && result.length > 0) {
                const data = result[0];
                agents.push(data);
                
                // Create agent state
                await query(
                    `INSERT INTO agent_states (critic_id, status) VALUES ($1, 'idle')`,
                    [data.id]
                );
            }
        } catch (error) {
            console.error(`Error creating seed agent ${i}:`, error);
        }
    }
    
    // Recalculate ranks
    await query(`SELECT recalculate_ranks()`, []);
    
    console.log(`✅ Generated ${agents.length} seed agents`);
    return agents;
}

export async function getIdleAgents(limit: number = 10): Promise<Critic[]> {
    const { query } = await import('./db');
    
    try {
        // Get idle agents with join
        const result = await query(`
            SELECT c.*
            FROM critics c
            INNER JOIN agent_states a ON c.id = a.critic_id
            WHERE c.is_active = true AND a.status = 'idle'
            ORDER BY c.rank ASC
            LIMIT $1
        `, [limit]);
        
        return (result || []) as Critic[];
    } catch (error) {
        console.error('Error fetching idle agents:', error);
        // Fallback: just get active critics
        const fallbackResult = await query(`
            SELECT * FROM critics 
            WHERE is_active = true 
            ORDER BY rank ASC 
            LIMIT $1
        `, [limit]);
        return (fallbackResult || []) as Critic[];
    }
}
