// ~/app/admin/courses/[id]/course-analytics.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Download,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '~/trpc/react';

interface CourseAnalyticsProps {
  courseId: string;
}

export default function CourseAnalytics({ courseId }: CourseAnalyticsProps) {
  const { data: analytics, isLoading, error } = api.course.getCourseAnalytics.useQuery({ id: courseId });

  if (isLoading) return <div>Loading analytics...</div>;
  if (error) return <div>Error loading analytics: {error.message}</div>;
  if (!analytics) return null;

  const totalViews = analytics.documentStats.find((stat) => stat.action === 'VIEW')?._count._all ?? 0;
  const totalDownloads = analytics.documentStats.find((stat) => stat.action === 'DOWNLOAD')?._count._all ?? 0;

  const completedAttempts = analytics.tryoutStats.find((stat) => stat.isCompleted)?._count._all ?? 0;
  const incompleteAttempts = analytics.tryoutStats.find((stat) => !stat.isCompleted)?._count._all ?? 0;
  const averageScore = analytics.tryoutStats.find((stat) => stat.isCompleted)?._avg.score ?? 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">Total resource views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDownloads}</div>
            <p className="text-xs text-muted-foreground">Total downloads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore?.toFixed(1) ?? 'N/A'}%</div>
            <p className="text-xs text-muted-foreground">Average tryout score</p>
          </CardContent>
        </Card>
      </div>

      {/* Tryout Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Tryout Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completed Attempts</span>
              <Badge variant="default">{completedAttempts}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Incomplete Attempts</span>
              <Badge variant="secondary">{incompleteAttempts}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completion Rate</span>
              <Badge variant="outline">
                {completedAttempts + incompleteAttempts > 0
                  ? ((completedAttempts / (completedAttempts + incompleteAttempts)) * 100).toFixed(1)
                  : 0}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Resource Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {activity.action === 'VIEW' ? (
                      <Eye className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Download className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-sm font-medium">{activity.user.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {activity.action.toLowerCase()}ed &quot;{activity.resource.title}&quot;
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(activity.accessedAt), 'MMM dd, HH:mm')}
                </div>
              </div>
            ))}
            {analytics.recentActivity.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}