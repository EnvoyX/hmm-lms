// ~/components/admin/multi-line-chart.tsx
"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface DataSeries {
  key: string;
  name: string;
  color: string;
  data: Array<{ date: string; value: number }>;
}

interface MultiLineChartProps {
  title: string;
  series: DataSeries[];
  height?: number;
  className?: string;
}

export function MultiLineChart({
  title,
  series,
  height = 300,
  className,
}: MultiLineChartProps) {
  const chartData = useMemo(() => {
    // Combine all series data by date
    const dateMap = new Map<string, Record<string, number>>();

    series.forEach((serie) => {
      serie.data.forEach((point) => {
        if (!dateMap.has(point.date)) {
          dateMap.set(point.date, { date: Number(point.date) });
        }
        const existing = dateMap.get(point.date)!;
        existing[serie.key] = point.value;
      });
    });

    return Array.from(dateMap.values()).sort((a, b) =>
      new Date(a.date ?? "").getTime() - new Date(b.date ?? "").getTime()
    );
  }, [series]);

  const formatXAxis = (value: string) => {
    try {
      const date = parseISO(value);
      return format(date, "MMM dd");
    } catch {
      return value;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              className="text-xs"
            />
            <YAxis className="text-xs" />
            <Tooltip
              labelFormatter={(label) => formatXAxis(label as string)}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
            {series.map((serie) => (
              <Line
                key={serie.key}
                type="monotone"
                dataKey={serie.key}
                name={serie.name}
                stroke={serie.color}
                strokeWidth={2}
                dot={{ strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}