"use client";

import { useEffect, useMemo, useState } from "react";
import { Crown, Medal, Sparkles, Trophy } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { useLocalStorage } from "~/hooks/use-local-storage";
import { api } from "~/trpc/react";

const HALL_OF_FAME_WEEK_KEY = "hall-of-fame-last-seen-week";

export function WeeklyPodiumPopup() {
  const [open, setOpen] = useState(false);
  const [lastSeenWeek, setLastSeenWeek] = useLocalStorage<string>(HALL_OF_FAME_WEEK_KEY, "");
  const { data, isLoading } = api.studentDashboard.getWeeklyHallOfFame.useQuery({ limit: 3 });

  const shouldShow = useMemo(() => {
    if (isLoading || !data) return false;
    return data.leaderboard.length >= 3 && data.currentWeekKey !== lastSeenWeek;
  }, [data, isLoading, lastSeenWeek]);

  useEffect(() => {
    if (shouldShow) {
      setOpen(true);
    }
  }, [shouldShow]);

  const handleClose = () => {
    if (data?.currentWeekKey) {
      setLastSeenWeek(data.currentWeekKey);
    }
    setOpen(false);
  };

  const leaders = data?.leaderboard ?? [];

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? handleClose() : setOpen(nextOpen))}>
      <DialogContent className="max-w-xl border-amber-400/40 bg-gradient-to-br from-amber-100/60 via-fuchsia-100/40 to-indigo-100/30 dark:from-amber-900/30 dark:via-fuchsia-900/20 dark:to-indigo-900/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="h-5 w-5 text-amber-500" />
            Weekly Hall of Fame
          </DialogTitle>
          <DialogDescription>
            This week&apos;s top learners are here. Keep your momentum and rise to the podium.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-3">
          {leaders.map((entry) => (
            <div key={entry.userId} className="rounded-lg border bg-background/75 p-3 text-center">
              <p className="font-semibold text-sm">#{entry.rank}</p>
              <p className="font-medium">{entry.userName}</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(entry.weeklyDurationSeconds / 60)} mins
              </p>
              <div className="mt-2 flex justify-center">
                {entry.rank === 1 ? (
                  <Trophy className="h-4 w-4 text-amber-500" />
                ) : entry.rank === 2 ? (
                  <Medal className="h-4 w-4 text-slate-500" />
                ) : (
                  <Sparkles className="h-4 w-4 text-rose-500" />
                )}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleClose}>Awesome, let&apos;s learn</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
