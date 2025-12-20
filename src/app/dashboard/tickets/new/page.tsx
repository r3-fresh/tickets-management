import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { NewTicketForm } from "./form";
import { getActiveCategories, getActiveCampuses, getActiveWorkAreas } from "@/app/actions/config/get-config";

async function getAppSetting(key: string): Promise<string | null> {
    try {
        const { appSettings } = await import("@/db/schema");
        const setting = await db.select().from(appSettings).where(eq(appSettings.key, key)).limit(1);
        return setting[0]?.value || null;
    } catch {
        return null;
    }
}

export default async function NewTicketPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    // Fetch all users for watchers
    const availableUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image
    }).from(users);

    // Check if new tickets are allowed
    const allowNewTickets = (await getAppSetting("allow_new_tickets")) !== "false";

    // Fetch configuration data
    const categories = await getActiveCategories();
    const campuses = await getActiveCampuses();
    const workAreas = await getActiveWorkAreas();

    // Fetch custom disabled message
    const disabledTitle = await getAppSetting("ticket_disabled_title");
    const disabledMessage = await getAppSetting("ticket_disabled_message");

    return (
        <NewTicketForm
            availableUsers={availableUsers}
            allowNewTickets={allowNewTickets}
            categories={categories}
            campuses={campuses}
            workAreas={workAreas}
            disabledTitle={disabledTitle}
            disabledMessage={disabledMessage}
        />
    );
}
