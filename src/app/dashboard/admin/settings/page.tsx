import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/utils/server-auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
    const session = await requireAdmin();

    // Fetch current setting
    const setting = await db.query.appSettings.findFirst({
        where: eq(appSettings.key, "allow_new_tickets"),
    });

    const allowNewTickets = setting ? setting.value === "true" : true; // Default to true

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                <p className="text-muted-foreground">Administra las opciones globales de la aplicación.</p>
            </div>

            <SettingsForm initialAllowNewTickets={allowNewTickets} />
        </div>
    );
}
