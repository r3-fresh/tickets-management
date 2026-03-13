"use server";

import { db } from "@/db";
import { providerTickets, providers } from "@/db/schema";
import { requireAgent, getSession } from "@/lib/auth/helpers";
import { createProviderTicketSchema, updateProviderTicketSchema } from "@/lib/validation/schemas";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createRateLimiter } from "@/lib/utils/rate-limit";
import { z } from "zod";

const rateLimiter = createRateLimiter("MODERATE");

export async function createProviderTicketAction(formData: FormData) {
  await requireAgent();
  const session = await getSession();
  if (!session?.user?.attentionAreaId) {
    return { error: "No tienes un área asignada" };
  }

  const limit = rateLimiter(session.user.id);
  if (!limit.success) {
    return { error: "Demasiadas solicitudes. Intenta de nuevo en un momento." };
  }

  const rawData = {
    externalCode: formData.get("externalCode"),
    title: formData.get("title"),
    requestDate: formData.get("requestDate"),
    description: formData.get("description"),
    providerId: formData.get("providerId"),
    ticketId: formData.get("ticketId") || undefined,
  };

  const result = createProviderTicketSchema.safeParse(rawData);
  if (!result.success) {
    return { error: "Datos inválidos" };
  }

  // Verify provider belongs to agent's area
  const provider = await db.query.providers.findFirst({
    where: and(
      eq(providers.id, result.data.providerId),
      eq(providers.attentionAreaId, session.user.attentionAreaId),
    ),
  });

  if (!provider) {
    return { error: "Proveedor no encontrado en tu área" };
  }

  try {
    await db.insert(providerTickets).values({
      externalCode: result.data.externalCode,
      title: result.data.title,
      requestDate: result.data.requestDate,
      description: result.data.description,
      providerId: result.data.providerId,
      ticketId: result.data.ticketId || null,
      attentionAreaId: session.user.attentionAreaId,
      requestedById: session.user.id,
      createdById: session.user.id,
    });

    revalidatePath("/dashboard/proveedores");
    return { success: true };
  } catch (error) {
    console.error("Error creating provider ticket:", error);
    return { error: "Error al crear el ticket de proveedor" };
  }
}

export async function updateProviderTicketAction(formData: FormData) {
  await requireAgent();
  const session = await getSession();
  if (!session?.user?.attentionAreaId) {
    return { error: "No tienes un área asignada" };
  }

  const rawData = {
    id: formData.get("id"),
    externalCode: formData.get("externalCode"),
    title: formData.get("title"),
    requestDate: formData.get("requestDate"),
    description: formData.get("description"),
    providerId: formData.get("providerId"),
    status: formData.get("status"),
    ticketId: formData.get("ticketId") || undefined,
    completionDate: formData.get("completionDate") || undefined,
  };

  const result = updateProviderTicketSchema.safeParse(rawData);
  if (!result.success) {
    return { error: "Datos inválidos" };
  }

  // If closing, completionDate is mandatory (server-side enforcement)
  if (result.data.status === "cerrado" && !result.data.completionDate) {
    return { error: "La fecha de atención es obligatoria para cerrar el ticket" };
  }

  // Verify ticket belongs to agent's area
  const existing = await db.query.providerTickets.findFirst({
    where: and(
      eq(providerTickets.id, result.data.id),
      eq(providerTickets.attentionAreaId, session.user.attentionAreaId),
    ),
  });

  if (!existing) {
    return { error: "Ticket derivado no encontrado en tu área" };
  }

  // Verify provider belongs to agent's area
  const provider = await db.query.providers.findFirst({
    where: and(
      eq(providers.id, result.data.providerId),
      eq(providers.attentionAreaId, session.user.attentionAreaId),
    ),
  });

  if (!provider) {
    return { error: "Proveedor no encontrado en tu área" };
  }

  try {
    await db.update(providerTickets)
      .set({
        externalCode: result.data.externalCode,
        title: result.data.title,
        requestDate: result.data.requestDate,
        description: result.data.description,
        providerId: result.data.providerId,
        status: result.data.status,
        ticketId: result.data.ticketId || null,
        completionDate: result.data.completionDate || null,
        updatedAt: new Date(),
      })
      .where(eq(providerTickets.id, result.data.id));

    revalidatePath("/dashboard/proveedores");
    return { success: true };
  } catch (error) {
    console.error("Error updating provider ticket:", error);
    return { error: "Error al actualizar el ticket de proveedor" };
  }
}

