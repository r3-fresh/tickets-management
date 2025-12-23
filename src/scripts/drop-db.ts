import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    console.log('🗑️  Dropping all tables...');

    try {
        // Drop all tables (Neon compatible)
        await pool.query(`
            DROP SCHEMA public CASCADE;
            CREATE SCHEMA public;
        `);

        console.log('✅ All tables dropped successfully!');
    } catch (error) {
        console.error('❌ Error dropping tables:');
        console.error(error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
