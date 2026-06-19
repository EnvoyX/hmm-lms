// ~/lib/types/analytics.ts
export interface OverviewStats {
  totalUsers: number;
  newUsers: number;
  totalCourses: number;
  activeCourses: number;
  totalTryouts: number;
  activeTryouts: number;
  totalResources: number;
  totalEvents: number;
  totalAnnouncements: number;
  totalScholarships: number;
  totalJobVacancies: number;
}

export interface TimeRange {
  from: Date;
  to: Date;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TryoutPerformanceData {
  id: string;
  title: string;
  totalAttempts: number;
  averageScore: number;
}

export interface DocumentAnalyticsData {
  id: string;
  title: string;
  type: string;
  views: number;
  downloads: number;
  recentViews: number;
  recentDownloads: number;
}

export interface CourseAnalyticsData {
  id: string;
  title: string;
  classCode: string;
  totalMembers: number;
  activeLearners: number;
  engagementRate: number;
  avgDurationPerMember: number;
  totalDuration: number;
}
