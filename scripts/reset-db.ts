import { db } from "../src/db/index.js";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function resetDatabase() {
    console.log("🔄 Conectando a la base de datos...");

    try {
        console.log("❌ Eliminando tabla 'ticket' (CASCADE)...");
        await db.execute(sql`DROP TABLE IF EXISTS "ticket" CASCADE`);

        console.log("✅ Recreando tabla 'ticket' con nueva estructura...");
        await db.execute(sql`
      CREATE TABLE "ticket" (
        "id" SERIAL PRIMARY KEY,
        "ticket_code" TEXT NOT NULL UNIQUE,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'open',
        "priority" TEXT NOT NULL,
        "created_by_id" TEXT NOT NULL REFERENCES "user"("id"),
        "assigned_to_id" TEXT REFERENCES "user"("id"),
        "category_id" INTEGER REFERENCES "category"("id"),
        "subcategory" TEXT,
        "area" TEXT DEFAULT 'No aplica',
        "campus" TEXT DEFAULT 'No aplica',
        "watchers" TEXT[],
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

        console.log("✅ Recreando tabla 'comment'...");
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "comment" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "content" TEXT NOT NULL,
        "ticket_id" INTEGER NOT NULL REFERENCES "ticket"("id") ON DELETE CASCADE,
        "user_id" TEXT NOT NULL REFERENCES "user"("id"),
        "is_internal" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

        console.log("✅ Recreando tabla 'ticket_view'...");
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "ticket_view" (
        "id" SERIAL PRIMARY KEY,
        "ticket_id" INTEGER NOT NULL REFERENCES "ticket"("id") ON DELETE CASCADE,
        "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "last_viewed_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE("user_id", "ticket_id")
      )
    `);

        console.log("✅ Base de datos reseteada exitosamente");
    } catch (error) {
        console.error("❌ Error al resetear la base de datos:", error);
        process.exit(1); // Exit with error code
    }

    process.exit(0); // Exit successfully
}

resetDatabase();
