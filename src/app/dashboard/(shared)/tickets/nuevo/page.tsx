import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";
import dynamic from "next/dynamic";
import { getActiveCategories, getActiveCampuses, getActiveWorkAreas, getActiveAttentionAreas } from "@/actions/config/get-config";

const NewTicketForm = dynamic(
    () => import("./form").then(mod => ({ default: mod.NewTicketForm })),
    {
        loading: () => <div className="h-96 animate-pulse rounded-lg bg-muted" />,
    }
);

async function getAppSetting(key: string): Promise<string | null> {
    try {
        const { appSettings } = await import("@/db/schema");
        const setting = await db.select().from(appSettings).where(eq(appSettings.key, key)).limit(1);
        return setting[0]?.value || null;
    } catch {
        return null;
    }
}

export default async function NuevoTicketPage() {
    const session = await requireAuth();

    // All queries are independent after session — run in parallel
    const [
        availableUsers,
        allowNewTicketsSetting,
        categories,
        campuses,
        workAreas,
        attentionAreas,
        disabledMessage,
    ] = await Promise.all([
        db.select({
            id: users.id,
            name: users.name,
            email: users.email,
            image: users.image
        }).from(users),
        getAppSetting("allow_new_tickets"),
        getActiveCategories(),
        getActiveCampuses(),
        getActiveWorkAreas(),
        getActiveAttentionAreas(),
        getAppSetting("ticket_disabled_message"),
    ]);

    const allowNewTickets = allowNewTicketsSetting !== "false";

    return (
        <NewTicketForm
            availableUsers={availableUsers}
            allowNewTickets={allowNewTickets}
            categories={categories}
            campuses={campuses}
            workAreas={workAreas}
            attentionAreas={attentionAreas}
            disabledMessage={disabledMessage}
        />
    );
}