// --- Close provider ticket (requires completionDate) ---

const closeProviderTicketSchema = z.object({
  id: z.coerce.number().min(1),
  completionDate: z.string().min(1, "La fecha de atención es obligatoria"),
});

export async function closeProviderTicketAction(formData: FormData) {
  await requireAgent();
  const session = await getSession();
  if (!session?.user?.attentionAreaId) {
    return { error: "No tienes un área asignada" };
  }

  const rawData = {
    id: formData.get("id"),
    completionDate: formData.get("completionDate"),
  };

  const result = closeProviderTicketSchema.safeParse(rawData);
  if (!result.success) {
    return { error: "La fecha de atención es obligatoria para cerrar el ticket" };
  }

  // Verify ticket belongs to agent's area and is not already closed
  const existing = await db.query.providerTickets.findFirst({
    where: and(
      eq(providerTickets.id, result.data.id),
      eq(providerTickets.attentionAreaId, session.user.attentionAreaId),
    ),
  });

  if (!existing) {
    return { error: "Ticket derivado no encontrado en tu área" };
  }

  if (existing.status === "cerrado") {
    return { error: "El ticket ya se encuentra cerrado" };
  }

  try {
    await db.update(providerTickets)
      .set({
        status: "cerrado",
        completionDate: result.data.completionDate,
        updatedAt: new Date(),
      })
      .where(eq(providerTickets.id, result.data.id));

    revalidatePath("/dashboard/proveedores");
    return { success: true };
  } catch (error) {
    console.error("Error closing provider ticket:", error);
    return { error: "Error al cerrar el ticket de proveedor" };
  }
}

// --- Reopen provider ticket ---

export async function reopenProviderTicketAction(id: number) {
  await requireAgent();
  const session = await getSession();
  if (!session?.user?.attentionAreaId) {
    return { error: "No tienes un área asignada" };
  }

  const existing = await db.query.providerTickets.findFirst({
    where: and(
      eq(providerTickets.id, id),
      eq(providerTickets.attentionAreaId, session.user.attentionAreaId),
    ),
  });

  if (!existing) {
    return { error: "Ticket derivado no encontrado en tu área" };
  }

  if (existing.status !== "cerrado") {
    return { error: "Solo se pueden reabrir tickets cerrados" };
  }

  try {
    await db.update(providerTickets)
      .set({
        status: "en_proceso",
        completionDate: null,
        updatedAt: new Date(),
      })
      .where(eq(providerTickets.id, id));

    revalidatePath("/dashboard/proveedores");
    return { success: true };
  } catch (error) {
    console.error("Error reopening provider ticket:", error);
    return { error: "Error al reabrir el ticket de proveedor" };
  }
}

// --- Delete provider ticket ---

export async function deleteProviderTicketAction(id: number) {
  await requireAgent();
  const session = await getSession();
  if (!session?.user?.attentionAreaId) {
    return { error: "No tienes un área asignada" };
  }

  // Verify ticket belongs to agent's area
  const existing = await db.query.providerTickets.findFirst({
    where: and(
      eq(providerTickets.id, id),
      eq(providerTickets.attentionAreaId, session.user.attentionAreaId),
    ),
  });

  if (!existing) {
    return { error: "Ticket derivado no encontrado en tu área" };
  }

  try {
    await db.delete(providerTickets).where(eq(providerTickets.id, id));

    revalidatePath("/dashboard/proveedores");
    return { success: true };
  } catch (error) {
    console.error("Error deleting provider ticket:", error);
    return { error: "Error al eliminar el ticket de proveedor" };
  }
}
