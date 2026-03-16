"use server";

import { db } from "@/db";
import { satisfactionSurveys, tickets, attentionAreas } from "@/db/schema";
import { requireAuth, requireAgent } from "@/lib/auth/helpers";
import { eq, and, count, avg, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { submitSurveySchema } from "@/lib/validation/schemas";
import { createRateLimiter } from "@/lib/utils/rate-limit";

const surveyRateLimiter = createRateLimiter("MODERATE");

/**
 * Submit a satisfaction survey for a resolved TSI ticket.
 * Only the ticket creator can submit, and only once per ticket.
 */
export async function submitSurveyAction(data: {
  ticketId: number;
  responseTimeRating: number;
  communicationRating: number;
  solutionRating: number;
  overallRating: number;
  improvementSuggestion?: string;
}) {
  const session = await requireAuth();

  // Rate limiting
  const rateLimitResult = surveyRateLimiter(`survey:${session.user.id}`);
  if (!rateLimitResult.success) {
    return { error: "Demasiadas solicitudes. Intenta de nuevo en un momento." };
  }

  // Validate input
  const parsed = submitSurveySchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Datos inválidos", details: parsed.error.flatten() };
  }

  try {
    // Verify ticket exists, is resolved, belongs to TSI, and user is the creator
    const ticket = await db.query.tickets.findFirst({
      where: eq(tickets.id, parsed.data.ticketId),
      with: { attentionArea: true },
    });

    if (!ticket) {
      return { error: "Ticket no encontrado" };
    }

    if (ticket.createdById !== session.user.id) {
      return { error: "Solo el creador del ticket puede completar la encuesta" };
    }

    if (ticket.status !== "resolved") {
      return { error: "El ticket debe estar resuelto para completar la encuesta" };
    }

    if (ticket.attentionArea?.slug !== "TSI") {
      return { error: "Las encuestas solo están disponibles para tickets de TSI" };
    }

    // Check if survey already exists
    const existing = await db.query.satisfactionSurveys.findFirst({
      where: eq(satisfactionSurveys.ticketId, parsed.data.ticketId),
    });

    if (existing) {
      return { error: "Ya se completó una encuesta para este ticket" };
    }

    // Insert survey
    await db.insert(satisfactionSurveys).values({
      ticketId: parsed.data.ticketId,
      userId: session.user.id,
      attentionAreaId: ticket.attentionAreaId!,
      responseTimeRating: parsed.data.responseTimeRating,
      communicationRating: parsed.data.communicationRating,
      solutionRating: parsed.data.solutionRating,
      overallRating: parsed.data.overallRating,
      improvementSuggestion: parsed.data.improvementSuggestion || null,
    });

    revalidatePath(`/dashboard/tickets/${ticket.ticketCode}`);
    revalidatePath("/dashboard/encuestas");
    return { success: true };
  } catch (error) {
    console.error("Error submitting survey:", error);
    return { error: "Error al enviar la encuesta" };
  }
}

/**
 * Get survey for a specific ticket (used in ticket detail page).
 * Returns null if no survey exists.
 */
export async function getSurveyByTicketAction(ticketId: number) {
  const session = await requireAuth();

  try {
    const survey = await db.query.satisfactionSurveys.findFirst({
      where: eq(satisfactionSurveys.ticketId, ticketId),
    });

    return survey ?? null;
  } catch (error) {
    console.error("Error fetching survey:", error);
    return null;
  }
}

/**
 * Get aggregated survey results for the results page.
 * Agents see only their area; admins see all.
 */
export async function getSurveyResultsAction() {
  const session = await requireAgent();

  try {
    const isAdmin = session.user.role === "admin";
    const areaId = session.user.attentionAreaId;

    // Build where condition
    const whereCondition = isAdmin
      ? undefined
      : areaId
        ? eq(satisfactionSurveys.attentionAreaId, areaId)
        : undefined;

    // Get all surveys with ticket info
    const surveysList = await db.query.satisfactionSurveys.findMany({
      where: whereCondition,
      with: {
        ticket: {
          columns: { ticketCode: true, title: true },
        },
        user: {
          columns: { name: true },
        },
        attentionArea: {
          columns: { name: true, slug: true },
        },
      },
      orderBy: [desc(satisfactionSurveys.createdAt)],
    });

    // Calculate KPIs
    const totalSurveys = surveysList.length;

    if (totalSurveys === 0) {
      return {
        surveys: [],
        kpis: {
          totalSurveys: 0,
          avgOverall: 0,
          avgResponseTime: 0,
          avgCommunication: 0,
          avgSolution: 0,
          responseRate: 0,
        },
        distributions: {
          responseTime: [0, 0, 0, 0, 0],
          communication: [0, 0, 0, 0, 0],
          solution: [0, 0, 0, 0, 0],
          overall: [0, 0, 0, 0, 0],
        },
      };
    }

    // Calculate averages
    const avgOverall = surveysList.reduce((sum, s) => sum + s.overallRating, 0) / totalSurveys;
    const avgResponseTime = surveysList.reduce((sum, s) => sum + s.responseTimeRating, 0) / totalSurveys;
    const avgCommunication = surveysList.reduce((sum, s) => sum + s.communicationRating, 0) / totalSurveys;
    const avgSolution = surveysList.reduce((sum, s) => sum + s.solutionRating, 0) / totalSurveys;

    // Calculate response rate (surveys / resolved TSI tickets)
    const resolvedTicketsConditions = [
      eq(tickets.status, "resolved"),
    ];
    if (!isAdmin && areaId) {
      resolvedTicketsConditions.push(eq(tickets.attentionAreaId, areaId));
    }
    // Only count TSI tickets for response rate
    const tsiArea = await db.query.attentionAreas.findFirst({
      where: eq(attentionAreas.slug, "TSI"),
      columns: { id: true },
    });
    if (tsiArea) {
      resolvedTicketsConditions.push(eq(tickets.attentionAreaId, tsiArea.id));
    }

    const [resolvedCount] = await db.select({ count: count() })
      .from(tickets)
      .where(and(...resolvedTicketsConditions));

    const responseRate = resolvedCount.count > 0
      ? (totalSurveys / resolvedCount.count) * 100
      : 0;

    // Calculate distributions (count of each rating value per question)
    const distributions = {
      responseTime: [0, 0, 0, 0, 0] as number[],
      communication: [0, 0, 0, 0, 0] as number[],
      solution: [0, 0, 0, 0, 0] as number[],
      overall: [0, 0, 0, 0, 0] as number[],
    };

    for (const survey of surveysList) {
      distributions.responseTime[survey.responseTimeRating - 1]++;
      distributions.communication[survey.communicationRating - 1]++;
      distributions.solution[survey.solutionRating - 1]++;
      distributions.overall[survey.overallRating - 1]++;
    }

    return {
      surveys: surveysList,
      kpis: {
        totalSurveys,
        avgOverall: Math.round(avgOverall * 10) / 10,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        avgCommunication: Math.round(avgCommunication * 10) / 10,
        avgSolution: Math.round(avgSolution * 10) / 10,
        responseRate: Math.round(responseRate * 10) / 10,
      },
      distributions,
    };
  } catch (error) {
    console.error("Error fetching survey results:", error);
    return { error: "Error al obtener los resultados de encuestas" };
  }
}
