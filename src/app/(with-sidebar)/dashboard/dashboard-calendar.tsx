"use client";

import * as React from "react";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

const TIMEZONE = "Asia/Jakarta"; // UTC+7 (WIB)

export function DashboardCalendar() {
  const [date, setDate] = React.useState<Date>(toZonedTime(new Date(), TIMEZONE));
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    toZonedTime(new Date(), TIMEZONE)
  );

  const utils = api.useUtils();

  // Get events for the current month
  const { data: calendarEvents } =
    api.studentDashboard.getCalendarEvents.useQuery({
      month: date.getMonth(),
      year: date.getFullYear(),
    });

  // Get events for selected date
  const { data: dayEvents, isLoading: dayEventsLoading } =
    api.studentDashboard.getEventsForDate.useQuery({
      date: selectedDate,
    });

  // RSVP mutation
  const rsvpMutation = api.event.respondToRsvp.useMutation({
    onSuccess: () => {
      toast.success("RSVP updated successfully");
      void utils.studentDashboard.getCalendarEvents.invalidate();
      void utils.studentDashboard.getEventsForDate.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Attendance mutation
  const attendanceMutation = api.event.recordPresence.useMutation({
    onSuccess: () => {
      toast.success("Attendance recorded successfully");
      void utils.studentDashboard.getEventsForDate.invalidate();
      void utils.studentDashboard.getCalendarEvents.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Get dates that have events
  const eventDates = React.useMemo(() => {
    if (!calendarEvents) return [];
    return calendarEvents.map((event) => toZonedTime(new Date(event.start), TIMEZONE));
  }, [calendarEvents]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  const handleRsvp = (eventId: string, status: "YES" | "NO" | "MAYBE") => {
    rsvpMutation.mutate({ eventId, status });
  };

  const handleCheckIn = (eventId: string) => {
    attendanceMutation.mutate({ eventId });
  };

  return (
    <Card>
      <CardContent className="">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          onMonthChange={setDate}
          modifiers={{
            hasEvent: eventDates,
          }}
          modifiersStyles={{
            hasEvent: {
              fontWeight: "bold",
              textDecoration: "underline",
              textDecorationColor: "hsl(var(--primary))",
            },
          }}
          className="rounded-md border-0 mx-auto w-full"
        />

        <Separator className="my-4" />

        <div className="space-y-2">
          <h3 className="font-medium text-sm">
            {formatInTimeZone(selectedDate, TIMEZONE, "d MMMM yyyy")}
          </h3>

          {dayEventsLoading ? (
            <p className="text-sm text-muted-foreground">Loading events...</p>
          ) : dayEvents && dayEvents.length > 0 ? (
            <div className="space-y-2">
              {dayEvents.map((event) => {
                const eventStart = toZonedTime(new Date(event.start), TIMEZONE);
                const eventEnd = toZonedTime(new Date(event.end), TIMEZONE);

                return (
                  <Popover key={event.id}>
                    <PopoverTrigger asChild>
                      <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {event.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatInTimeZone(eventStart, TIMEZONE, "HH:mm")} -{" "}
                              {formatInTimeZone(eventEnd, TIMEZONE, "HH:mm")}
                            </p>
                          </div>
                          {event.userRsvp && (
                            <Badge
                              variant={
                                event.userRsvp.status === "YES"
                                  ? "default"
                                  : "secondary"
                              }
                              className="ml-2 text-xs"
                            >
                              {event.userRsvp.status}
                            </Badge>
                          )}
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 **:text-xs" align="end">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold">{event.title}</h4>
                          {event.course && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {event.course.classCode}
                            </Badge>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        )}

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatInTimeZone(eventStart, TIMEZONE, "PPp")} -{" "}
                              {formatInTimeZone(eventEnd, TIMEZONE, "p")}
                            </span>
                          </div>

                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{event.location}</span>
                            </div>
                          )}

                          {event.rsvpCount > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{event.rsvpCount} attending</span>
                            </div>
                          )}

                          {event.userPresence && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-green-600">
                                Checked in
                                {event.userPresence.status === "LATE" &&
                                  " (Late)"}
                              </span>
                            </div>
                          )}
                        </div>

                        <Separator />

                        {/* RSVP Section */}
                        {event.eventMode !== "BASIC" &&
                          event.eventMode !== "ATTENDANCE_ONLY" && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">RSVP Status:</p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={
                                    event.userRsvp?.status === "YES"
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => handleRsvp(event.id, "YES")}
                                  disabled={rsvpMutation.isPending}
                                  className="flex-1"
                                >
                                  Going
                                </Button>
                                <Button
                                  size="sm"
                                  variant={
                                    event.userRsvp?.status === "MAYBE"
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => handleRsvp(event.id, "MAYBE")}
                                  disabled={rsvpMutation.isPending}
                                  className="flex-1"
                                >
                                  Maybe
                                </Button>
                                <Button
                                  size="sm"
                                  variant={
                                    event.userRsvp?.status === "NO"
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => handleRsvp(event.id, "NO")}
                                  disabled={rsvpMutation.isPending}
                                  className="flex-1"
                                >
                                Can&apos;t Go
                                </Button>
                              </div>
                            </div>
                          )}

                        {/* Attendance Section */}
                        {event.eventMode !== "BASIC" &&
                          event.eventMode !== "RSVP_ONLY" &&
                          !event.userPresence && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Attendance:</p>
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={() => handleCheckIn(event.id)}
                                disabled={attendanceMutation.isPending}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Check In
                              </Button>
                              <p className="text-xs text-muted-foreground text-center">
                                Available 15 minutes before start
                              </p>
                            </div>
                          )}

                        <Button variant="ghost" size="sm" className="w-full" asChild>
                          <Link href={`/events/${event.id}`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No events today</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button variant="ghost" size="sm" className="w-full" asChild>
          <Link href="/events">
            View all events
            <ExternalLink className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
