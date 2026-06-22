"use client";

import { api } from "~/trpc/react";
import { DashboardChart } from "./dashboard-chart";
import { DashboardCalendar } from "./dashboard-calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Megaphone,
} from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { EditorProvider } from '~/components/ui/shadcn-io/editor';
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

const TIMEZONE = "Asia/Jakarta"; // UTC+7 (WIB)
export function DashboardContent() {
  const { data: announcements, isLoading: announcementsLoading } =
    api.studentDashboard.getMachiningAnnouncements.useQuery();

  const { data: machiningEvents, isLoading: machiningEventsLoading } =
    api.event.getMachiningEvents.useQuery();

  const { data: courses, isLoading: coursesLoading } =
    api.studentDashboard.getEnrolledCourses.useQuery();

  const { isLoading: statsLoading } =
    api.studentDashboard.getDashboardStats.useQuery();

  if (coursesLoading || statsLoading || announcementsLoading || machiningEventsLoading) {
    return <DashboardSkeleton />;
  }

  const latestAnnouncement = announcements?.[0];
  const parsedContent: string = typeof latestAnnouncement?.content === 'string' ? JSON.parse(latestAnnouncement?.content) as string : latestAnnouncement?.content as unknown as string;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 overflow-x-clip">
      <Card className="border-border/70 bg-card overflow-hidden shadow-sm">
        <div className="from-primary/15 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-7">
          <div className="space-y-3.5">
            <div className="flex max-sm:flex-col sm:items-center gap-2">
              <Badge
                variant="secondary"
                className="h-6 w-fit gap-1 px-2 text-[11px] font-medium"
              >
                <Megaphone className="h-3.5 w-3.5" />
                Latest Announcement
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(latestAnnouncement?.createdAt as Date), { addSuffix: true })}
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {latestAnnouncement?.title ?? "Announcement"}
              </h2>
              {/*<div className="flex items-center gap-2 flex-wrap">
                {latestAnnouncement?.scope === 'MACHINING' && (
                  <Badge variant="default" className="text-xs">
                    Machining
                  </Badge>
                )}
              </div>*/}
              <p className="text-muted-foreground max-w-2xl text-sm leading-6 md:text-[15px] line-clamp-1 truncate">
                <EditorProvider
                  content={parsedContent ?? "No announcements yet. Check back later for updates."}
                  editable={false}
                  immediatelyRender={false}
                  editorProps={{
                    attributes: {
                      class: 'focus:outline-none',
                    },
                  }}
                />
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {latestAnnouncement && (
              <>
                <Button asChild>
                  <Link href={`/machining/announcements/${latestAnnouncement?.id}`}>View Latest</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/machining/announcements">Previous Announcements</Link>
                </Button>
              </>
            )}

          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="min-w-0 space-y-6 xl:col-span-8">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-xl tracking-tight">
                    Continue Your Courses
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Your active classes in one clean list
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/machining/courses">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {courses && courses.length > 0 ? (
                courses.slice(0, 4).map((course) => (
                  <Link
                    key={course.id}
                    href={`/machining/courses/${course.id}`}
                    className="border-border/70 bg-card hover:bg-accent/40 flex items-center justify-between gap-3 rounded-xl border p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div className="min-w-0 space-y-1.5">
                      <p className="truncate text-[15px] leading-5 font-semibold">
                        {course.title}
                      </p>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-wide">
                        <span>{course.classCode}</span>
                        <span aria-hidden>•</span>
                        <span>{course.videoCount} videos</span>
                        <span aria-hidden>•</span>
                        <span>{course.attachmentsCount} materials</span>
                      </div>
                    </div>
                    <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0" />
                  </Link>
                ))
              ) : (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <BookOpen className="text-muted-foreground mx-auto mb-2 h-10 w-10" />
                  <h3 className="font-semibold">No courses yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Start learning by enrolling in your first course.
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/machining/courses">Browse Courses</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-xl tracking-tight">
                    Latest Events
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Upcoming machining events
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/machining/events">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {machiningEvents && machiningEvents.length > 0 ? (
                machiningEvents.slice(0, 4).map((event) => {

                   const eventStart = toZonedTime(new Date(event.start), TIMEZONE);
                   const eventEnd = toZonedTime(new Date(event.end), TIMEZONE);
                  return (
                     <Link
                    key={event.id}
                    href={`/machining/events/${event.id}`}
                    className="border-border/70 bg-card hover:bg-accent/40 flex items-center justify-between gap-3 rounded-xl border p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div className="min-w-0 space-y-1.5">
                      <p className="truncate text-[15px] leading-5 font-semibold">
                        {event.title}
                      </p>
                      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-[11px] font-medium tracking-wide">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatInTimeZone(eventStart, TIMEZONE, "dd MMMM yyyy")}
                        </span>
                        <span aria-hidden>•</span>
                        <span>
                          {formatInTimeZone(eventStart, TIMEZONE, "HH:mm")} -{" "}
                          {formatInTimeZone(eventEnd, TIMEZONE, "HH:mm")}
                        </span>
                        {event.location && (
                          <>
                            <span aria-hidden>•</span>
                            <span>{event.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0" />
                  </Link>
                  )
                })
              ) : (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <Calendar className="text-muted-foreground mx-auto mb-2 h-10 w-10" />
                  <h3 className="font-semibold">No events yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Check back later for upcoming machining events.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <DashboardChart />
        </div>
        <div className="min-w-0 space-y-6 xl:col-span-4">
          <DashboardCalendar />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Skeleton className="h-36 w-full" />
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
        <div className="space-y-6 xl:col-span-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-[420px] w-full" />
        </div>
      </div>
    </div>
  );
}
