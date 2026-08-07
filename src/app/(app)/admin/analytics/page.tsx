// ~/app/(admin)/admin/analytics/page.tsx
import { Suspense } from "react";
import { AnalyticsContent } from './analytics-content';
import { AnalyticsSkeleton } from './analytics-skeleton';

export default function AdminAnalyticsPage() {
  return (
    <div className="">
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}

export const metadata = {
  title: "Analytics",
  description: "Comprehensive analytics and insights for the platform",
};
