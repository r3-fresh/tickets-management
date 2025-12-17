
"use server";

import { db } from "@/db";
import { tickets } from "@/db/schema";
import { createTicketSchema } from "@/lib/schemas";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function createTicketAction(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return { error: "No autorizado" };
    }

    const rawData = {
        title: formData.get("title"),
        description: formData.get("description"),
        priority: formData.get("priority"),
        categoryId: formData.get("categoryId"),
        subcategory: formData.get("subcategory"),
        area: formData.get("area") || "No aplica",
        campus: formData.get("campus") || "No aplica",
    };

    const result = createTicketSchema.safeParse(rawData);

    if (!result.success) {
        return { error: "Datos inválidos", details: result.error.flatten() };
    }

    const { title, description, priority, categoryId, subcategory, area, campus } = result.data;

    // Parse watchers (user IDs)
    let watcherList: string[] = [];
    const watchersData = formData.get("watchers");
    if (watchersData) {
        try {
            watcherList = JSON.parse(watchersData as string);
        } catch (e) {
            console.error("Error parsing watchers:", e);
        }
    }

    try {
        // Generate ticket code with year (YYYY-####)
        const { generateNextTicketCode } = await import("@/lib/ticket-utils");
        const ticketCode = await generateNextTicketCode();

        await db.insert(tickets).values({
            ticketCode,
            title,
            description,
            priority,
            categoryId,
            subcategory,
            area: area || "No aplica",
            campus: campus || "No aplica",
            createdById: session.user.id,
            watchers: watcherList,
            status: 'open',
        });

    } catch (error) {
        console.error("Error creating ticket:", error);
        return { error: "Error interno del servidor al crear el ticket" };
    }

    redirect("/dashboard/tickets");
}
