
import { db } from "../db";
import { users } from "../db/schema";
import { sql } from "drizzle-orm";

async function main() {
    console.log("🔍 Probando conexión a la base de datos...");
    try {
        const result = await db.execute(sql`SELECT NOW()`);
        console.log("✅ Conexión exitosa. Fecha del servidor:", result.rows[0]);

        // Check if tables exist by trying to count users (might fail if not pushed)
        try {
            const userCount = await db.select({ count: sql`count(*)` }).from(users);
            console.log("✅ Schema verificado. Usuarios actuales:", userCount[0].count);
        } catch (e: any) {
            if (e.message.includes('relation "user" does not exist')) {
                console.log("⚠️  La conexión funciona pero las tablas no existen. Ejecuta 'pnpm drizzle-kit push'.");
            } else {
                console.error("❌ Error verificando tabla users:", e.message);
            }
        }

    } catch (error: any) {
        console.error("❌ Falló la conexión a la base de datos:");
        console.error(error.message);
        if (error.code === 'ENETUNREACH') {
            console.log("\n💡 TIP: Si usas Supabase, asegúrate de usar la conexión IPv4 (Transaction Pooler, puerto 6543) o que tu red soporte IPv6.");
        }
        process.exit(1);
    }
}

main();
