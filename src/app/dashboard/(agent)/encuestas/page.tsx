import { getSurveyResultsAction } from "@/actions/surveys";
import { SurveyResultsView } from "@/components/surveys/survey-results-view";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Encuestas de satisfacción",
};

export default async function SurveyResultsPage() {
  const results = await getSurveyResultsAction();

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
        <p className="text-muted-foreground">
          Resultados de las encuestas post-atención de tickets TSI
        </p>
      </div>

      <SurveyResultsView
        surveys={results.surveys}
        kpis={results.kpis}
        distributions={results.distributions}
      />
    </div>
  );
}
