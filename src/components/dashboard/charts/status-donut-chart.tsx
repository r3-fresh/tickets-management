"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { PieLabelRenderProps } from "recharts";

interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

interface StatusDonutChartProps {
  data: DonutSlice[];
  title?: string;
  centerLabel?: string;
  centerValue?: number | string;
  height?: number;
}

const RADIAN = Math.PI / 180;

function renderCustomLabel(props: PieLabelRenderProps) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if (
    typeof percent !== "number" ||
    typeof cx !== "number" ||
    typeof cy !== "number" ||
    typeof midAngle !== "number" ||
    typeof innerRadius !== "number" ||
    typeof outerRadius !== "number" ||
    percent < 0.07
  ) {
    return null;
  }
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function StatusDonutChart({
  data,
  title,
  centerLabel,
  centerValue,
  height = 220,
}: StatusDonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const nonEmpty = data.filter((d) => d.value > 0);

  return (
    <div className="flex flex-col gap-4">
      {title && (
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
          {title}
        </p>
      )}

      <div className="relative" style={{ height }}>
        {total === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">Sin datos aún</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={nonEmpty}
                cx="50%"
                cy="50%"
                innerRadius="52%"
                outerRadius="78%"
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
                strokeWidth={2}
                stroke="hsl(var(--background))"
              >
                {nonEmpty.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  fontSize: "0.8rem",
                }}
                formatter={(value) => {
                  const v = typeof value === "number" ? value : 0;
                  return [
                    `${v} ticket${v !== 1 ? "s" : ""} (${total > 0 ? ((v / total) * 100).toFixed(1) : 0}%)`,
                    "",
                  ] as [string, string];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* Center label */}
        {centerValue !== undefined && total > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold leading-none">{centerValue}</span>
            {centerLabel && (
              <span className="text-[10px] text-muted-foreground mt-0.5">{centerLabel}</span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      {total > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-xs text-muted-foreground">{d.name}</span>
              <span className="text-xs font-semibold">{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
