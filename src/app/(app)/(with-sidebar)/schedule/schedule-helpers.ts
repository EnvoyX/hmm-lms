import type { Session } from "next-auth";
import type { CalendarEvent, EventColor, EventScope } from "~/components/event-calendar/types";

export interface EventScopeFilter {
  personal: boolean;
  course: boolean;
  global: boolean;
}

export interface EventQueryResult {
  id: string;
  title: string;
  description: string | null;
  start: Date;
  end: Date;
  allDay: boolean;
  color: EventColor;
  location: string | null;
  userId: string | null;
  courseId: string | null;
  course: {
    title: string;
    classCode: string;
  } | null;
  createdBy: {
    name: string | null;
    email: string;
  } | null;
}

export function mapEventToCalendarEvent(event: EventQueryResult): CalendarEvent {
  return {
    id: event.id,
    title: event.title,
    description: event.description ?? undefined,
    start: new Date(event.start),
    end: new Date(event.end),
    allDay: event.allDay,
    color: event.color.toLowerCase() as EventColor,
    location: event.location ?? undefined,
    scope: event.userId ? "personal" : event.courseId ? "course" : "global",
    courseId: event.courseId ?? undefined,
    courseName: event.course?.title ?? undefined,
    createdBy: event.createdBy?.name ?? "Unknown",
  };
}

export function getFilteredUniqueEvents(
  allEventsData: EventQueryResult[] | undefined,
  myEventsData: EventQueryResult[] | undefined,
  courseEventsData: EventQueryResult[] | undefined,
  scopeFilter: EventScopeFilter,
): CalendarEvent[] {
  const allEvents = [
    ...(allEventsData ?? []).map(mapEventToCalendarEvent),
    ...(myEventsData ?? []).map(mapEventToCalendarEvent),
    ...(courseEventsData ?? []).map(mapEventToCalendarEvent),
  ];

  const uniqueEvents = allEvents.filter(
    (event, index, self) => index === self.findIndex((candidate) => candidate.id === event.id),
  );

  return uniqueEvents.filter((event) => {
    if (event.scope === "personal" && !scopeFilter.personal) return false;
    if (event.scope === "course" && !scopeFilter.course) return false;
    if (event.scope === "global" && !scopeFilter.global) return false;
    return true;
  });
}

export function resolveCreateScope(
  session: Session | null,
  fallbackScope: EventScope = "personal",
): EventScope {
  if (isScheduleAdmin(session)) {
    return fallbackScope;
  }

  return "personal";
}

export function isScheduleAdmin(session: Session | null): boolean {
  return session?.user.role === "ADMIN" || session?.user.role === "SUPERADMIN";
}

export function canCreateEvents(session: Session | null): boolean {
  return isScheduleAdmin(session);
}

export function canEditEvents(session: Session | null): boolean {
  return isScheduleAdmin(session);
}

export function canDeleteEvents(session: Session | null): boolean {
  return isScheduleAdmin(session);
}

export function canManageEventScope(
  session: Session | null,
  eventScope: EventScope | undefined,
): boolean {
  if (isScheduleAdmin(session)) {
    return true;
  }

  return eventScope === "personal";
}
