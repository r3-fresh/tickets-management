import { db } from "@/db";
import { appSettings, ticketCategories, campusLocations, workAreas, ticketSubcategories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/utils/server-auth";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { AdminSettingsTabs } from "@/components/admin/admin-settings-tabs";

export default async function AdminSettingsPage() {
    const session = await requireAdmin();

    // Fetch current setting
    const setting = await db.query.appSettings.findFirst({
        where: eq(appSettings.key, "allow_new_tickets"),
    });

    const allowNewTickets = setting ? setting.value === "true" : true; // Default to true

    // Fetch disabled message
    const disabledMessageSetting = await db.query.appSettings.findFirst({
        where: eq(appSettings.key, "ticket_disabled_message"),
    });
    const disabledMessage = disabledMessageSetting?.value || "";

    // Fetch all categories
    const categories = await db.query.ticketCategories.findMany({
        orderBy: [asc(ticketCategories.displayOrder)],
    });


    // Fetch all subcategories with category relation
    const subcategories = await db.query.ticketSubcategories.findMany({
        orderBy: [asc(ticketSubcategories.categoryId), asc(ticketSubcategories.displayOrder)],
        with: {
            category: true,
        },
    });

    // Fetch all campus
    const campusData = await db.query.campusLocations.findMany({
        orderBy: [asc(campusLocations.name)],
    });

    // Fetch all work areas
    const areas = await db.query.workAreas.findMany({
        orderBy: [asc(workAreas.name)],
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Settings className="h-8 w-8" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
                    <p className="text-muted-foreground">Administra las opciones globales y configuraciones de la aplicación</p>
                </div>
            </div>

            <AdminSettingsTabs
                initialAllowNewTickets={allowNewTickets}
                initialDisabledMessage={disabledMessage}
                initialCategories={categories}
                initialSubcategories={subcategories}
                initialCampus={campusData}
                initialAreas={areas}
            />
        </div>
    );
}
