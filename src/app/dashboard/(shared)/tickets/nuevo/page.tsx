import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { getAppSetting } from "@/db/queries";
import dynamic from "next/dynamic";
import { getActiveCategories, getActiveCampuses, getActiveWorkAreas, getActiveAttentionAreas } from "@/actions/config/get-config";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Nuevo ticket",
};

const NewTicketForm = dynamic(
    () => import("./form").then(mod => ({ default: mod.NewTicketForm }))
);

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
