// src/app/admin/database/_components/database-stats.tsx
/* eslint-disable */
// @ts-nocheck
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";
import { StatsLoading } from "./loading-states";
import {
  TrendingUp,
  Database,
  Activity,
  Clock
} from "lucide-react";

interface DatabaseStatsProps {
  activeModel: string;
}

export function DatabaseStats({ activeModel }: DatabaseStatsProps) {
  const { data: models, isLoading: modelsLoading } = api.database.getModels.useQuery();

  // Get data for all models to calculate stats
  const modelQueries = models?.map(model =>
      api.database.getData.useQuery({
        model: model.name as never,
        page: 1,
        limit: 1,
      })
    ) ?? []

  const isLoading = modelsLoading || modelQueries.some(query => query.isLoading);

  const stats = useMemo(() => {
    if (!models || modelQueries.some(query => query.isLoading)) return null;

    const totalRecords = modelQueries.reduce((sum, query) => {
      return sum + (query.data?.pagination.total || 0);
    }, 0);

    const modelStats = models.map((model, index) => ({
      name: model.displayName,
      count: modelQueries[index]?.data?.pagination.total || 0,
    })).sort((a, b) => b.count - a.count);

    const topModels = modelStats.slice(0, 3);
    const activeModelStats = modelStats.find(m => m.name.toLowerCase() === activeModel);

    return {
      totalRecords,
      totalModels: models.length,
      topModels,
      activeModelStats,
    };
  }, [models, activeModel]);

  if (isLoading) {
    return <StatsLoading />;
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Across {stats.totalModels} models
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Model</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.activeModelStats?.count.toLocaleString() ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {activeModel} records
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Largest Model</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.topModels[0]?.count.toLocaleString() ?? 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.topModels[0]?.name ?? "N/A"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Now</div>
          <p className="text-xs text-muted-foreground">
            Real-time data
          </p>
        </CardContent>
      </Card>
    </div>
  );
}