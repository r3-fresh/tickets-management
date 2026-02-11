import { db } from "@/db";
import { ticketCategories, campusLocations, workAreas, ticketSubcategories, attentionAreas } from "@/db/schema";
import { asc } from "drizzle-orm";
import { getAppSetting } from "@/db/queries";
import dynamic from "next/dynamic";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Configuración del sistema",
};

const AdminSettingsTabs = dynamic(
    () => import("@/components/admin/admin-settings-tabs").then(mod => ({ default: mod.AdminSettingsTabs })),
    {
        loading: () => <div className="h-96 animate-pulse rounded-lg bg-muted" />,
    }
);

export default async function SistemaPage() {
    // Authorization handled by (admin) layout

    // All queries are independent — run in parallel
    const [
        allowNewTicketsSetting,
        disabledMessageSetting,
        categories,
        subcategories,
        campusData,
        areas,
        attentionAreasList,
    ] = await Promise.all([
        getAppSetting("allow_new_tickets"),
        getAppSetting("ticket_disabled_message"),
        db.query.ticketCategories.findMany({
            orderBy: [asc(ticketCategories.displayOrder)],
            with: {
                subcategories: true,
            },
        }),
        db.query.ticketSubcategories.findMany({
            orderBy: [asc(ticketSubcategories.categoryId), asc(ticketSubcategories.displayOrder)],
            with: {
                category: true,
            },
        }),
        db.query.campusLocations.findMany({
            orderBy: [asc(campusLocations.name)],
        }),
        db.query.workAreas.findMany({
            orderBy: [asc(workAreas.name)],
        }),
        db.query.attentionAreas.findMany({
            orderBy: [asc(attentionAreas.name)],
        }),
    ]);

    const allowNewTickets = allowNewTicketsSetting === null || allowNewTicketsSetting === "true";
    const disabledMessage = disabledMessageSetting || "";

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
