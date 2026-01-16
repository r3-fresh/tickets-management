"use server";

import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateAppSetting(key: string, value: string) {
    await requireAdmin();

    try {
        await db
            .insert(appSettings)
            .values({ key, value, updatedAt: new Date() })
            .onConflictDoUpdate({
                target: appSettings.key,
                set: { value, updatedAt: new Date() },
            });

        revalidatePath("/dashboard/tickets/new");
        revalidatePath("/dashboard/admin/settings");
        revalidatePath("/dashboard/admin/config");
        return { success: true };
    } catch (error) {
        console.error("Error updating setting:", error);
        return { error: "Error al actualizar configuración" };
    }
}

export async function updateDisabledMessage(title: string, message: string) {
    await requireAdmin();

    try {
        // Update title
        await updateAppSetting("ticket_disabled_title", title);
        // Update message
        await updateAppSetting("ticket_disabled_message", message);

        return { success: true };
    } catch (error) {
        console.error("Error updating disabled message:", error);
        return { error: "Error al actualizar mensaje" };
    }
}
