"use server";

import { db } from "@/db";
import { attentionAreas } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/helpers";

export async function getAgentAreaName() {
    const session = await requireAuth();

    if (session.user.role !== "agent" || !session.user.attentionAreaId) {
        return null;
    }

    const area = await db.query.attentionAreas.findFirst({
        where: eq(attentionAreas.id, session.user.attentionAreaId),
        columns: {
            name: true
        }
    });

    return area?.name || null;
}
