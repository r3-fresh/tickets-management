import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
    console.log("OLD_URL:", process.env.OLD_DATABASE_URL ? "Exists" : "Missing");
    const pool = new Pool({ connectionString: process.env.OLD_DATABASE_URL });
    try {
        const { rows: areas } = await pool.query("SELECT * FROM attention_area");
        console.log("AREAS:", areas.length);

        const { rows: categories } = await pool.query("SELECT * FROM ticket_category");
        console.log("CATEGORIES:", categories.length);

        const { rows: subcategories } = await pool.query("SELECT * FROM ticket_subcategory");
        console.log("SUBCATEGORIES:", subcategories.length);

        const { rows: users } = await pool.query("SELECT email, role FROM \"user\" WHERE email IN ('cendoc@continental.edu.pe', 'fromeror@continental.edu.pe')");
        console.log("USERS:", users);

        const { rows: ticketsCount } = await pool.query("SELECT COUNT(*) FROM ticket");
        console.log("TICKETS COUNT:", ticketsCount[0].count);

    } catch (e) {
        console.error("Error querying old DB:", e);
    } finally {
        await pool.end();
    }
}
main();
