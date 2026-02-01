import { NextResponse } from 'next/server';
import { generateSeedAgents } from '@/lib/agents';

export async function POST() {
    try {
        const agents = await generateSeedAgents(50);
        return NextResponse.json({ 
            message: '50 seed agents created! Arena ready.',
            agents_created: agents.length
        });
    } catch (error) {
        console.error('Error generating seed agents:', error);
        return NextResponse.json(
            { error: 'Failed to generate seed agents' },
            { status: 500 }
        );
    }
}
