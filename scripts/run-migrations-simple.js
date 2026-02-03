const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Parse DATABASE_URL to get connection info
function parseDatabaseUrl(url) {
    const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/);
    if (!match) throw new Error('Invalid DATABASE_URL');
    return {
        user: match[1],
        password: match[2],
        host: match[3],
        database: match[4]
    };
}

async function runMigration(filePath) {
    console.log(`\n📄 Running migration: ${path.basename(filePath)}`);
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // For NeonDB, we need to use their SQL API or provide instructions
    // Since we can't easily execute multi-statement SQL via HTTP,
    // let's provide the SQL to run manually or use a different approach
    
    console.log(`\n⚠️  For NeonDB, please run this migration manually:`);
    console.log(`\n1. Go to: https://console.neon.tech`);
    console.log(`2. Select your project`);
    console.log(`3. Go to SQL Editor`);
    console.log(`4. Paste and run the following SQL:\n`);
    console.log('─'.repeat(60));
    console.log(sqlContent);
    console.log('─'.repeat(60));
    
    return true;
}

async function main() {
    const migrations = [
        path.join(__dirname, '../supabase/migrations/002_feedback_system.sql'),
        path.join(__dirname, '../supabase/migrations/003_add_moltbook_agent_id.sql')
    ];
    
    console.log('🚀 Database Migration Instructions\n');
    console.log('Since NeonDB requires special handling, here are the migrations to run:\n');
    
    for (const migration of migrations) {
        await runMigration(migration);
    }
    
    console.log(`\n✅ Migration files prepared!`);
    console.log(`\nAlternatively, you can use the NeonDB web console to run these migrations.`);
}

main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});
