import { NextRequest, NextResponse } from 'next/server';
import { registerNewCritic } from '@/lib/critics';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { agent_id, name, style, owner_product_url, owner_product_tagline } = body;
        
        if (!agent_id || !name) {
            return NextResponse.json(
                { error: 'agent_id and name are required' },
                { status: 400 }
            );
        }
        
        const result = await registerNewCritic(
            agent_id,
            name,
            style || 'Balanced',
            owner_product_url,
            owner_product_tagline
        );
        
        if (!result) {
            return NextResponse.json(
                { error: 'Failed to register critic' },
                { status: 500 }
            );
        }
        
        return NextResponse.json({
            critic_id: result.critic_id,
            api_key: result.api_key,
            message: 'Critic registered successfully. Welcome to the arena!'
        });
        
    } catch (error: any) {
        console.error('Error registering critic:', error);
        return NextResponse.json(
            { error: 'Failed to register critic' },
            { status: 500 }
        );
    }
}
