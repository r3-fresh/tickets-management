import { getSurveyResultsAction } from "@/actions/surveys";
import { getProviderSurveyResultsAction } from "@/actions/surveys/provider-surveys";
import { SurveyResultsView } from "@/components/surveys/survey-results-view";
import { ProviderSurveyResultsView } from "@/components/surveys/provider-survey-results-view";
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

  const [results, providerResults] = await Promise.all([
    getSurveyResultsAction(),
    getProviderSurveyResultsAction(),
  ]);

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

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-500">
      <Breadcrumb items={[{ label: "Encuestas de satisfacción" }]} />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Encuestas de satisfacción</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      {/* ── Sección: Encuestas de usuarios ── */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-emerald-500" />
          <h2 className="text-xl font-semibold">Encuestas de usuarios</h2>
          {"error" in results ? null : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-medium">
              {results.kpis.totalSurveys} encuesta{results.kpis.totalSurveys !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {"error" in results ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{results.error}</p>
          </div>
        ) : (
          <SurveyResultsView
            surveys={results.surveys}
            kpis={results.kpis}
            distributions={results.distributions}
          />
        )}
      </section>

      <div className="border-t" />

      {/* ── Sección: Evaluaciones de proveedores ── */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-amber-500" />
          <h2 className="text-xl font-semibold">Evaluaciones de proveedores</h2>
          {"error" in providerResults ? null : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 font-medium">
              {providerResults.kpis.totalSurveys} evaluaci{providerResults.kpis.totalSurveys !== 1 ? "ones" : "ón"}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground -mt-3">
          Evaluaciones internas registradas por agentes al cerrar tickets de proveedor.
        </p>

        {"error" in providerResults ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{providerResults.error}</p>
          </div>
        ) : (
          <ProviderSurveyResultsView
            surveys={providerResults.surveys}
            kpis={providerResults.kpis}
          />
        )}
      </section>
    </div>
  );
}
