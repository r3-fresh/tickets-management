import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    const db = drizzle(pool);

    console.log('Running migrations...');
    const migrationsFolder = path.resolve(process.cwd(), './drizzle');
    console.log('Migrations folder:', migrationsFolder);

    try {
        await migrate(db, { migrationsFolder });
        console.log('✅ Migrations completed!');
    } catch (error) {
        console.error('❌ Migration error:', error);
        throw error;
    }

    await pool.end();
}

main().catch((err) => {
    console.error('❌ Migration failed!');
    console.error(err);
    process.exit(1);
});
