"use server";

import { db } from "@/db";
import { providers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/helpers";
import { createProviderSchema, updateProviderSchema } from "@/lib/validation/schemas";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createProviderAction(formData: FormData) {
  await requireAdmin();

  const rawData = {
    name: formData.get("name"),
    attentionAreaId: formData.get("attentionAreaId"),
  };

  const result = createProviderSchema.safeParse(rawData);

  if (!result.success) {
    return { error: "Datos inválidos" };
  }

  try {
    await db.insert(providers).values(result.data);
    revalidatePath("/dashboard/sistema");
    return { success: true };
  } catch (error) {
    console.error("Error creating provider:", error);
    return { error: "Error al crear el proveedor" };
  }
}

export async function updateProviderAction(formData: FormData) {
  await requireAdmin();

  const rawData = {
    id: formData.get("id"),
    name: formData.get("name"),
    isActive: formData.get("isActive") === "true",
  };

  const result = updateProviderSchema.safeParse(rawData);

  if (!result.success) {
    return { error: "Datos inválidos" };
  }

  try {
    await db.update(providers)
      .set({
        name: result.data.name,
        isActive: result.data.isActive,
        updatedAt: new Date(),
      })
      .where(eq(providers.id, result.data.id));

    revalidatePath("/dashboard/sistema");
    return { success: true };
  } catch (error) {
    console.error("Error updating provider:", error);
    return { error: "Error al actualizar el proveedor" };
  }
}
