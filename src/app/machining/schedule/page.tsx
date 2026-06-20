"use client"

import { useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { Loader2, Filter, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"
import { Badge } from "~/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "~/components/ui/dropdown-menu"
import { EventCalendar } from '~/components/event-calendar/event-calendar'
import { api } from "~/trpc/react"
import { toast } from "sonner"
import { getErrorMessage } from "~/lib/error-utils"
import type { CalendarEvent } from '~/components/event-calendar/types'
import {
  canCreateEvents,
  canDeleteEvents,
  canEditEvents,
  isScheduleAdmin,
  type EventScopeFilter,
  getFilteredUniqueEvents,
} from "./schedule-helpers"


export default function SchedulePage() {
  const { data: session } = useSession()
  const [scopeFilter, setScopeFilter] = useState<EventScopeFilter>({
    personal: true,
    course: true,
    global: true
  })

  // Fetch events based on current user's access
  const {
    data: allEventsData,
    isLoading: allEventsLoading,
    refetch: refetchAllEvents
  } = api.event.getAllEvents.useQuery(undefined, {
    enabled: !!session
  })

  const {
    data: myEventsData,
    isLoading: myEventsLoading,
    refetch: refetchMyEvents
  } = api.event.getMyEvents.useQuery(undefined, {
    enabled: !!session
  })

  const {
    data: courseEventsData,
    isLoading: courseEventsLoading,
    refetch: refetchCourseEvents
  } = api.event.getCourseEvents.useQuery(undefined, {
    enabled: !!session
  })

  const createEventMutation = api.event.createEvent.useMutation({
    onSuccess: async () => {
      toast.success("Event created successfully")
      await refetchAllEvents()
      await refetchMyEvents()
      await refetchCourseEvents()

    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to create event")
    }
  })

  const updateEventMutation = api.event.updateEvent.useMutation({
    onSuccess: async () => {
      toast.success("Event updated successfully")
      await refetchAllEvents()
      await refetchMyEvents()
      await refetchCourseEvents()
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to update event")
    }
  })

  const deleteEventMutation = api.event.deleteEvent.useMutation({
    onSuccess: async () => {
      toast.success("Event deleted successfully")
      await refetchAllEvents()
      await refetchMyEvents()
      await refetchCourseEvents()
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to delete event")
    }
  })

  const isLoading = allEventsLoading || myEventsLoading || courseEventsLoading

  // Combine and filter events based on scope
  const events: CalendarEvent[] = useMemo(
    () => getFilteredUniqueEvents(allEventsData, myEventsData, courseEventsData, scopeFilter),
    [allEventsData, myEventsData, courseEventsData, scopeFilter],
  )
  const canManageEvents = isScheduleAdmin(session ?? null)

  const handleEventAdd = async (event: CalendarEvent) => {
    if (!canCreateEvents(session ?? null)) {
      toast.error("Only admins can create events")
      return
    }

    try {
      await createEventMutation.mutateAsync({
        title: event.title,
        description: event.description ?? "",
        start: event.start,
        end: event.end,
        allDay: event.allDay ?? false,
        location: event.location,
        scope: event.scope ?? "personal",
        courseId: event.courseId,
        eventMode: 'BASIC',
        hasTimeline: false,
        timeline: undefined,
        rsvpDeadline: null,
        rsvpRequiresApproval: false,
      })
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create event"))
    }
  }

  const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
    if (!canEditEvents(session ?? null)) {
      toast.error("Only admins can edit events")
      return
    }

    try {
      await updateEventMutation.mutateAsync({
        id: updatedEvent.id,
        title: updatedEvent.title,
        description: updatedEvent.description ?? "",
        start: updatedEvent.start,
        end: updatedEvent.end,
        allDay: updatedEvent.allDay ?? false,
        location: updatedEvent.location,
        scope: updatedEvent.scope ?? 'personal',
        courseId: updatedEvent.courseId
      })
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update event"))
    }
  }

  const handleEventDelete = async (eventId: string) => {
    if (!canDeleteEvents(session ?? null)) {
      toast.error("Only admins can delete events")
      return
    }

    try {
      await deleteEventMutation.mutateAsync({ id: eventId })
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete event"))
    }
  }

  const refetchAllData = async () => {
    await Promise.all([
      refetchAllEvents(),
      refetchMyEvents(),
      refetchCourseEvents()
    ])
  }

  const activeScopeCount = Object.values(scopeFilter).filter(Boolean).length

  if (!session) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            Please sign in to view your schedule.
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <Card className="border-dashed bg-gradient-to-b from-muted/30 to-transparent p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="text-primary h-4 w-4" />
            <h1 className="text-2xl font-semibold tracking-tight">Schedule</h1>
            <Badge variant={canManageEvents ? "default" : "secondary"}>
              {canManageEvents ? "Admin access" : "View only"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            A focused calendar for personal, course, and global timelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetchAllData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {activeScopeCount < 3 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeScopeCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Event Scope</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={scopeFilter.personal}
                onCheckedChange={(checked) =>
                  setScopeFilter(prev => ({ ...prev, personal: checked }))
                }
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  Personal Events
                </div>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={scopeFilter.course}
                onCheckedChange={(checked) =>
                  setScopeFilter(prev => ({ ...prev, course: checked }))
                }
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500" />
                  Course Events
                </div>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={scopeFilter.global}
                onCheckedChange={(checked) =>
                  setScopeFilter(prev => ({ ...prev, global: checked }))
                }
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-sky-500" />
                  Global Events
                </div>
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading calendar...</span>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ) : (
          <EventCalendar
            events={events}
            onEventAdd={handleEventAdd}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
            canManageEvents={canManageEvents}
          />
        )}
      </Card>
    </div>
  )
}