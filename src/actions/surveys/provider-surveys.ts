"use server";

import { db } from "@/db";
import { providerSatisfactionSurveys, providerTickets } from "@/db/schema";
import { requireAgent } from "@/lib/auth/helpers";
import { eq, and, count, desc } from "drizzle-orm";

/**
 * Get provider satisfaction survey results.
 * Agents see only their area; admins see all.
 */
export async function getProviderSurveyResultsAction() {
  const session = await requireAgent();

  try {
    const isAdmin = session.user.role === "admin";
    const areaId = session.user.attentionAreaId;

    const whereCondition = isAdmin
      ? undefined
      : areaId
        ? eq(providerSatisfactionSurveys.attentionAreaId, areaId)
        : undefined;

    const surveysList = await db.query.providerSatisfactionSurveys.findMany({
      where: whereCondition,
      with: {
        providerTicket: {
          columns: { externalCode: true, title: true },
          with: {
            provider: { columns: { name: true } },
          },
        },
        submittedBy: { columns: { name: true } },
        attentionArea: { columns: { name: true, slug: true } },
      },
      orderBy: [desc(providerSatisfactionSurveys.createdAt)],
    });

    const totalSurveys = surveysList.length;

    if (totalSurveys === 0) {
      return {
        surveys: [],
        kpis: {
          totalSurveys: 0,
          avgResponseTime: 0,
          avgDeadline: 0,
          avgQuality: 0,
          avgRequirementUnderstanding: 0,
          avgAttention: 0,
          avgOverall: 0,
        },
      };
    }

    const avg = (key: keyof typeof surveysList[0]) =>
      Math.round(
        (surveysList.reduce((sum, s) => sum + (s[key] as number), 0) / totalSurveys) * 10
      ) / 10;

    return {
      surveys: surveysList,
      kpis: {
        totalSurveys,
        avgResponseTime: avg("responseTimeRating"),
        avgDeadline: avg("deadlineRating"),
        avgQuality: avg("qualityRating"),
        avgRequirementUnderstanding: avg("requirementUnderstandingRating"),
        avgAttention: avg("attentionRating"),
        avgOverall:
          Math.round(
            ((avg("responseTimeRating") +
              avg("deadlineRating") +
              avg("qualityRating") +
              avg("requirementUnderstandingRating") +
              avg("attentionRating")) /
              5) *
            10
          ) / 10,
      },
    };
  } catch (error) {
    console.error("Error fetching provider survey results:", error);
    return { error: "Error al obtener los resultados de encuestas de proveedores" };
  }
}
