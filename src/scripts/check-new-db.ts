import { db } from "../db/index";
import { attentionAreas, ticketCategories, users, tickets } from "../db/schema";
import { count } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function check() {
    console.log("Checking NEW DATABASE...");
    const areasCount = (await db.select({ value: count() }).from(attentionAreas))[0].value;
    const categoriesCount = (await db.select({ value: count() }).from(ticketCategories))[0].value;
    const usersCount = (await db.select({ value: count() }).from(users))[0].value;
    const ticketsCount = (await db.select({ value: count() }).from(tickets))[0].value;

    console.log(`Areas: ${areasCount}`);
    console.log(`Categories: ${categoriesCount}`);
    console.log(`Users: ${usersCount}`);
    console.log(`Tickets: ${ticketsCount}`);
}

check().catch(console.error).finally(() => process.exit(0));
