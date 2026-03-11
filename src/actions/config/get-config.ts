"use server";

import { db } from "@/db";
import { ticketCategories, ticketSubcategories, attentionAreas, priorityConfig } from "@/db/schema";
import { requireAuth } from "@/lib/auth/helpers";
import { eq } from "drizzle-orm";

export async function getActiveCategories() {
  await requireAuth();

  try {
    const categories = await db.query.ticketCategories.findMany({
      where: (categories, { eq }) => eq(categories.isActive, true),
      columns: {
        id: true,
        name: true,
        description: true,
        attentionAreaId: true,
        displayOrder: true,
      },
      orderBy: (categories, { asc }) => [asc(categories.displayOrder)],
      with: {
        subcategories: {
          where: (subcategories, { eq }) => eq(subcategories.isActive, true),
          columns: {
            id: true,
            name: true,
            description: true,
            categoryId: true,
            displayOrder: true,
          },
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

export async function getActiveAttentionAreas() {
  await requireAuth();

  try {
    const areas = await db.query.attentionAreas.findMany({
      where: (areas, { eq }) => eq(areas.isActive, true),
      columns: {
        id: true,
        name: true,
        slug: true,
        isAcceptingTickets: true,
      }
    });
    return areas;
  } catch (error) {
    console.error("Error fetching attention areas:", error);
    return [];
  }
}

export async function getAllPriorityConfigs() {
  await requireAuth();

  try {
    const configs = await db.query.priorityConfig.findMany({
      with: {
        attentionArea: {
          columns: { id: true, name: true, slug: true },
        },
      },
    });
    return configs;
  } catch (error) {
    console.error("Error fetching priority configs:", error);
    return [];
  }
}

export async function getPriorityConfigByArea(attentionAreaId: number) {
  await requireAuth();

  try {
    const configs = await db.query.priorityConfig.findMany({
      where: eq(priorityConfig.attentionAreaId, attentionAreaId),
    });
    return configs;
  } catch (error) {
    console.error("Error fetching priority config for area:", error);
    return [];
  }
}
