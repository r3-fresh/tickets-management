"use server";

import { db } from "@/db";
import { ticketCategories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";

export async function getAllActiveCategories() {
    await requireAuth();

    try {
        const categories = await db.query.ticketCategories.findMany({
            where: (categories, { eq }) => eq(categories.isActive, true),
            orderBy: [asc(ticketCategories.displayOrder)],
            columns: {
                id: true,
                name: true,
            },
        });

        return categories;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}
