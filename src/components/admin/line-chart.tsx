// ~/components/admin/line-chart.tsx
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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { ChartDataPoint } from "~/lib/types/analytics";

interface LineChartComponentProps {
  title: string;
  data: ChartDataPoint[];
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  height?: number;
  formatTooltip?: (value: number, name: string) => [string, string];
  formatXAxis?: (value: string) => string;
  className?: string;
}

export function LineChartComponent({
  title,
  data,
  dataKey = "value",
  xAxisKey = "date",
  color = "#3b82f6",
  height = 300,
  formatTooltip,
  formatXAxis,
  className,
}: LineChartComponentProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      [xAxisKey]: item.date,
      [dataKey]: item.value,
    }));
  }, [data, dataKey, xAxisKey]);

  const defaultFormatXAxis = (value: string) => {
    try {
      const date = parseISO(value);
      return format(date, "MMM dd");
    } catch {
      return value;
    }
  };

  const defaultFormatTooltip = (value: number, name: string) => {
    return [value.toLocaleString(), name];
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
              dataKey={xAxisKey}
              tickFormatter={formatXAxis ?? defaultFormatXAxis}
              className="text-xs"
            />
            <YAxis className="text-xs" />
            <Tooltip
              formatter={formatTooltip ?? defaultFormatTooltip}
              labelFormatter={(label) => formatXAxis ? formatXAxis(label as string) : defaultFormatXAxis(label as string)}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}