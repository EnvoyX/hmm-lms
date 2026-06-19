// ~/lib/utils/export-analytics.ts (UPDATED)
import * as XLSX from "xlsx";
import { format } from "date-fns";
import type { TimeRange } from "~/lib/types/analytics";

interface OverviewStats {
  totalUsers: number;
  newUsers: number;
  userGrowthRate: number;
  totalCourses: number;
  activeCourses: number;
  totalTryouts: number;
  activeTryouts: number;
  totalResources: number;
  totalEvents: number;
  upcomingEvents: number;
  totalAnnouncements: number;
  totalScholarships: number;
  activeScholarships: number;
  totalJobVacancies: number;
  activeJobVacancies: number;
  totalFormSubmissions: number;
  totalRSVPs: number;
  totalPresenceRecords: number;
  averageTestimonialRating: number;
}

interface UserActivity {
  userRegistrations: Array<{ createdAt: string; _count: { id: number } }>;
  learningSessions: Array<{
    date: string;
    _count: { id: number };
    _sum: { duration: number | null };
  }>;
}

interface TryoutPerformance {
  tryoutPerformance: Array<{
    id: string;
    title: string;
    totalAttempts: number;
    averageScore: number;
  }>;
  attemptsOverTime: Array<{ startedAt: string; _count: { id: number } }>;
}

interface ResourceAnalytics {
  resourceStats: Array<{
    id: string;
    title: string;
    type: string;
    category: string | null;
    views: number;
    downloads: number;
  }>;
  accessOverTime: Array<{
    accessedAt: string;
    action: string;
    _count: { id: number };
  }>;
}

interface CourseAnalytics {
  id: string;
  title: string;
  classCode: string;
  totalMembers: number;
  activeLearners: number;
  engagementRate: number;
  avgDurationPerMember: number;
  totalDuration: number;
}

interface UserDemographics {
  facultyDistribution: Array<{ name: string; value: number }>;
  roleDistribution: Array<{ name: string; value: number }>;
  programDistribution: Array<{ name: string; value: number }>;
}

interface TryoutInsights {
  completionRate: number;
  averageAttemptsPerUser: number;
  topPerformers: Array<{
    userName: string;
    nim: string;
    tryoutTitle: string;
    score: number;
    maxScore: number;
    percentage: number;
  }>;
}

interface ResourceBreakdown {
  categoryBreakdown: Array<{ name: string; value: number }>;
  typeBreakdown: Array<{ name: string; value: number }>;
  mostActiveUsers: Array<{
    userId: string;
    userName: string;
    nim: string;
    accessCount: number;
  }>;
}

interface EventAnalytics {
  eventDetails: Array<{
    id: string;
    title: string;
    start: string;
    eventMode: string;
    totalRSVPs: number;
    yesRSVPs: number;
    totalPresence: number;
    presentCount: number;
    lateCount: number;
    attendanceRate: number;
  }>;
  rsvpStatusBreakdown: Array<{ status: string; count: number }>;
  attendanceStatusBreakdown: Array<{ status: string; count: number }>;
}

interface FormAnalytics {
  formStats: Array<{
    id: string;
    title: string;
    isPublished: boolean;
    isActive: boolean;
    totalSubmissions: number;
    recentSubmissions: number;
  }>;
  submissionsOverTime: Array<{ date: string; value: number }>;
}

interface PlatformHealth {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  stickiness: number;
  averageSessionDuration: number;
  retentionRate: number;
}

interface ExportData {
  timeRange: TimeRange;
  overviewStats: OverviewStats;
  userActivity: UserActivity | undefined;
  tryoutPerformance: TryoutPerformance | undefined;
  resourceAnalytics: ResourceAnalytics | undefined;
  courseAnalytics: CourseAnalytics[] | undefined;
  userDemographics: UserDemographics | undefined;
  tryoutInsights: TryoutInsights | undefined;
  resourceBreakdown: ResourceBreakdown | undefined;
  eventAnalytics: EventAnalytics | undefined;
  formAnalytics: FormAnalytics | undefined;
  platformHealth: PlatformHealth | undefined;
}

