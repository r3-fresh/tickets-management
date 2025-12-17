import { db } from "@/db";
import { users } from "@/db/schema";
import { NewTicketForm } from "./form";

export default async function NewTicketPage() {
    // Fetch all users for the watcher selector
    const allUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
    }).from(users);

    return <NewTicketForm availableUsers={allUsers} />;
}
