import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { providerTickets, providerSatisfactionSurveys, attentionAreas, providers } from "@/db/schema";
import { requireAgent } from "@/lib/auth/helpers";
import { eq, desc } from "drizzle-orm";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAgent();
    const isAdmin = session.user.role === "admin";
    const areaId = session.user.attentionAreaId;

    // Fetch all provider tickets scoped by role
    const ticketRows = await db.query.providerTickets.findMany({
      where: !isAdmin && areaId ? eq(providerTickets.attentionAreaId, areaId) : undefined,
      with: {
        provider: { columns: { name: true } },
        requestedBy: { columns: { name: true } },
        attentionArea: { columns: { name: true } },
      },
      orderBy: [desc(providerTickets.createdAt)],
    });

    // Fetch all evaluations in one query
    const surveys = await db.query.providerSatisfactionSurveys.findMany({
      with: {
        submittedBy: { columns: { name: true } },
      },
    });

    // Index surveys by providerTicketId
    const surveyByTicket = new Map(surveys.map((s) => [s.providerTicketId, s]));

    // Helper: diff in days between two date strings (YYYY-MM-DD)
    function daysBetween(from: string | null, to: string | null): number | null {
      if (!from || !to) return null;
      const d1 = new Date(from).getTime();
      const d2 = new Date(to).getTime();
      if (isNaN(d1) || isNaN(d2)) return null;
      return Math.round((d2 - d1) / 86400000);
    }

    // Build rows
    const rows = ticketRows.map((t) => {
      const survey = surveyByTicket.get(t.id);
      const days = daysBetween(t.requestDate, t.completionDate);

      return {
        "Código externo": t.externalCode,
        "Título": t.title,
        "Proveedor": t.provider?.name ?? "—",
        "Área de atención": t.attentionArea?.name ?? "—",
        "Estado": t.status === "cerrado" ? "Cerrado" : "En proceso",
        "Prioridad": t.priority ?? "—",
        "Solicitado por": t.requestedBy?.name ?? "—",
        "Fecha de solicitud": t.requestDate ?? "—",
        "Fecha de finalización": t.completionDate ?? "—",
        "Tiempo de atención (días)": days !== null ? days : "—",
        // Survey fields
        "Evaluación: T. respuesta": survey?.responseTimeRating ?? "—",
        "Evaluación: Plazos": survey?.deadlineRating ?? "—",
        "Evaluación: Calidad": survey?.qualityRating ?? "—",
        "Evaluación: Comprensión": survey?.requirementUnderstandingRating ?? "—",
        "Evaluación: Atención": survey?.attentionRating ?? "—",
        "Evaluación: Promedio": survey
          ? (
            (survey.responseTimeRating +
              survey.deadlineRating +
              survey.qualityRating +
              survey.requirementUnderstandingRating +
              survey.attentionRating) /
            5
          ).toFixed(2)
          : "—",
        "Evaluado por": survey?.submittedBy?.name ?? "—",
        "Fecha de evaluación": survey?.createdAt
          ? new Date(survey.createdAt).toLocaleDateString("es-ES")
          : "—",
      };
    });

    // Generate XLSX workbook
    const ws = XLSX.utils.json_to_sheet(rows);

    // Auto column widths
    const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
      wch: Math.max(key.length, 14),
    }));
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tickets de proveedores");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const now = new Date().toISOString().split("T")[0];
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="tickets-proveedores-${now}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting provider tickets:", error);
    return NextResponse.json({ error: "No autorizado o error al exportar" }, { status: 401 });
  }
}
