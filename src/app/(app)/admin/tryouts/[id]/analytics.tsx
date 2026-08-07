// ~/app/admin/tryouts/_components/tryout-statistics.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { TrendingUp, TrendingDown, Users, Target } from "lucide-react";
import type { RouterOutputs } from "~/trpc/react";

type TryoutWithStats = RouterOutputs["tryout"]["getDetailedById"];

interface TryoutStatisticsProps {
  tryout: TryoutWithStats;
}

export default function TryoutStatistics({ tryout }: TryoutStatisticsProps) {
  const { statistics } = tryout;

  if (statistics.completedAttempts === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No completed attempts yet</h3>
            <p className="text-muted-foreground">
              Statistics will appear once students complete the tryout.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Average Score</span>
            </div>
            <div className="text-2xl font-bold">{statistics.averageScore}%</div>
            <Progress value={statistics.averageScore} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Highest Score</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{statistics.highestScore}%</div>
            <Progress value={statistics.highestScore} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">Lowest Score</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{statistics.lowestScore}%</div>
            <Progress value={statistics.lowestScore} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">{statistics.completedAttempts}</div>
            <div className="text-sm text-muted-foreground">Completed Attempts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Math.round((statistics.completedAttempts / statistics.totalAttempts) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}