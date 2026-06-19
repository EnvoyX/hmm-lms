"use client";

import { Crown, Medal, Sparkles, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";

export default function HallOfFamePage() {
  const { data, isLoading } = api.studentDashboard.getWeeklyHallOfFame.useQuery({ limit: 20 });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  const topThree = data?.leaderboard.slice(0, 3) ?? [];
  const rest = data?.leaderboard.slice(3) ?? [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="bg-gradient-to-r from-amber-100/50 via-pink-100/40 to-indigo-100/40 dark:from-amber-900/20 dark:via-pink-900/20 dark:to-indigo-900/20 border-amber-300/40">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-500" />
            <CardTitle className="text-2xl">Weekly Hall of Fame</CardTitle>
          </div>
          <CardDescription>
            The most dedicated learners this week. Keep pushing and claim your spot.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {topThree.map((entry) => (
          <Card key={entry.userId}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>#{entry.rank} {entry.userName}</span>
                {entry.rank === 1 ? (
                  <Trophy className="h-5 w-5 text-amber-500" />
                ) : (
                  <Medal className="h-5 w-5 text-slate-500" />
                )}
              </CardTitle>
              <CardDescription>{Math.round(entry.weeklyDurationSeconds / 60)} minutes this week</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-fuchsia-500" />
            Full Ranking
          </CardTitle>
          <CardDescription>Week {data?.currentWeekKey ?? "-"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {(rest.length ? rest : topThree).map((entry) => (
            <div
              key={entry.userId}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <p className="font-medium">
                #{entry.rank} {entry.userName}
              </p>
              <p className="text-sm text-muted-foreground">
                {Math.round(entry.weeklyDurationSeconds / 60)} mins • {entry.totalSessions} sessions
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
