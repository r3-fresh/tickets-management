"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface AreaBarData {
  area: string;
  Abiertos: number;
  "En proceso": number;
  "Pend. validación": number;
  Resueltos: number;
}

const COLORS = {
  Abiertos: "#f97316",          // orange-500
  "En proceso": "#3b82f6",      // blue-500
  "Pend. validación": "#eab308", // yellow-500
  Resueltos: "#22c55e",          // green-500
};

interface AreaBarChartProps {
  data: AreaBarData[];
  height?: number;
}

export function AreaBarChart({ data, height = 260 }: AreaBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-sm text-muted-foreground">Sin datos aún</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height} minWidth={0}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
        barCategoryGap="28%"
        barGap={2}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis
          dataKey="area"
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12 }}
          className="fill-muted-foreground"
          width={28}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            fontSize: "0.8rem",
          }}
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
        />
        <Legend
          wrapperStyle={{ fontSize: "0.75rem", paddingTop: "12px" }}
          iconType="circle"
          iconSize={8}
        />
        {Object.entries(COLORS).map(([key, color]) => (
          <Bar key={key} dataKey={key} fill={color} radius={[3, 3, 0, 0]} maxBarSize={24} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
