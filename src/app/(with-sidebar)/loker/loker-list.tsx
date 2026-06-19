// ~/components/job-vacancy/job-vacancy-list.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { JobVacancyCard } from "./loker-card";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Loader2, AlertCircle, SearchX } from "lucide-react";
import { cn } from "~/lib/utils";

function buildFilterSummaryText(searchParams: URLSearchParams) {
  const search = searchParams.get("search");
  const streams = searchParams.getAll("streams");
  const loc = searchParams.get("location");
  const sen = searchParams.get("seniority");
  const emp = searchParams.get("employmentType");
  const n =
    (search ? 1 : 0) +
    streams.length +
    (loc ? 1 : 0) +
    (sen ? 1 : 0) +
    (emp ? 1 : 0);
  if (n === 0) {
    return "No filters applied — showing all open roles.";
  }
  const parts: string[] = [];
  if (search) parts.push(`keyword “${search}”`);
  if (streams.length) {
    parts.push(
      `streams: ${streams.slice(0, 2).join(", ")}${
        streams.length > 2 ? ` +${streams.length - 2} more` : ""
      }`,
    );
  }
  if (loc) parts.push(`location: ${loc}`);
  if (sen) parts.push(`level: ${sen}`);
  if (emp) parts.push(`type: ${emp}`);
  return `Showing results for ${parts.join(" · ")} · ${n} filter${
    n === 1 ? "" : "s"
  } active`;
}

function countUrlFilters(sp: URLSearchParams) {
  return (
    (sp.get("search") ? 1 : 0) +
    sp.getAll("streams").length +
    (sp.get("location") ? 1 : 0) +
    (sp.get("seniority") ? 1 : 0) +
    (sp.get("employmentType") ? 1 : 0)
  );
}

export function JobVacancyList() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? undefined;
  const streams = searchParams.getAll("streams");
  const location = searchParams.get("location") ?? undefined;
  const seniority = searchParams.get("seniority") ?? undefined;
  const employmentType = searchParams.get("employmentType") ?? undefined;

  const filterKey = searchParams.toString();
  const [countPulse, setCountPulse] = useState(false);
  const prevKey = useRef(filterKey);
  useEffect(() => {
    if (prevKey.current !== filterKey) {
      setCountPulse(true);
      prevKey.current = filterKey;
      const t = setTimeout(() => setCountPulse(false), 700);
      return () => clearTimeout(t);
    }
  }, [filterKey]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = api.loker.getAll.useInfiniteQuery(
    {
      limit: 10,
      search,
      streams: streams.length > 0 ? streams : undefined,
      location,
      seniority,
      employmentType,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load job vacancies. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const jobVacancies = data?.pages.flatMap((page) => page.jobVacancies) ?? [];
  const activeFilterCount = countUrlFilters(searchParams);
  const summary = buildFilterSummaryText(searchParams);

  if (jobVacancies.length === 0) {
    return (
      <div className="rounded-xl border border-dashed py-14 text-center">
        <SearchX className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">No matching vacancies</h3>
        <p className="text-muted-foreground mx-auto max-w-md">
          Try another keyword or remove a few filters to see more job
          opportunities.
        </p>
        {activeFilterCount > 0 && (
          <div className="mt-4 flex justify-center">
            <Button asChild variant="outline" size="sm">
              <Link href="/loker">Reset all filters</Link>
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {summary}
        </p>
        <div className="flex w-full items-center justify-end">
          <span
            className={cn(
              "text-muted-foreground rounded-md px-2 py-0.5 text-sm font-medium transition-colors duration-500",
              countPulse && "bg-primary/12 text-foreground",
            )}
          >
            {jobVacancies.length} jobs shown
          </span>
        </div>
      </div>

      {jobVacancies.map((jobVacancy) => (
        <JobVacancyCard key={jobVacancy.id} jobVacancy={jobVacancy} />
      ))}

      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
