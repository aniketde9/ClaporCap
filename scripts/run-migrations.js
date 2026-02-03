const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const sql = neon(process.env.DATABASE_URL);

// Helper to split SQL into statements
function splitSQL(sqlText) {
    const statements = [];
    let current = '';
    let inString = false;
    let stringChar = null;
    let inComment = false;
    
    for (let i = 0; i < sqlText.length; i++) {
        const char = sqlText[i];
        const nextChar = sqlText[i + 1];
        
        // Handle comments
        if (!inString && char === '-' && nextChar === '-') {
            inComment = true;
            current += char;
            continue;
        }
        if (inComment && char === '\n') {
            inComment = false;
            current += char;
            continue;
        }
        if (inComment) {
            current += char;
            continue;
        }
        
        // Handle strings
        if ((char === "'" || char === '"') && !inString) {
            inString = true;
            stringChar = char;
            current += char;
            continue;
        }
        if (inString && char === stringChar && sqlText[i - 1] !== '\\') {
            inString = false;
            stringChar = null;
            current += char;
            continue;
        }
        
        current += char;
        
        // Check for statement end
        if (!inString && char === ';') {
            const trimmed = current.trim();
            if (trimmed && !trimmed.startsWith('--')) {
                statements.push(trimmed);
            }
            current = '';
        }
    }
    
    // Add remaining statement if any
    const trimmed = current.trim();
    if (trimmed && !trimmed.startsWith('--')) {
        statements.push(trimmed);
    }
    
    return statements.filter(s => s.length > 0);
}

async function runMigration(filePath) {
    console.log(`\n📄 Running migration: ${path.basename(filePath)}`);
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    try {
        const statements = splitSQL(sqlContent);
        
        for (const statement of statements) {
            if (statement.trim()) {
                // Use template literal with raw SQL
                // Need to use unsafe method or construct properly
                await sql(statement);
            }
        }
        
        console.log(`✅ Migration completed: ${path.basename(filePath)}`);
        return true;
    } catch (error) {
        console.error(`❌ Error running migration ${path.basename(filePath)}:`, error.message);
        // Check if it's a "already exists" error (which is OK)
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate') ||
            error.message.includes('IF NOT EXISTS')) {
            console.log(`⚠️  Object already exists - this is OK (using IF NOT EXISTS)`);
            return true;
        }
        throw error;
    }
}

async function main() {
    const migrations = [
        path.join(__dirname, '../supabase/migrations/002_feedback_system.sql'),
        path.join(__dirname, '../supabase/migrations/003_add_moltbook_agent_id.sql')
    ];
    
    console.log('🚀 Starting database migrations...\n');
    
    for (const migration of migrations) {
        await runMigration(migration);
    }
    
    console.log('\n✅ All migrations completed successfully!');
}

main().catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
});
