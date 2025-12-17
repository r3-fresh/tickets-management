"use server";

import { db } from "@/db";
import { appSettings } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateAppSetting(key: string, value: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user || (session.user as any).role !== "admin") {
        return { error: "No autorizado" };
    }

    try {
        // Check if setting exists
        const existing = await db.select().from(appSettings).where(eq(appSettings.key, key)).limit(1);

        if (existing.length > 0) {
            await db.update(appSettings)
                .set({ value, updatedAt: new Date() })
                .where(eq(appSettings.key, key));
        } else {
            await db.insert(appSettings).values({
                key,
                value,
            });
        }

        revalidatePath("/dashboard/admin/settings");
        revalidatePath("/dashboard/tickets/new"); // Revalidate creation form
        return { success: true };
    } catch (error) {
        console.error("Error updating setting:", error);
        return { error: "Error al guardar la configuración" };
    }
}
