"use client";

import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";

interface BreadcrumbItemResolverProps {
  path: string;
  index: number;
  pathNames: string[];
}

export default function BreadcrumbItemResolver({
  path,
  index,
  pathNames,
}: BreadcrumbItemResolverProps) {
  const previousPath = index > 0 ? pathNames[index - 1] : null;

  // Check if this is a course ID
  const isCourseId = previousPath === "courses";
  const { data: course, isLoading: isLoadingCourse } = api.course.getCourseById.useQuery(
    { id: path },
    { enabled: isCourseId && path.length > 10 } // Basic check to avoid invalid queries
  );

  // Check if this is an event ID
  const isEventId = previousPath === "events";
  const { data: event, isLoading: isLoadingEvent } = api.event.getEventById.useQuery(
    { id: path },
    { enabled: isEventId && path.length > 10 }
  );

  if (isCourseId) {
    if (isLoadingCourse) return <Skeleton className="h-4 w-24" />;
    if (course) return <span>{course.title}</span>;
  }

  if (isEventId) {
    if (isLoadingEvent) return <Skeleton className="h-4 w-24" />;
    if (event) return <span>{event.title}</span>;
  }

  return <span>{path.replace(/-/g, " ")}</span>;
}
