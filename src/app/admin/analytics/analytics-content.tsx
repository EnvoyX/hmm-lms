// ~/app/(admin)/admin/analytics/analytics-content.tsx
"use client";

import { useState, useMemo } from "react";
import { subDays, format } from "date-fns";
import {
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  FileText,
  Calendar,
  Award,
  BarChart3,
  Activity,
  Target,
  Clock,
  Percent,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { TimeRangePicker } from "~/components/admin/time-range-picker";
import { LineChartComponent } from "~/components/admin/line-chart";
import { MultiLineChart } from "~/components/admin/multi-line-chart";
import { PieChartComponent } from '~/components/admin/pie-chart';
import { BarChartComponent } from './bar-chart';
import { StatCard } from './stat-card';
import { MetricCard } from './metric';
import { ComparisonCard } from './comparison-card';
import { exportAnalyticsData } from '~/lib/export-analytics';
import type { TimeRange } from "~/lib/types/analytics";

export function AnalyticsContent() {
  const [timeRange, setTimeRange] = useState<TimeRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isExporting, setIsExporting] = useState(false);

  // Existing queries
  const { data: overviewStats, isLoading: isLoadingOverview } =
    api.analytic.getOverviewStats.useQuery(timeRange, {
      refetchInterval: 60000,
    });

  const { data: userActivity, isLoading: isLoadingActivity } =
    api.analytic.getUserActivity.useQuery(timeRange, {
      refetchInterval: 60000,
    });

  const { data: tryoutPerformance, isLoading: isLoadingTryouts } =
    api.analytic.getTryoutPerformance.useQuery(timeRange, {
      refetchInterval: 60000,
    });

  const { data: resourceAnalytics, isLoading: isLoadingDocuments } =
    api.analytic.getResourceAnalytics.useQuery(timeRange, {
      refetchInterval: 60000,
    });

  const { data: courseAnalytics, isLoading: isLoadingCourses } =
    api.analytic.getCourseAnalytics.useQuery(timeRange, {
      refetchInterval: 60000,
    });

  // NEW queries
  const { data: userDemographics, isLoading: isLoadingDemographics } =
    api.analytic.getUserDemographics.useQuery(timeRange, {
      refetchInterval: 60000,
    });

  const { data: tryoutInsights, isLoading: isLoadingTryoutInsights } =
    api.analytic.getTryoutInsights.useQuery(timeRange, {
      refetchInterval: 60000,
    });

  const { data: resourceBreakdown, isLoading: isLoadingResourceBreakdown } =
    api.analytic.getResourceCategoryBreakdown.useQuery(timeRange, {
      refetchInterval: 60000,
    });

  const { data: eventAnalytics, isLoading: isLoadingEvents } =
    api.analytic.getEventAnalytics.useQuery(timeRange, {
      refetchInterval: 60000,
    });

  const { data: formAnalytics, isLoading: isLoadingForms } =
    api.analytic.getFormAnalytics.useQuery(timeRange, {
      refetchInterval: 60000,
    });

  const { data: platformHealth, isLoading: isLoadingHealth } =
    api.analytic.getPlatformHealth.useQuery(timeRange, {
      refetchInterval: 60000,
    });

  // Transform data for charts
  const userRegistrationData = useMemo(() =>
    userActivity?.userRegistrations.map(item => ({
      date: item.createdAt,
      value: item._count.id,
    })) ?? [], [userActivity]);

  const learningActivityData = useMemo(() =>
    userActivity?.learningSessions.map(item => ({
      date: item.date,
      value: item._count.id,
    })) ?? [], [userActivity]);

  const tryoutAttemptsData = useMemo(() =>
    tryoutPerformance?.attemptsOverTime.map(item => ({
      date: item.startedAt,
      value: item._count.id,
    })) ?? [], [tryoutPerformance]);

  const documentViewsData = useMemo(() =>
    resourceAnalytics?.accessOverTime
      .filter(item => item.action === "VIEW")
      .map(item => ({
        date: item.accessedAt,
        value: item._count.id,
      })) ?? [], [resourceAnalytics]);

  const documentDownloadsData = useMemo(() =>
    resourceAnalytics?.accessOverTime
      .filter(item => item.action === "DOWNLOAD")
      .map(item => ({
        date: item.accessedAt,
        value: item._count.id,
      })) ?? [], [resourceAnalytics]);

  const formSubmissionsData = useMemo(() =>
    formAnalytics?.submissionsOverTime ?? [], [formAnalytics]);

  const handleExport = async () => {
    if (!overviewStats) return;

    setIsExporting(true);
    try {
      await exportAnalyticsData({
        timeRange,
        overviewStats,
        userActivity,
        tryoutPerformance,
        resourceAnalytics,
        courseAnalytics,
        userDemographics,
        tryoutInsights,
        resourceBreakdown,
        eventAnalytics,
        formAnalytics,
        platformHealth,
      });
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const isLoading =
    isLoadingOverview ||
    isLoadingActivity ||
    isLoadingTryouts ||
    isLoadingDocuments ||
    isLoadingCourses ||
    isLoadingDemographics ||
    isLoadingTryoutInsights ||
    isLoadingResourceBreakdown ||
    isLoadingEvents ||
    isLoadingForms ||
    isLoadingHealth;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading comprehensive analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive insights from {format(timeRange.from, "MMM dd, yyyy")} to {format(timeRange.to, "MMM dd, yyyy")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <TimeRangePicker value={timeRange} onChange={setTimeRange} />
          <Button
            onClick={handleExport}
            disabled={isExporting || isLoading}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 h-auto">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="tryouts" className="gap-2">
            <Award className="h-4 w-4" />
            Tryouts
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2">
            <FileText className="h-4 w-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="health" className="gap-2">
            <Activity className="h-4 w-4" />
            Health
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Users"
              value={overviewStats?.totalUsers ?? 0}
              change={overviewStats?.userGrowthRate ?? 0}
              changeLabel="vs previous period"
              icon={Users}
              trend={overviewStats?.userGrowthRate ?? 0 >= 0 ? "up" : "down"}
            />
            <MetricCard
              title="Active Courses"
              value={overviewStats?.activeCourses ?? 0}
              subtitle={`${overviewStats?.totalCourses ?? 0} total`}
              icon={BookOpen}
            />
            <MetricCard
              title="Platform Health"
              value={`${platformHealth?.stickiness ?? 0}%`}
              subtitle="Stickiness (DAU/MAU)"
              icon={Activity}
              trend={platformHealth?.stickiness ?? 0 >= 20 ? "up" : "down"}
            />
            <MetricCard
              title="Avg Session"
              value={`${platformHealth?.averageSessionDuration ?? 0}min`}
              subtitle="Per learning session"
              icon={Clock}
            />
          </div>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ComparisonCard
              title="Events"
              primaryValue={overviewStats?.totalEvents ?? 0}
              primaryLabel="Total"
              secondaryValue={overviewStats?.upcomingEvents ?? 0}
              secondaryLabel="Upcoming"
              icon={Calendar}
            />
            <ComparisonCard
              title="Scholarships"
              primaryValue={overviewStats?.totalScholarships ?? 0}
              primaryLabel="Total"
              secondaryValue={overviewStats?.activeScholarships ?? 0}
              secondaryLabel="Active"
              icon={Award}
            />
            <ComparisonCard
              title="Resources"
              primaryValue={overviewStats?.totalResources ?? 0}
              primaryLabel="Available"
              secondaryValue={resourceAnalytics?.resourceStats.length ?? 0}
              secondaryLabel="Active"
              icon={FileText}
            />
          </div>

          {/* Platform Activity Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Activity Trends</CardTitle>
              <CardDescription>
                Track user registrations, learning sessions, and tryout attempts over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MultiLineChart
                title=""
                series={[
                  {
                    key: "registrations",
                    name: "New Users",
                    color: "#3b82f6",
                    data: userRegistrationData,
                  },
                  {
                    key: "sessions",
                    name: "Learning Sessions",
                    color: "#10b981",
                    data: learningActivityData,
                  },
                  {
                    key: "attempts",
                    name: "Tryout Attempts",
                    color: "#f59e0b",
                    data: tryoutAttemptsData,
                  },
                ]}
                height={400}
              />
            </CardContent>
          </Card>

          {/* Recent Activity Highlights */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New Users</span>
                  <Badge variant="secondary">{overviewStats?.newUsers ?? 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tryout Attempts</span>
                  <Badge variant="secondary">
                    {tryoutPerformance?.attemptsOverTime.reduce((sum, item) => sum + item._count.id, 0) ?? 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Form Submissions</span>
                  <Badge variant="secondary">{overviewStats?.totalFormSubmissions ?? 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Event RSVPs</span>
                  <Badge variant="secondary">{overviewStats?.totalRSVPs ?? 0}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">DAU</span>
                    <span className="font-medium">{platformHealth?.dailyActiveUsers ?? 0}</span>
                  </div>
                  <Progress value={(platformHealth?.dailyActiveUsers ?? 0) / Math.max(overviewStats?.totalUsers ?? 1, 1) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">WAU</span>
                    <span className="font-medium">{platformHealth?.weeklyActiveUsers ?? 0}</span>
                  </div>
                  <Progress value={(platformHealth?.weeklyActiveUsers ?? 0) / Math.max(overviewStats?.totalUsers ?? 1, 1) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">MAU</span>
                    <span className="font-medium">{platformHealth?.monthlyActiveUsers ?? 0}</span>
                  </div>
                  <Progress value={(platformHealth?.monthlyActiveUsers ?? 0) / Math.max(overviewStats?.totalUsers ?? 1, 1) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Retention Rate</p>
                    <p className="text-xs text-muted-foreground">User comeback rate</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{platformHealth?.retentionRate ?? 0}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Avg Rating</p>
                    <p className="text-xs text-muted-foreground">Course testimonials</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{overviewStats?.averageTestimonialRating?.toFixed(1) ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* USERS TAB */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={overviewStats?.totalUsers ?? 0}
              description="All registered users"
              icon={Users}
            />
            <StatCard
              title="New Users"
              value={overviewStats?.newUsers ?? 0}
              description={`+${overviewStats?.userGrowthRate ?? 0}% growth`}
              icon={TrendingUp}
            />
            <StatCard
              title="Daily Active"
              value={platformHealth?.dailyActiveUsers ?? 0}
              description="Last 24 hours"
              icon={Activity}
            />
            <StatCard
              title="Retention"
              value={`${platformHealth?.retentionRate ?? 0}%`}
              description="User comeback rate"
              icon={Target}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Registration Trend</CardTitle>
                <CardDescription>New user signups over time</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChartComponent
                  title=""
                  data={userRegistrationData}
                  color="#3b82f6"
                  height={350}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Activity</CardTitle>
                <CardDescription>Daily learning sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChartComponent
                  title=""
                  data={learningActivityData}
                  color="#10b981"
                  height={350}
                />
              </CardContent>
            </Card>
          </div>

          {/* User Demographics */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Faculty Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChartComponent
                  data={userDemographics?.facultyDistribution ?? []}
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChartComponent
                  data={userDemographics?.roleDistribution ?? []}
                  height={300}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Program Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userDemographics?.programDistribution.slice(0, 8).map((program, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground truncate">{program.name}</span>
                        <span className="font-medium">{program.value}</span>
                      </div>
                      <Progress
                        value={(program.value / Math.max(...userDemographics.programDistribution.map(p => p.value), 1)) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* COURSES TAB */}
        <TabsContent value="courses" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Total Courses"
              value={overviewStats?.totalCourses ?? 0}
              description="All courses"
              icon={BookOpen}
            />
            <StatCard
              title="Active Courses"
              value={overviewStats?.activeCourses ?? 0}
              description="Currently running"
              icon={Activity}
            />
            <StatCard
              title="Avg Engagement"
              value={`${Math.round((courseAnalytics?.reduce((sum, c) => sum + c.engagementRate, 0) ?? 0) / Math.max(courseAnalytics?.length ?? 1, 1))}%`}
              description="Across all courses"
              icon={Percent}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Course Performance Ranking</CardTitle>
              <CardDescription>Sorted by engagement rate and active learners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courseAnalytics
                  ?.sort((a, b) => b.engagementRate - a.engagementRate)
                  .slice(0, 15)
                  .map((course, index) => (
                    <div key={course.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{course.title}</p>
                          <Badge variant="outline" className="text-xs">{course.classCode}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{course.totalMembers} members</span>
                          <span>•</span>
                          <span>{course.activeLearners} active</span>
                          <span>•</span>
                          <span>{Math.round(course.totalDuration / 60)}h total</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-lg font-bold">{Math.round(course.engagementRate)}%</p>
                          <p className="text-xs text-muted-foreground">engagement</p>
                        </div>
                        <div className="w-20">
                          <Progress value={course.engagementRate} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TRYOUTS TAB */}
        <TabsContent value="tryouts" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Active Tryouts"
              value={overviewStats?.activeTryouts ?? 0}
              description={`${overviewStats?.totalTryouts} total`}
              icon={Award}
            />
            <StatCard
              title="Completion Rate"
              value={`${tryoutInsights?.completionRate ?? 0}%`}
              description="Of all attempts"
              icon={Target}
            />
            <StatCard
              title="Avg Attempts"
              value={tryoutInsights?.averageAttemptsPerUser ?? 0}
              description="Per user"
              icon={BarChart3}
            />
            <StatCard
              title="Total Attempts"
              value={tryoutPerformance?.attemptsOverTime.reduce((sum, item) => sum + item._count.id, 0) ?? 0}
              description="In period"
              icon={Activity}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tryout Attempts Over Time</CardTitle>
                <CardDescription>Daily attempt volume</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChartComponent
                  title=""
                  data={tryoutAttemptsData}
                  color="#f59e0b"
                  height={350}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Tryouts</CardTitle>
                <CardDescription>By average score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tryoutPerformance?.tryoutPerformance
                    .sort((a, b) => b.averageScore - a.averageScore)
                    .slice(0, 10)
                    .map((tryout) => (
                      <div key={tryout.id} className="flex items-center justify-between">
                        <div className="space-y-1 flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{tryout.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {tryout.totalAttempts} attempts
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-semibold">{tryout.averageScore.toFixed(1)}%</p>
                          </div>
                          <div className="w-20">
                            <Progress value={tryout.averageScore} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard - Top Performers</CardTitle>
              <CardDescription>Highest scoring attempts in selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tryoutInsights?.topPerformers.slice(0, 10).map((performer, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${index === 0 ? 'bg-yellow-500/20 text-yellow-700' :
                        index === 1 ? 'bg-gray-400/20 text-gray-700' :
                          index === 2 ? 'bg-orange-600/20 text-orange-700' :
                            'bg-muted text-muted-foreground'
                      }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{performer.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        {performer.nim} • {performer.tryoutTitle}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{performer.percentage}%</p>
                      <p className="text-xs text-muted-foreground">
                        {performer.score}/{performer.maxScore}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RESOURCES TAB */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Total Resources"
              value={overviewStats?.totalResources ?? 0}
              description="Available resources"
              icon={FileText}
            />
            <StatCard
              title="Total Views"
              value={resourceAnalytics?.accessOverTime.filter(a => a.action === "VIEW").reduce((sum, item) => sum + item._count.id, 0) ?? 0}
              description="In period"
              icon={Activity}
            />
            <StatCard
              title="Total Downloads"
              value={resourceAnalytics?.accessOverTime.filter(a => a.action === "DOWNLOAD").reduce((sum, item) => sum + item._count.id, 0) ?? 0}
              description="In period"
              icon={Download}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resource Activity</CardTitle>
                <CardDescription>Views vs Downloads over time</CardDescription>
              </CardHeader>
              <CardContent>
                <MultiLineChart
                  title=""
                  series={[
                    {
                      key: "views",
                      name: "Views",
                      color: "#3b82f6",
                      data: documentViewsData,
                    },
                    {
                      key: "downloads",
                      name: "Downloads",
                      color: "#10b981",
                      data: documentDownloadsData,
                    },
                  ]}
                  height={350}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChartComponent
                  data={resourceBreakdown?.categoryBreakdown ?? []}
                  height={350}
                />
              </CardContent>
            </Card>
          </div>

          {/* Most Accessed & Active Users */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Most Accessed Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resourceAnalytics?.resourceStats
                    .sort((a, b) => (b.views + b.downloads) - (a.views + a.downloads))
                    .slice(0, 10)
                    .map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1 flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{doc.title}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {doc.category ?? doc.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Views</p>
                            <p className="font-medium">{doc.views}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Downloads</p>
                            <p className="font-medium">{doc.downloads}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Active Users</CardTitle>
                <CardDescription>By resource access count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resourceBreakdown?.mostActiveUsers.map((user, index) => (
                    <div key={user.userId} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{user.userName}</p>
                        <p className="text-xs text-muted-foreground">{user.nim}</p>
                      </div>
                      <Badge variant="secondary">{user.accessCount} accesses</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* EVENTS TAB */}
        <TabsContent value="events" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="Total Events"
              value={overviewStats?.totalEvents ?? 0}
              description="In period"
              icon={Calendar}
            />
            <StatCard
              title="Upcoming"
              value={overviewStats?.upcomingEvents ?? 0}
              description="Future events"
              icon={TrendingUp}
            />
            <StatCard
              title="Total RSVPs"
              value={overviewStats?.totalRSVPs ?? 0}
              description="Responses"
              icon={Users}
            />
            <StatCard
              title="Attendance"
              value={overviewStats?.totalPresenceRecords ?? 0}
              description="Check-ins"
              icon={Activity}
            />
          </div>

          {/* Event Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Event Performance</CardTitle>
              <CardDescription>RSVP and attendance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventAnalytics?.eventDetails
                  .sort((a, b) => b.totalRSVPs - a.totalRSVPs)
                  .slice(0, 10)
                  .map((event) => (
                    <div key={event.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(event.start), "MMM dd, yyyy • HH:mm")}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{event.totalRSVPs} RSVPs ({event.yesRSVPs} yes)</span>
                          <span>•</span>
                          <span>{event.presentCount} present</span>
                          {event.lateCount > 0 && (
                            <>
                              <span>•</span>
                              <span>{event.lateCount} late</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{event.attendanceRate}%</p>
                        <p className="text-xs text-muted-foreground">attendance</p>
                        <Badge variant={event.eventMode === "BASIC" ? "outline" : "default"} className="mt-2 text-xs">
                          {event.eventMode.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* RSVP & Attendance Status */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>RSVP Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {eventAnalytics?.rsvpStatusBreakdown.map((item) => (
                    <div key={item.status} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.status}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                      <Progress
                        value={(item.count / Math.max(...(eventAnalytics.rsvpStatusBreakdown.map(i => i.count)), 1)) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {eventAnalytics?.attendanceStatusBreakdown.map((item) => (
                    <div key={item.status} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.status.replace(/_/g, ' ')}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                      <Progress
                        value={(item.count / Math.max(...(eventAnalytics.attendanceStatusBreakdown.map(i => i.count)), 1)) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Forms Section */}
          {formAnalytics && formAnalytics.formStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Form Submissions</CardTitle>
                <CardDescription>Active forms and submission trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formAnalytics.formStats
                    .sort((a, b) => b.totalSubmissions - a.totalSubmissions)
                    .slice(0, 8)
                    .map((form) => (
                      <div key={form.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{form.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={form.isPublished ? "default" : "secondary"} className="text-xs">
                              {form.isPublished ? "Published" : "Draft"}
                            </Badge>
                            {form.isActive && (
                              <Badge variant="outline" className="text-xs">Active</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{form.totalSubmissions}</p>
                          <p className="text-xs text-muted-foreground">
                            {form.recentSubmissions} recent
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* PLATFORM HEALTH TAB */}
        <TabsContent value="health" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Stickiness"
              value={`${platformHealth?.stickiness ?? 0}%`}
              subtitle="DAU/MAU Ratio"
              icon={Activity}
              trend={platformHealth?.stickiness ?? 0 >= 20 ? "up" : "down"}
            />
            <MetricCard
              title="Retention Rate"
              value={`${platformHealth?.retentionRate ?? 0}%`}
              subtitle="Users who return"
              icon={Target}
              trend={platformHealth?.retentionRate ?? 0 >= 40 ? "up" : "down"}
            />
            <MetricCard
              title="Avg Session"
              value={`${platformHealth?.averageSessionDuration ?? 0}min`}
              subtitle="Per learning session"
              icon={Clock}
            />
          </div>

          {/* Active Users Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Active Users Breakdown</CardTitle>
              <CardDescription>Daily, weekly, and monthly active users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Daily Active Users (DAU)</p>
                      <p className="text-xs text-muted-foreground">Last 24 hours</p>
                    </div>
                    <p className="text-2xl font-bold">{platformHealth?.dailyActiveUsers ?? 0}</p>
                  </div>
                  <Progress
                    value={(platformHealth?.dailyActiveUsers ?? 0) / Math.max(overviewStats?.totalUsers ?? 1, 1) * 100}
                    className="h-3"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Weekly Active Users (WAU)</p>
                      <p className="text-xs text-muted-foreground">Last 7 days</p>
                    </div>
                    <p className="text-2xl font-bold">{platformHealth?.weeklyActiveUsers ?? 0}</p>
                  </div>
                  <Progress
                    value={(platformHealth?.weeklyActiveUsers ?? 0) / Math.max(overviewStats?.totalUsers ?? 1, 1) * 100}
                    className="h-3"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Monthly Active Users (MAU)</p>
                      <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </div>
                    <p className="text-2xl font-bold">{platformHealth?.monthlyActiveUsers ?? 0}</p>
                  </div>
                  <Progress
                    value={(platformHealth?.monthlyActiveUsers ?? 0) / Math.max(overviewStats?.totalUsers ?? 1, 1) * 100}
                    className="h-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Indicators */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">User Growth Rate</p>
                    <p className="text-xs text-muted-foreground">Period over period</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(overviewStats?.userGrowthRate ?? 0) >= 0 ? (
                      <ArrowUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-lg font-bold ${(overviewStats?.userGrowthRate ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {Math.abs(overviewStats?.userGrowthRate ?? 0)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Platform Stickiness</p>
                    <p className="text-xs text-muted-foreground">DAU/MAU ratio</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(platformHealth?.stickiness ?? 0) >= 20 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-amber-600" />
                    )}
                    <span className="text-lg font-bold">{platformHealth?.stickiness ?? 0}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Tryout Completion</p>
                    <p className="text-xs text-muted-foreground">Of all attempts</p>
                  </div>
                  <span className="text-lg font-bold">{tryoutInsights?.completionRate ?? 0}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Retention Rate</p>
                    <p className="text-xs text-muted-foreground">Users returning</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(platformHealth?.retentionRate ?? 0) >= 40 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-amber-600" />
                    )}
                    <span className="text-lg font-bold">{platformHealth?.retentionRate ?? 0}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Course Satisfaction</p>
                    <p className="text-xs text-muted-foreground">Average rating</p>
                  </div>
                  <span className="text-lg font-bold">
                    {overviewStats?.averageTestimonialRating?.toFixed(1) ?? 0} / 5.0
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Event Attendance</p>
                    <p className="text-xs text-muted-foreground">Average rate</p>
                  </div>
                  <span className="text-lg font-bold">
                    {Math.round((eventAnalytics?.eventDetails.reduce((sum, e) => sum + e.attendanceRate, 0) ?? 0) /
                      Math.max(eventAnalytics?.eventDetails.length ?? 1, 1))}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
