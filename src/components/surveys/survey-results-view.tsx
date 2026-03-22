"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Star, Clock, MessageSquare, CheckCircle, Percent, Brain, BarChart3, Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";

interface SurveyData {
  id: number;
  ticketId: number;
  responseTimeRating: number;
  communicationRating: number;
  solutionRating: number;
  overallRating: number;
  improvementSuggestion: string | null;
  createdAt: Date;
  ticket: { ticketCode: string; title: string; assignedTo?: { id: string; name: string } | null };
  user: { name: string };
  attentionArea: { name: string; slug: string };
}

interface KPIs {
  totalSurveys: number;
  avgOverall: number;
  avgResponseTime: number;
  avgCommunication: number;
  avgSolution: number;
  responseRate: number;
}

interface Distributions {
  responseTime: number[];
  communication: number[];
  solution: number[];
  overall: number[];
}

interface SurveyResultsViewProps {
  surveys: SurveyData[];
  kpis: KPIs;
  distributions: Distributions;
}

function MiniBar({ value }: { value: number }) {
  const pct = (value / 5) * 100;
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

function RatingDisplay({ value }: { value: number }) {
  const color =
    value <= 2
      ? "text-red-600 dark:text-red-400"
      : value === 3
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-green-600 dark:text-green-400";
  return <span className={cn("font-bold tabular-nums", color)}>{value}</span>;
}

const KPI_DEFINITIONS = [
  {
    key: "avgOverall" as keyof KPIs,
    label: "Satisfacción general",
    icon: Star,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  {
    key: "totalSurveys" as keyof KPIs,
    label: "Total de encuestas",
    icon: CheckCircle,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    noBar: true,
  },
  {
    key: "responseRate" as keyof KPIs,
    label: "Tasa de respuesta",
    icon: Percent,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
    noBar: true,
    suffix: "%",
  },
  {
    key: "avgResponseTime" as keyof KPIs,
    label: "Tiempo de respuesta",
    icon: Clock,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  },
  {
    key: "avgCommunication" as keyof KPIs,
    label: "Comunicación",
    icon: MessageSquare,
    color: "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
  },
  {
    key: "avgSolution" as keyof KPIs,
    label: "Calidad de solución",
    icon: Brain,
    color: "bg-teal-100 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400",
  },
];

export function SurveyResultsView({ surveys, kpis }: SurveyResultsViewProps) {
  if (kpis.totalSurveys === 0) {
    return (
      <div className="text-center py-16 px-4 border border-dashed rounded-lg bg-muted/5">
        <div className="mx-auto h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
          <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Sin encuestas aún</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Las encuestas de satisfacción aparecerán aquí cuando los usuarios confirmen la resolución de tickets de tu área.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards — same compact style as provider surveys */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {KPI_DEFINITIONS.map(({ key, label, icon: Icon, color, noBar, suffix }) => {
          const rawVal = kpis[key] as number;
          const displayVal = suffix ? `${rawVal}${suffix}` : rawVal;
          return (
            <Card key={key}>
              <CardContent className="pt-4 pb-4">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center mb-2", color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-xs text-muted-foreground leading-tight mb-1">{label}</p>
                <p className="text-xl font-bold tracking-tight">
                  {displayVal}
                  {!suffix && !noBar && (
                    <span className="text-sm font-normal text-muted-foreground">/5</span>
                  )}
                </p>
                {!noBar && <MiniBar value={rawVal} />}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Table */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          Detalle de encuestas
        </h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ticket</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Solicitante</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Tiempo</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Comunicación</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Solución</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">General</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Comentario</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map((survey) => (
                  <tr key={survey.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        href={`/dashboard/tickets/${survey.ticket.ticketCode}`}
                        className="text-primary hover:underline font-mono text-xs"
                      >
                        {survey.ticket.ticketCode}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{survey.user?.name ?? "—"}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(survey.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <RatingDisplay value={survey.responseTimeRating} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <RatingDisplay value={survey.communicationRating} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <RatingDisplay value={survey.solutionRating} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <RatingDisplay value={survey.overallRating} />
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs max-w-xs truncate">
                      {survey.improvementSuggestion || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
