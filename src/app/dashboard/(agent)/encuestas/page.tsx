import { getSurveyResultsAction } from "@/actions/surveys";
import { SurveyResultsView } from "@/components/surveys/survey-results-view";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { requireAgent } from "@/lib/auth/helpers";
import { db } from "@/db";
import { attentionAreas } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Encuestas de satisfacción",
};

export default async function SurveyResultsPage() {
  const session = await requireAgent();
  const results = await getSurveyResultsAction();

  // Resolve area name for subtitle
  const isAdmin = session.user.role === "admin";
  let areaName: string | null = null;
  if (!isAdmin && session.user.attentionAreaId) {
    const area = await db.query.attentionAreas.findFirst({
      where: eq(attentionAreas.id, session.user.attentionAreaId),
      columns: { name: true },
    });
    areaName = area?.name ?? null;
  }

  const subtitle = isAdmin
    ? "Resultados globales de encuestas post-atención de todas las áreas."
    : areaName
      ? `Resultados de las encuestas post-atención del área de ${areaName}.`
      : "Resultados de las encuestas post-atención de tickets de tu área.";

  if ("error" in results) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <Breadcrumb items={[{ label: "Encuestas" }]} />
        <div className="text-center py-12 text-muted-foreground">
          <p>{results.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-500">
      <Breadcrumb items={[{ label: "Encuestas de satisfacción" }]} />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Encuestas de satisfacción</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      <SurveyResultsView
        surveys={results.surveys}
        kpis={results.kpis}
        distributions={results.distributions}
      />
    </div>
  );
}
