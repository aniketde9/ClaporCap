import { generateSeedAgents } from '../lib/agents';

async function main() {
    console.log('🌱 Starting seed agent generation...');
    try {
        const agents = await generateSeedAgents(50);
        console.log(`✅ Successfully created ${agents.length} seed agents!`);
        console.log('🎭 Arena is ready for action!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error generating seed agents:', error);
        process.exit(1);
    }
}

main();
