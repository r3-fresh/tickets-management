"use server";

import { db } from "@/db";
import { comments, tickets, users } from "@/db/schema";
import { requireAgent } from "@/lib/auth/helpers";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { eq, and, inArray } from "drizzle-orm";
import { TICKET_STATUS } from "@/lib/constants/tickets";
import { sendDerivationEmail } from "@/lib/email/send-emails";
import { createRateLimiter } from "@/lib/utils/rate-limit";
import { formatDateShort } from "@/lib/utils/format";
import type { DerivationMetadata } from "@/types";

// Rate limiter para derivaciones: 10 por minuto
const derivationRateLimiter = createRateLimiter('MODERATE');

export async function addDerivationAction(formData: FormData) {
  const session = await requireAgent();

  // Aplicar rate limiting
  const rateLimitResult = derivationRateLimiter(`derivation-${session.user.id}`);
  if (!rateLimitResult.success) {
    return { error: "Estás registrando derivaciones muy rápido. Por favor, espera un momento." };
  }

  const ticketId = Number(formData.get("ticketId"));
  const providerName = (formData.get("providerName") as string)?.trim();
  const estimatedDate = (formData.get("estimatedDate") as string)?.trim() || undefined;
  const providerTicketId = formData.get("providerTicketId")
    ? Number(formData.get("providerTicketId"))
    : undefined;

  if (!ticketId || !providerName) {
    return { error: "Datos de derivación inválidos" };
  }

  try {
    const ticket = await db.query.tickets.findFirst({
      where: eq(tickets.id, ticketId),
      with: {
        createdBy: true,
        attentionArea: true,
      },
    });

    if (!ticket) return { error: "Ticket no encontrado" };

    if (ticket.status === TICKET_STATUS.RESOLVED || ticket.status === TICKET_STATUS.VOIDED) {
      return { error: "No se puede registrar una derivación en un ticket cerrado" };
    }

    const metadata: DerivationMetadata = {
      providerName,
      ...(estimatedDate && { estimatedDate }),
      ...(providerTicketId && { providerTicketId }),
    };

    // Construir mensaje descriptivo para la actividad
    const content = `Derivado a <strong>${providerName}</strong>`;

    await db.insert(comments).values({
      ticketId,
      userId: session.user.id,
      content,
      isInternal: false,
      type: "derivation",
      metadata,
    });

    // Enviar notificación por correo después de responder
    if (ticket.attentionAreaId) {
      const ticketData = ticket;
      const userName = session.user.name;
      const derivationEstimatedDate = estimatedDate;
      const derivationProviderName = providerName;

      after(async () => {
        try {
          // Obtener agentes y watchers en paralelo
          const [agentData, watcherData] = await Promise.all([
            db.select({ email: users.email })
              .from(users)
              .where(and(
                eq(users.role, 'agent'),
                eq(users.attentionAreaId, ticketData.attentionAreaId!)
              )),
            ticketData.watchers && ticketData.watchers.length > 0
              ? db.select({ email: users.email })
                .from(users)
                .where(inArray(users.id, ticketData.watchers))
              : Promise.resolve([] as { email: string }[]),
          ]);

          await sendDerivationEmail({
            ticketId: ticketData.id,
            ticketCode: ticketData.ticketCode,
            title: ticketData.title,
            creatorEmail: ticketData.createdBy.email,
            creatorName: ticketData.createdBy.name,
            agentEmails: agentData.map(a => a.email),
            watcherEmails: watcherData.map(w => w.email),
            attentionAreaName: ticketData.attentionArea?.name || 'Hub de Información',
            emailThreadId: ticketData.emailThreadId,
            initialMessageId: ticketData.initialMessageId,
            providerName: derivationProviderName,
            estimatedDate: derivationEstimatedDate
              ? formatDateShort(derivationEstimatedDate)
              : undefined,
            userName,
          });
        } catch (emailError) {
          console.error("Error sending derivation notification email:", emailError);
        }
      });
    }

    revalidatePath(`/dashboard/tickets/${ticket.ticketCode}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding derivation:", error);
    return { error: "Error al registrar la derivación" };
  }
}
