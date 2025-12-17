import { db } from "@/db";
import { users, appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NewTicketForm } from "./form";

export default async function NewTicketPage() {
    // Check if new tickets are allowed
    const settingsRecord = await db.query.appSettings.findFirst({
        where: eq(appSettings.key, "allow_new_tickets"),
    });

    // Default to true if setting doesn't exist
    const allowNewTickets = settingsRecord ? settingsRecord.value === "true" : true;

    // Fetch all users for the watcher selector
    const allUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
    }).from(users);

    return <NewTicketForm availableUsers={allUsers} allowNewTickets={allowNewTickets} />;
}
