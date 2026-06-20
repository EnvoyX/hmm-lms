"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { api } from "~/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";

const chartConfig = {
  minutes: {
    label: "Minutes",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function DashboardChart() {
  // Fetch last 7 days of learning data
  const { data: weeklyData, isLoading } = api.lessonTracker.getWeeklySummary.useQuery();

  if (isLoading) {
    return (
      <Card className="h-max">
        <CardHeader>
          <CardTitle>Activity Minutes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-54 w-full animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const chartData = weeklyData?.map((day) => ({
    day: day.dayName,
    minutes: Math.round(day.totalDurationSeconds / 60),
  })) ?? [];

  const totalMinutes = chartData.reduce((sum, day) => sum + day.minutes, 0);
  const avgMinutes = totalMinutes / 7;
  const previousWeekAvg = avgMinutes * 0.95; // Mock previous week for trend
  const trendPercentage = ((avgMinutes - previousWeekAvg) / previousWeekAvg * 100).toFixed(1);

  return (
    <Card className="h-max border-border/70 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl tracking-tight">Activity Minutes</CardTitle>
        <CardDescription className="flex items-center gap-1 text-xs font-medium uppercase tracking-[0.06em]">
          {parseFloat(trendPercentage) >= 0 ? "Trending up" : "Trending down"} by{" "}
          {Math.abs(parseFloat(trendPercentage))}% this week
          <TrendingUp className="h-4 w-4" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-56 w-full" config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 10, left: -10, right: 10 }}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={28}
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value: string) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="minutes" fill="var(--color-minutes)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}