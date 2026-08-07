// src/app/admin/database/_components/auto-refresh.tsx
"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { RefreshCw, Clock, ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";

interface AutoRefreshProps {
  onRefresh: () => void;
  isLoading?: boolean;
}

const REFRESH_INTERVALS = [
  { label: "Off", value: 0 },
  { label: "5s", value: 5000 },
  { label: "10s", value: 10000 },
  { label: "30s", value: 30000 },
  { label: "1m", value: 60000 },
  { label: "5m", value: 300000 },
];

export function AutoRefresh({ onRefresh, isLoading = false }: AutoRefreshProps) {
  const router = useRouter();
  const [interval, setIntervalTime] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const handleRefresh = useCallback(() => {
    onRefresh();
    router.refresh();
    setLastRefresh(new Date());
  }, [onRefresh, router]);

  // Auto-refresh effect
  useEffect(() => {
    if (interval === 0) return;

    const timer = setInterval(() => {
      handleRefresh();
    }, interval);

    return () => clearInterval(timer);
  }, [interval, handleRefresh]);

  // Format last refresh time
  const formatLastRefresh = useCallback(() => {
    if (!lastRefresh) return "Never";

    const now = new Date();
    const diff = now.getTime() - lastRefresh.getTime();

    if (diff < 60000) {
      return `${Math.floor(diff / 1000)}s ago`;
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else {
      return lastRefresh.toLocaleTimeString();
    }
  }, [lastRefresh]);

  const currentIntervalLabel = REFRESH_INTERVALS.find(i => i.value === interval)?.label ?? "Off";

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isLoading}
        className="flex items-center space-x-2"
      >
        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        <span>Refresh</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Auto: {currentIntervalLabel}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {REFRESH_INTERVALS.map((item) => (
            <DropdownMenuItem
              key={item.value}
              onClick={() => setIntervalTime(item.value)}
              className={cn(
                "flex items-center justify-between",
                interval === item.value && "bg-accent"
              )}
            >
              <span>{item.label}</span>
              {interval === item.value && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Active
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {lastRefresh && (
        <div className="text-xs text-muted-foreground">
          Last: {formatLastRefresh()}
        </div>
      )}
    </div>
  );
}