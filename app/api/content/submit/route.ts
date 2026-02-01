import { NextRequest, NextResponse } from 'next/server';
import { createJudgment } from '@/lib/judgments';
import { getActiveCritics } from '@/lib/critics';
import { generateBatchCritiques, CriticPersona } from '@/lib/claude';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { content_text, category = 'professional' } = body;
        
        if (!content_text || content_text.length < 10) {
            return NextResponse.json(
                { error: 'Content must be at least 10 characters' },
                { status: 400 }
            );
        }
        
        if (content_text.length > 5000) {
            return NextResponse.json(
                { error: 'Content must be under 5000 characters' },
                { status: 400 }
            );
        }
        
        // Create the judgment
        const judgment = await createJudgment(content_text, category);
        
        if (!judgment) {
            return NextResponse.json(
                { error: 'Failed to create judgment' },
                { status: 500 }
            );
        }
        
        // Get active critics (limit for cost efficiency with $5 budget)
        const critics = await getActiveCritics(10);
        
        // Generate verdicts asynchronously (don't block response)
        generateVerdictsAsync(judgment.id, content_text, category, critics);
        
        return NextResponse.json({
            judgment_id: judgment.id,
            status: 'judging',
            critics_judging: critics.length || 0,
            voting_ends_at: judgment.voting_ends_at,
            stream_url: `/api/judgments/stream?id=${judgment.id}`
        });
        
    } catch (error: any) {
        console.error('Error submitting content:', error);
        return NextResponse.json(
            { error: 'Failed to submit content' },
            { status: 500 }
        );
    }
}

async function generateVerdictsAsync(
    judgmentId: string,
    content: string,
    category: string,
    critics: any[]
) {
    const personas: CriticPersona[] = critics.map(c => ({
        name: c.name,
        style: c.style as CriticPersona['style']
    }));
    
    // If no critics yet, use seed personas
    if (personas.length === 0) {
        personas.push(
            { name: 'RoastMaster-47', style: 'Savage' },
            { name: 'TastePolice', style: 'Precise' },
            { name: 'CopyShark', style: 'Witty' },
            { name: 'SignalHunter', style: 'Fair' },
            { name: 'CleanCopy', style: 'Clinical' }
        );
    }
    
    try {
        const results = await generateBatchCritiques(content, personas, category);
        
        // Insert verdicts
        const { query } = await import('@/lib/db');
        for (const result of results) {
            const critic = critics.find(c => c.name === result.critic.name);
            
            await query(
                `INSERT INTO verdicts (judgment_id, critic_id, verdict, score, critique) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    judgmentId,
                    critic?.id || null,
                    result.verdict,
                    result.score,
                    result.critique
                ]
            );
        }
        
        // Calculate results
        const claps = results.filter(r => r.verdict === 'CLAP').length;
        const crapPercentage = ((results.length - claps) / results.length) * 100;
        const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
        
        // Update judgment
        await query(
            `UPDATE judgments SET 
                status = 'voting',
                voting_started_at = NOW(),
                clap_percentage = $1,
                crap_percentage = $2,
                average_score = $3,
                total_verdicts = $4,
                final_verdict = $5
            WHERE id = $6`,
            [
                100 - crapPercentage,
                crapPercentage,
                avgScore,
                results.length,
                crapPercentage >= 50 ? 'CRAP' : 'CLAP',
                judgmentId
            ]
        );
    } catch (error) {
        console.error('Error generating verdicts:', error);
    }
}
