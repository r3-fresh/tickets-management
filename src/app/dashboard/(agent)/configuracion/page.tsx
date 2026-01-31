import { db } from "@/db";
import { attentionAreas, ticketCategories, ticketSubcategories } from "@/db/schema";
import { getSession } from "@/lib/auth/helpers";
import { eq, asc } from "drizzle-orm";
import { SettingsTabs } from "./settings-tabs";
import { Breadcrumb } from "@/components/shared/breadcrumb";

export default async function () {
    // Authorization handled by (agent) layout
    const session = await getSession();
    if (!session?.user) return null;

    if (!session.user.attentionAreaId) {
        return <div>Error: No tienes área asignada.</div>;
    }

    const areaConfig = await db.query.attentionAreas.findFirst({
        where: eq(attentionAreas.id, session.user.attentionAreaId),
    });

    if (!areaConfig) {
        return <div>Error: No se encontró la configuración del área.</div>;
    }

    // Fetch categories for this area
    const categories = await db.query.ticketCategories.findMany({
        where: eq(ticketCategories.attentionAreaId, session.user.attentionAreaId),
        with: {
            subcategories: {
                orderBy: [asc(ticketSubcategories.displayOrder)],
            },
        },
        orderBy: [asc(ticketCategories.displayOrder)],
    });

    // Fetch all subcategories for this area (flatten from categories)
    const subcategories = await db.query.ticketSubcategories.findMany({
        where: (subcategories, { inArray }) =>
            inArray(subcategories.categoryId, categories.map(c => c.id)),
        with: {
            category: true,
        },
        orderBy: [asc(ticketSubcategories.categoryId), asc(ticketSubcategories.displayOrder)],
    });

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <Breadcrumb items={[{ label: "Configuración del área" }]} />

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuración del área</h1>
                <p className="text-muted-foreground mt-1">
                    Administra las preferencias para {areaConfig.name}
                </p>
            </div>

            <SettingsTabs
                initialData={areaConfig}
                categories={categories}
                subcategories={subcategories}
                areaId={session.user.attentionAreaId}
            />
        </div>
    );
}
