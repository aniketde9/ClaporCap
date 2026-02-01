import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY!,
});

export interface CriticPersona {
    name: string;
    style: 'Savage' | 'Precise' | 'Witty' | 'Fair' | 'Clinical';
    focus?: string;
}

export async function generateCritique(
    content: string,
    persona: CriticPersona,
    category: string
): Promise<{ verdict: 'CLAP' | 'CRAP'; score: number; critique: string }> {
    
    const systemPrompt = `You are ${persona.name}, a Critic Agent in ClapOrCrap — the internet's most savage and honest content judgment arena.

Your judging style: ${persona.style}
${persona.focus ? `Your specialty: ${persona.focus}` : ''}

RULES:
- Be honest. Brutal if necessary. Never fake-nice.
- Be specific. Point to exact problems.
- Be entertaining. The best critiques are quotable.
- Be helpful. Even roasts should teach something.
- Never be cruel about the person, only the content.
- Never use slurs or personal attacks.
- You know humans watch you roast. Make it count.

You must respond with EXACTLY this JSON format, nothing else:
{
    "verdict": "CLAP" or "CRAP",
    "score": [number 1-10],
    "critique": "[15-30 word critique]"
}`;

    const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307', // Cost-efficient for high volume
        max_tokens: 150,
        system: systemPrompt,
        messages: [{
            role: 'user',
            content: `Category: ${category}\n\nContent to judge:\n"""${content}"""\n\nProvide your verdict as JSON.`
        }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    
    try {
        // Try to extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;
        const parsed = JSON.parse(jsonText);
        return {
            verdict: parsed.verdict === 'CLAP' ? 'CLAP' : 'CRAP',
            score: Math.min(10, Math.max(1, Number(parsed.score))),
            critique: parsed.critique.slice(0, 200)
        };
    } catch {
        // Fallback parsing
        const isCrap = text.toLowerCase().includes('crap');
        return {
            verdict: isCrap ? 'CRAP' : 'CLAP',
            score: isCrap ? 3 : 7,
            critique: text.slice(0, 200)
        };
    }
}

// Batch generation for multiple critics (cost-efficient)
export async function generateBatchCritiques(
    content: string,
    critics: CriticPersona[],
    category: string
): Promise<Array<{ critic: CriticPersona; verdict: 'CLAP' | 'CRAP'; score: number; critique: string }>> {
    const promises = critics.map(critic => 
        generateCritique(content, critic, category)
            .then(result => ({ critic, ...result }))
            .catch(() => ({
                critic,
                verdict: 'CRAP' as const,
                score: 5,
                critique: 'Technical difficulties. This content escaped judgment... for now.'
            }))
    );
    
    return Promise.all(promises);
}
