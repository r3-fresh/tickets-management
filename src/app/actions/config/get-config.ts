"use server";

import { db } from "@/db";
import { ticketCategories, ticketSubcategories, campusLocations, workAreas, attentionAreas } from "@/db/schema";

export async function getActiveCategories() {
    try {
        const categories = await db.query.ticketCategories.findMany({
            where: (categories, { eq }) => eq(categories.isActive, true),
            orderBy: (categories, { asc }) => [asc(categories.displayOrder)],
            with: {
                subcategories: {
                    where: (subcategories, { eq }) => eq(subcategories.isActive, true),
                    orderBy: (subcategories, { asc }) => [asc(subcategories.displayOrder)],
                },
            },
        });

        return categories;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export async function getActiveCampuses() {
    try {
        const campuses = await db.query.campusLocations.findMany({
            where: (campus, { eq }) => eq(campus.isActive, true),
            orderBy: (campus, { asc }) => [asc(campus.displayOrder)],
        });

        return campuses;
    } catch (error) {
        console.error("Error fetching campuses:", error);
        return [];
    }
}

export async function getActiveWorkAreas() {
    try {
        const areas = await db.query.workAreas.findMany({
            where: (areas, { eq }) => eq(areas.isActive, true),
            orderBy: (areas, { asc }) => [asc(areas.displayOrder)],
        });

        return areas;
    } catch (error) {
        console.error("Error fetching work areas:", error);
        return [];
    }
}

export async function getActiveAttentionAreas() {
    try {
        const areas = await db.query.attentionAreas.findMany({
            where: (areas, { eq }) => eq(areas.isActive, true),
            columns: {
                id: true,
                name: true,
                isAcceptingTickets: true,
                closedMessage: true,
            }
        });
        return areas;
    } catch (error) {
        console.error("Error fetching attention areas:", error);
        return [];
    }
}
