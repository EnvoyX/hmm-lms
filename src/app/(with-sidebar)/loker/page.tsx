// ~/app/(student)/loker/page.tsx
import { Suspense } from "react";
import { JobVacancyList } from "./loker-list";
import { JobVacancyFilters } from "./loker-filter";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export default function JobVacancyPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-3">
      <Suspense fallback={<FilterBarSkeleton />}>
        <JobVacancyFilters />
      </Suspense>
      <Suspense fallback={<JobVacancyListSkeleton />}>
        <JobVacancyList />
      </Suspense>
    </div>
  );
}

function FilterBarSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border p-4">
      <Skeleton className="h-4 w-40" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-9 w-36" />
    </div>
  );
}

function JobVacancyListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-full max-w-md" />
        <div className="flex justify-end">
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-border/70">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-9 w-28 shrink-0" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
