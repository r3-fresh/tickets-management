import { db } from "@/db";
import { appSettings, ticketCategories, campusLocations, workAreas, ticketSubcategories, attentionAreas } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/helpers";
import { AdminSettingsTabs } from "@/components/admin/admin-settings-tabs";
import { Breadcrumb } from "@/components/shared/breadcrumb";

export default async function () {
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

    // Fetch all categories with subcategories
    const categories = await db.query.ticketCategories.findMany({
        orderBy: [asc(ticketCategories.displayOrder)],
        with: {
            subcategories: true,
        },
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

    // Fetch attention areas
    const attentionAreasList = await db.query.attentionAreas.findMany({
        orderBy: [asc(attentionAreas.name)],
    });

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <Breadcrumb items={[{ label: "Configuración del sistema" }]} />

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuración del sistema</h1>
                <p className="text-muted-foreground mt-1">Administra las opciones globales y configuraciones de la aplicación</p>
            </div>

            <AdminSettingsTabs
                initialAllowNewTickets={allowNewTickets}
                initialDisabledMessage={disabledMessage}
                initialCategories={categories}
                initialSubcategories={subcategories}
                initialCampus={campusData}
                initialAreas={areas}
                initialAttentionAreas={attentionAreasList}
            />
        </div>
    );
}
