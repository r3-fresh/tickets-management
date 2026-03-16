"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Clock, MessageSquare, CheckCircle, BarChart3, TrendingUp, Percent } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import { SURVEY_QUESTIONS } from "@/lib/constants/tickets";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
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
  ticket: { ticketCode: string; title: string };
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

const BAR_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];

function KPICard({ title, value, subtitle, icon: Icon, color }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={cn("flex items-center justify-center h-12 w-12 rounded-xl shrink-0", color)}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DistributionChart({ title, data, lowLabel, highLabel }: {
  title: string;
  data: number[];
  lowLabel: string;
  highLabel: string;
}) {
  const chartData = data.map((count, i) => ({
    rating: `${i + 1}`,
    count,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="rating"
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                }}
                labelFormatter={(label) => `Calificación: ${label}`}
                formatter={(value) => [`${value} respuestas`, "Cantidad"]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-2">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function RatingDisplay({ value }: { value: number }) {
  const color = value <= 2 ? "text-red-600 dark:text-red-400" : value === 3 ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400";
  return <span className={cn("font-bold tabular-nums", color)}>{value}</span>;
}

export function SurveyResultsView({ surveys, kpis, distributions }: SurveyResultsViewProps) {
  if (kpis.totalSurveys === 0) {
    return (
      <div className="text-center py-16 px-4 border border-dashed rounded-lg bg-muted/5">
        <div className="mx-auto h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
          <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Sin encuestas aún</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Las encuestas de satisfacción aparecerán aquí cuando los usuarios confirmen la resolución de tickets TSI.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Satisfacción general"
          value={`${kpis.avgOverall}/5`}
          subtitle="Promedio general"
          icon={Star}
          color="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
        />
        <KPICard
          title="Total de encuestas"
          value={kpis.totalSurveys}
          subtitle="Encuestas completadas"
          icon={CheckCircle}
          color="bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
        />
        <KPICard
          title="Tasa de respuesta"
          value={`${kpis.responseRate}%`}
          subtitle="De tickets resueltos"
          icon={Percent}
          color="bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
        />
        <KPICard
          title="Tiempo de respuesta"
          value={`${kpis.avgResponseTime}/5`}
          subtitle="Promedio de calificación"
          icon={Clock}
          color="bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
        />
      </div>

      {/* Average per question cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SURVEY_QUESTIONS.map((q) => {
          const avgKey = `avg${q.key.charAt(0).toUpperCase()}${q.key.slice(1).replace("Rating", "")}` as keyof KPIs;
          // Map question keys to KPI keys
          const kpiMap: Record<string, keyof KPIs> = {
            responseTimeRating: "avgResponseTime",
            communicationRating: "avgCommunication",
            solutionRating: "avgSolution",
            overallRating: "avgOverall",
          };
          const avg = kpis[kpiMap[q.key]];
          const numericAvg = typeof avg === "number" ? avg : 0;
          const percentage = (numericAvg / 5) * 100;

          return (
            <Card key={q.key}>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground mb-1">{q.label}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold">{numericAvg}</span>
                  <span className="text-sm text-muted-foreground">/5</span>
                </div>
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      percentage >= 80 ? "bg-emerald-500" : percentage >= 60 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Distribution Charts */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          Distribución de respuestas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SURVEY_QUESTIONS.map((q) => {
            const distKey = q.key.replace("Rating", "") as keyof Distributions;
            // Map question keys to distribution keys
            const distMap: Record<string, keyof Distributions> = {
              responseTimeRating: "responseTime",
              communicationRating: "communication",
              solutionRating: "solution",
              overallRating: "overall",
            };
            return (
              <DistributionChart
                key={q.key}
                title={q.label}
                data={distributions[distMap[q.key]]}
                lowLabel={q.lowLabel}
                highLabel={q.highLabel}
              />
            );
          })}
        </div>
      </div>

      {/* Data Table */}
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