export async function exportAnalyticsData(data: ExportData) {
  const workbook = XLSX.utils.book_new();

  // ==================== OVERVIEW SHEET ====================
  const overviewData = [
    ["ANALYTICS EXPORT REPORT"],
    [""],
    ["Export Information"],
    ["Export Date", format(new Date(), "yyyy-MM-dd HH:mm:ss")],
    ["Period From", format(data.timeRange.from, "yyyy-MM-dd")],
    ["Period To", format(data.timeRange.to, "yyyy-MM-dd")],
    [""],
    ["Key Metrics"],
    ["Metric", "Value", "Additional Info"],
    ["Total Users", data.overviewStats.totalUsers, ""],
    [
      "New Users",
      data.overviewStats.newUsers,
      `${data.overviewStats.userGrowthRate >= 0 ? "+" : ""}${data.overviewStats.userGrowthRate}% growth`,
    ],
    ["Total Courses", data.overviewStats.totalCourses, ""],
    ["Active Courses", data.overviewStats.activeCourses, ""],
    ["Total Tryouts", data.overviewStats.totalTryouts, ""],
    ["Active Tryouts", data.overviewStats.activeTryouts, ""],
    ["Total Resources", data.overviewStats.totalResources, ""],
    ["Total Events", data.overviewStats.totalEvents, ""],
    ["Upcoming Events", data.overviewStats.upcomingEvents, ""],
    ["Total Announcements", data.overviewStats.totalAnnouncements, ""],
    ["Total Scholarships", data.overviewStats.totalScholarships, ""],
    ["Active Scholarships", data.overviewStats.activeScholarships, ""],
    ["Total Job Vacancies", data.overviewStats.totalJobVacancies, ""],
    ["Active Job Vacancies", data.overviewStats.activeJobVacancies, ""],
    ["Total Form Submissions", data.overviewStats.totalFormSubmissions, ""],
    ["Total RSVPs", data.overviewStats.totalRSVPs, ""],
    ["Total Presence Records", data.overviewStats.totalPresenceRecords, ""],
    [
      "Average Course Rating",
      data.overviewStats.averageTestimonialRating.toFixed(2),
      "out of 5.0",
    ],
  ];
  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);

  // Apply column widths
  overviewSheet["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 25 }];

  XLSX.utils.book_append_sheet(workbook, overviewSheet, "Overview");

  // ==================== PLATFORM HEALTH SHEET ====================
  if (data.platformHealth) {
    const healthData = [
      ["PLATFORM HEALTH METRICS"],
      [""],
      ["Metric", "Value", "Description"],
      [
        "Daily Active Users (DAU)",
        data.platformHealth.dailyActiveUsers,
        "Last 24 hours",
      ],
      [
        "Weekly Active Users (WAU)",
        data.platformHealth.weeklyActiveUsers,
        "Last 7 days",
      ],
      [
        "Monthly Active Users (MAU)",
        data.platformHealth.monthlyActiveUsers,
        "Last 30 days",
      ],
      [
        "Stickiness (DAU/MAU)",
        `${data.platformHealth.stickiness}%`,
        "Engagement ratio",
      ],
      [
        "Average Session Duration",
        `${data.platformHealth.averageSessionDuration} minutes`,
        "Per learning session",
      ],
      [
        "Retention Rate",
        `${data.platformHealth.retentionRate}%`,
        "Users who return after signup",
      ],
      [""],
      ["Health Status Indicators"],
      ["Indicator", "Status", "Benchmark"],
      [
        "Stickiness",
        data.platformHealth.stickiness >= 20 ? "Good" : "Needs Improvement",
        "≥20% is healthy",
      ],
      [
        "Retention",
        data.platformHealth.retentionRate >= 40 ? "Good" : "Needs Improvement",
        "≥40% is healthy",
      ],
    ];
    const healthSheet = XLSX.utils.aoa_to_sheet(healthData);
    healthSheet["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, healthSheet, "Platform Health");
  }

  // ==================== USER REGISTRATIONS SHEET ====================
  if (data.userActivity) {
    const userRegistrationsData = [
      ["USER REGISTRATIONS OVER TIME"],
      [""],
      ["Date", "New Users"],
      ...data.userActivity.userRegistrations.map((item) => [
        format(new Date(item.createdAt), "yyyy-MM-dd"),
        item._count.id,
      ]),
      [""],
      ["Summary Statistics"],
      [
        "Total New Users",
        data.userActivity.userRegistrations.reduce(
          (sum, item) => sum + item._count.id,
          0
        ),
      ],
      [
        "Average per Day",
        Math.round(
          data.userActivity.userRegistrations.reduce(
            (sum, item) => sum + item._count.id,
            0
          ) / Math.max(data.userActivity.userRegistrations.length, 1)
        ),
      ],
    ];
    const userRegistrationsSheet = XLSX.utils.aoa_to_sheet(
      userRegistrationsData
    );
    userRegistrationsSheet["!cols"] = [{ wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(
      workbook,
      userRegistrationsSheet,
      "User Registrations"
    );
  }

  // ==================== USER DEMOGRAPHICS SHEET ====================
  if (data.userDemographics) {
    const demographicsData = [
      ["USER DEMOGRAPHICS"],
      [""],
      ["Faculty Distribution"],
      ["Faculty", "Count", "Percentage"],
      ...data.userDemographics.facultyDistribution.map((item) => {
        const total = data.userDemographics!.facultyDistribution.reduce(
          (sum, f) => sum + f.value,
          0
        );
        return [
          item.name,
          item.value,
          `${Math.round((item.value / total) * 100)}%`,
        ];
      }),
      [""],
      ["Role Distribution"],
      ["Role", "Count", "Percentage"],
      ...data.userDemographics.roleDistribution.map((item) => {
        const total = data.userDemographics!.roleDistribution.reduce(
          (sum, r) => sum + r.value,
          0
        );
        return [
          item.name,
          item.value,
          `${Math.round((item.value / total) * 100)}%`,
        ];
      }),
      [""],
      ["Program Distribution"],
      ["Program", "Count", "Percentage"],
      ...data.userDemographics.programDistribution.map((item) => {
        const total = data.userDemographics!.programDistribution.reduce(
          (sum, p) => sum + p.value,
          0
        );
        return [
          item.name,
          item.value,
          `${Math.round((item.value / total) * 100)}%`,
        ];
      }),
    ];
    const demographicsSheet = XLSX.utils.aoa_to_sheet(demographicsData);
    demographicsSheet["!cols"] = [{ wch: 25 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(
      workbook,
      demographicsSheet,
      "User Demographics"
    );
  }

  // ==================== LEARNING SESSIONS SHEET ====================
  if (data.userActivity) {
    const learningSessionsData = [
      ["LEARNING SESSIONS OVER TIME"],
      [""],
      ["Date", "Sessions", "Total Duration (minutes)", "Avg Duration (minutes)"],
      ...data.userActivity.learningSessions.map((item) => [
        format(new Date(item.date), "yyyy-MM-dd"),
        item._count.id,
        item._sum.duration ?? 0,
        item._count.id > 0
          ? Math.round((item._sum.duration ?? 0) / item._count.id)
          : 0,
      ]),
      [""],
      ["Summary Statistics"],
      [
        "Total Sessions",
        data.userActivity.learningSessions.reduce(
          (sum, item) => sum + item._count.id,
          0
        ),
      ],
      [
        "Total Duration (hours)",
        Math.round(
          data.userActivity.learningSessions.reduce(
            (sum, item) => sum + (item._sum.duration ?? 0),
            0
          ) / 60
        ),
      ],
      [
        "Average Session Duration",
        `${Math.round(
          data.userActivity.learningSessions.reduce(
            (sum, item) => sum + (item._sum.duration ?? 0),
            0
          ) /
          Math.max(
            data.userActivity.learningSessions.reduce(
              (sum, item) => sum + item._count.id,
              0
            ),
            1
          )
        )} minutes`,
      ],
    ];
    const learningSessionsSheet = XLSX.utils.aoa_to_sheet(
      learningSessionsData
    );
    learningSessionsSheet["!cols"] = [
      { wch: 15 },
      { wch: 12 },
      { wch: 25 },
      { wch: 25 },
    ];
    XLSX.utils.book_append_sheet(
      workbook,
      learningSessionsSheet,
      "Learning Sessions"
    );
  }

  // ==================== COURSE ANALYTICS SHEET ====================
  if (data.courseAnalytics && data.courseAnalytics.length > 0) {
    const courseAnalyticsData = [
      ["COURSE ANALYTICS"],
      [""],
      [
        "Course Title",
        "Class Code",
        "Total Members",
        "Active Learners",
        "Engagement Rate (%)",
        "Avg Duration per Member (min)",
        "Total Duration (min)",
        "Total Duration (hours)",
      ],
      ...data.courseAnalytics
        .sort((a, b) => b.engagementRate - a.engagementRate)
        .map((item) => [
          item.title,
          item.classCode,
          item.totalMembers,
          item.activeLearners,
          Math.round(item.engagementRate * 100) / 100,
          item.avgDurationPerMember,
          item.totalDuration,
          Math.round((item.totalDuration / 60) * 10) / 10,
        ]),
      [""],
      ["Summary Statistics"],
      ["Total Courses", data.courseAnalytics.length],
      [
        "Average Engagement Rate",
        `${Math.round(
          (data.courseAnalytics.reduce(
            (sum, c) => sum + c.engagementRate,
            0
          ) /
            data.courseAnalytics.length) *
          100
        ) / 100}%`,
      ],
      [
        "Total Members Across All Courses",
        data.courseAnalytics.reduce((sum, c) => sum + c.totalMembers, 0),
      ],
      [
        "Total Active Learners",
        data.courseAnalytics.reduce((sum, c) => sum + c.activeLearners, 0),
      ],
    ];
    const courseAnalyticsSheet = XLSX.utils.aoa_to_sheet(courseAnalyticsData);
    courseAnalyticsSheet["!cols"] = [
      { wch: 30 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 28 },
      { wch: 20 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(
      workbook,
      courseAnalyticsSheet,
      "Course Analytics"
    );
  }

  // ==================== TRYOUT PERFORMANCE SHEET ====================
  if (data.tryoutPerformance) {
    const tryoutPerformanceData = [
      ["TRYOUT PERFORMANCE"],
      [""],
      ["Tryout Title", "Total Attempts", "Average Score (%)", "Performance Rating"],
      ...data.tryoutPerformance.tryoutPerformance
        .sort((a, b) => b.averageScore - a.averageScore)
        .map((item) => [
          item.title,
          item.totalAttempts,
          Math.round(item.averageScore * 100) / 100,
          item.averageScore >= 80
            ? "Excellent"
            : item.averageScore >= 60
              ? "Good"
              : item.averageScore >= 40
                ? "Fair"
                : "Needs Improvement",
        ]),
    ];
    const tryoutPerformanceSheet = XLSX.utils.aoa_to_sheet(
      tryoutPerformanceData
    );
    tryoutPerformanceSheet["!cols"] = [
      { wch: 35 },
      { wch: 15 },
      { wch: 18 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(
      workbook,
      tryoutPerformanceSheet,
      "Tryout Performance"
    );
  }

  // ==================== TRYOUT INSIGHTS SHEET ====================
  if (data.tryoutInsights) {
    const tryoutInsightsData = [
      ["TRYOUT INSIGHTS & TOP PERFORMERS"],
      [""],
      ["Key Metrics"],
      ["Metric", "Value"],
      ["Completion Rate", `${data.tryoutInsights.completionRate}%`],
      [
        "Average Attempts per User",
        data.tryoutInsights.averageAttemptsPerUser,
      ],
      [""],
      ["Top Performers"],
      [
        "Rank",
        "Student Name",
        "NIM",
        "Tryout",
        "Score",
        "Max Score",
        "Percentage",
      ],
      ...data.tryoutInsights.topPerformers.map((performer, index) => [
        index + 1,
        performer.userName,
        performer.nim,
        performer.tryoutTitle,
        performer.score,
        performer.maxScore,
        `${performer.percentage}%`,
      ]),
    ];
    const tryoutInsightsSheet = XLSX.utils.aoa_to_sheet(tryoutInsightsData);
    tryoutInsightsSheet["!cols"] = [
      { wch: 8 },
      { wch: 25 },
      { wch: 15 },
      { wch: 30 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(
      workbook,
      tryoutInsightsSheet,
      "Tryout Insights"
    );
  }

  // ==================== RESOURCE ANALYTICS SHEET ====================
  if (data.resourceAnalytics) {
    const documentAnalyticsData = [
      ["RESOURCE ANALYTICS"],
      [""],
      [
        "Resource Title",
        "Type",
        "Category",
        "Views",
        "Downloads",
        "Total Access",
        "Popularity Score",
      ],
      ...data.resourceAnalytics.resourceStats
        .sort((a, b) => b.views + b.downloads - (a.views + a.downloads))
        .map((item) => {
          const totalAccess = item.views + item.downloads;
          return [
            item.title,
            item.type,
            item.category ?? "N/A",
            item.views,
            item.downloads,
            totalAccess,
            totalAccess >= 100
              ? "Very High"
              : totalAccess >= 50
                ? "High"
                : totalAccess >= 20
                  ? "Medium"
                  : "Low",
          ];
        }),
      [""],
      ["Summary Statistics"],
      [
        "Total Resources",
        data.resourceAnalytics.resourceStats.length,
      ],
      [
        "Total Views",
        data.resourceAnalytics.resourceStats.reduce(
          (sum, item) => sum + item.views,
          0
        ),
      ],
      [
        "Total Downloads",
        data.resourceAnalytics.resourceStats.reduce(
          (sum, item) => sum + item.downloads,
          0
        ),
      ],
      [
        "Total Accesses",
        data.resourceAnalytics.resourceStats.reduce(
          (sum, item) => sum + item.views + item.downloads,
          0
        ),
      ],
    ];
    const documentAnalyticsSheet = XLSX.utils.aoa_to_sheet(
      documentAnalyticsData
    );
    documentAnalyticsSheet["!cols"] = [
      { wch: 35 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(
      workbook,
      documentAnalyticsSheet,
      "Resource Analytics"
    );
  }

  // ==================== RESOURCE BREAKDOWN SHEET ====================
  if (data.resourceBreakdown) {
    const resourceBreakdownData = [
      ["RESOURCE CATEGORY BREAKDOWN"],
      [""],
      ["Category Distribution"],
      ["Category", "Count", "Percentage"],
      ...data.resourceBreakdown.categoryBreakdown.map((item) => {
        const total = data.resourceBreakdown!.categoryBreakdown.reduce(
          (sum, c) => sum + c.value,
          0
        );
        return [
          item.name,
          item.value,
          `${Math.round((item.value / total) * 100)}%`,
        ];
      }),
      [""],
      ["Type Distribution"],
      ["Type", "Count", "Percentage"],
      ...data.resourceBreakdown.typeBreakdown.map((item) => {
        const total = data.resourceBreakdown!.typeBreakdown.reduce(
          (sum, t) => sum + t.value,
          0
        );
        return [
          item.name,
          item.value,
          `${Math.round((item.value / total) * 100)}%`,
        ];
      }),
      [""],
      ["Most Active Users"],
      ["Rank", "Student Name", "NIM", "Access Count"],
      ...data.resourceBreakdown.mostActiveUsers.map((user, index) => [
        index + 1,
        user.userName,
        user.nim,
        user.accessCount,
      ]),
    ];
    const resourceBreakdownSheet = XLSX.utils.aoa_to_sheet(
      resourceBreakdownData
    );
    resourceBreakdownSheet["!cols"] = [
      { wch: 25 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(
      workbook,
      resourceBreakdownSheet,
      "Resource Breakdown"
    );
  }

  // ==================== EVENT ANALYTICS SHEET ====================
  if (data.eventAnalytics) {
    const eventAnalyticsData = [
      ["EVENT ANALYTICS"],
      [""],
      [
        "Event Title",
        "Start Date",
        "Event Mode",
        "Total RSVPs",
        "Yes RSVPs",
        "Total Presence",
        "Present",
        "Late",
        "Attendance Rate (%)",
      ],
      ...data.eventAnalytics.eventDetails
        .sort((a, b) => b.attendanceRate - a.attendanceRate)
        .map((event) => [
          event.title,
          format(new Date(event.start), "yyyy-MM-dd HH:mm"),
          event.eventMode.replace(/_/g, " "),
          event.totalRSVPs,
          event.yesRSVPs,
          event.totalPresence,
          event.presentCount,
          event.lateCount,
          event.attendanceRate,
        ]),
      [""],
      ["RSVP Status Breakdown"],
      ["Status", "Count"],
      ...data.eventAnalytics.rsvpStatusBreakdown.map((item) => [
        item.status,
        item.count,
      ]),
      [""],
      ["Attendance Status Breakdown"],
      ["Status", "Count"],
      ...data.eventAnalytics.attendanceStatusBreakdown.map((item) => [
        item.status.replace(/_/g, " "),
        item.count,
      ]),
    ];
    const eventAnalyticsSheet = XLSX.utils.aoa_to_sheet(eventAnalyticsData);
    eventAnalyticsSheet["!cols"] = [
      { wch: 30 },
      { wch: 18 },
      { wch: 20 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 10 },
      { wch: 8 },
      { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(
      workbook,
      eventAnalyticsSheet,
      "Event Analytics"
    );
  }

  // ==================== FORM ANALYTICS SHEET ====================
  if (data.formAnalytics && data.formAnalytics.formStats.length > 0) {
    const formAnalyticsData = [
      ["FORM ANALYTICS"],
      [""],
      [
        "Form Title",
        "Status",
        "Active",
        "Total Submissions",
        "Recent Submissions",
      ],
      ...data.formAnalytics.formStats
        .sort((a, b) => b.totalSubmissions - a.totalSubmissions)
        .map((form) => [
          form.title,
          form.isPublished ? "Published" : "Draft",
          form.isActive ? "Yes" : "No",
          form.totalSubmissions,
          form.recentSubmissions,
        ]),
      [""],
      ["Summary Statistics"],
      ["Total Forms", data.formAnalytics.formStats.length],
      [
        "Published Forms",
        data.formAnalytics.formStats.filter((f) => f.isPublished).length,
      ],
      [
        "Active Forms",
        data.formAnalytics.formStats.filter((f) => f.isActive).length,
      ],
      [
        "Total Submissions",
        data.formAnalytics.formStats.reduce(
          (sum, f) => sum + f.totalSubmissions,
          0
        ),
      ],
    ];
    const formAnalyticsSheet = XLSX.utils.aoa_to_sheet(formAnalyticsData);
    formAnalyticsSheet["!cols"] = [
      { wch: 35 },
      { wch: 12 },
      { wch: 10 },
      { wch: 20 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(
      workbook,
      formAnalyticsSheet,
      "Form Analytics"
    );
  }

  // ==================== ACTIVITY TIMELINE SHEET ====================
  const timelineData = [
    ["ACTIVITY TIMELINE"],
    [""],
    ["Date", "User Registrations", "Learning Sessions", "Tryout Attempts"],
  ];

  // Combine all activity data by date
  const dateMap = new Map<string, { registrations: number; sessions: number; attempts: number }>();

  if (data.userActivity) {
    data.userActivity.userRegistrations.forEach((item) => {
      const date = format(new Date(item.createdAt), "yyyy-MM-dd");
      if (!dateMap.has(date)) {
        dateMap.set(date, { registrations: 0, sessions: 0, attempts: 0 });
      }
      dateMap.get(date)!.registrations += item._count.id;
    });

    data.userActivity.learningSessions.forEach((item) => {
      const date = format(new Date(item.date), "yyyy-MM-dd");
      if (!dateMap.has(date)) {
        dateMap.set(date, { registrations: 0, sessions: 0, attempts: 0 });
      }
      dateMap.get(date)!.sessions += item._count.id;
    });
  }

  if (data.tryoutPerformance) {
    data.tryoutPerformance.attemptsOverTime.forEach((item) => {
      const date = format(new Date(item.startedAt), "yyyy-MM-dd");
      if (!dateMap.has(date)) {
        dateMap.set(date, { registrations: 0, sessions: 0, attempts: 0 });
      }
      dateMap.get(date)!.attempts += item._count.id;
    });
  }

  // Sort by date and add to sheet
  const sortedDates = Array.from(dateMap.entries()).sort(
    ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
  );

  sortedDates.forEach(([date, data]) => {
    timelineData.push([date, data.registrations.toString(), data.sessions.toString(), data.attempts.toString()]);
  });

  const timelineSheet = XLSX.utils.aoa_to_sheet(timelineData);
  timelineSheet["!cols"] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(workbook, timelineSheet, "Activity Timeline");

  // ==================== GENERATE & DOWNLOAD ====================
  const filename = `comprehensive-analytics-${format(
    data.timeRange.from,
    "yyyy-MM-dd"
  )}-to-${format(data.timeRange.to, "yyyy-MM-dd")}.xlsx`;

  // Write the file
  XLSX.writeFile(workbook, filename);
}
