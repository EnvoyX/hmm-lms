// ~/app/(admin)/admin/loker/page.tsx
import { Suspense } from "react";
import { AdminJobVacancyList } from './loker-list';
import { AdminJobVacancyHeader } from './loker-header';
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export default function AdminJobVacancyPage() {
  return (
    <div className="space-y-6">
      <AdminJobVacancyHeader />

      <Card>
        <CardContent className="p-6">
          <Suspense fallback={<AdminJobVacancyListSkeleton />}>
            <AdminJobVacancyList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminJobVacancyListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}