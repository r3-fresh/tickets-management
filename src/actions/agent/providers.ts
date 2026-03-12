"use server";

import { db } from "@/db";
import { providers } from "@/db/schema";
import { requireAgent, getSession } from "@/lib/auth/helpers";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const agentUpdateProviderSchema = z.object({
  id: z.coerce.number().min(1),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  isActive: z.boolean(),
});

export async function createAgentProviderAction(formData: FormData) {
  await requireAgent();
  const session = await getSession();
  if (!session?.user?.attentionAreaId) {
    return { error: "No tienes un área asignada" };
  }

  const name = formData.get("name") as string;
  if (!name || name.length < 3) {
    return { error: "El nombre debe tener al menos 3 caracteres" };
  }

  try {
    await db.insert(providers).values({
      name,
      attentionAreaId: session.user.attentionAreaId,
    });
    revalidatePath("/dashboard/configuracion");
    return { success: true };
  } catch (error) {
    console.error("Error creating provider:", error);
    return { error: "Error al crear el proveedor" };
  }
}

export async function updateAgentProviderAction(formData: FormData) {
  await requireAgent();
  const session = await getSession();
  if (!session?.user?.attentionAreaId) {
    return { error: "No tienes un área asignada" };
  }

  const rawData = {
    id: formData.get("id"),
    name: formData.get("name"),
    isActive: formData.get("isActive") === "true",
  };

  const result = agentUpdateProviderSchema.safeParse(rawData);
  if (!result.success) {
    return { error: "Datos inválidos" };
  }

  // Verify provider belongs to agent's area
  const existing = await db.query.providers.findFirst({
    where: and(
      eq(providers.id, result.data.id),
      eq(providers.attentionAreaId, session.user.attentionAreaId),
    ),
  });

  if (!existing) {
    return { error: "Proveedor no encontrado en tu área" };
  }

  try {
    await db.update(providers)
      .set({
        name: result.data.name,
        isActive: result.data.isActive,
        updatedAt: new Date(),
      })
      .where(eq(providers.id, result.data.id));

    revalidatePath("/dashboard/configuracion");
    return { success: true };
  } catch (error) {
    console.error("Error updating provider:", error);
    return { error: "Error al actualizar el proveedor" };
  }
}
