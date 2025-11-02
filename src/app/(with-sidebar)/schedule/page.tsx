// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Loader2, Plus, Upload, Filter, RefreshCw } from "lucide-react"
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
import { IcsImportDialog } from '~/components/ics-import-dialog'
import { CreateEventDialog } from './create-event-dialog'
import { api } from "~/trpc/react"
import { toast } from "sonner"
import { sendNotification } from "~/lib/notifications"
import type { CalendarEvent, EventScope } from '~/components/event-calendar/types'
import type { EventColor } from '~/components/event-calendar/types'

interface EventScopeFilter {
  personal: boolean
  course: boolean
  global: boolean
}

// Type for the event query result from tRPC
type EventQueryResult = {
  id: string
  title: string
  description: string | null
  start: Date
  end: Date
  allDay: boolean
  color: EventColor
  location: string | null
  userId: string | null
  courseId: string | null
  course: {
    id: string
    title: string
    classCode: string
  } | null
  createdBy: {
    id: string
    name: string | null
    email: string
  } | null
}

function mapEventToCalendarEvent(event: EventQueryResult): CalendarEvent {
  return {
    id: event.id,
    title: event.title,
    description: event.description ?? undefined,
    start: new Date(event.start),
    end: new Date(event.end),
    allDay: event.allDay,
    color: event.color.toLowerCase() as EventColor,
    location: event.location ?? undefined,
    scope: event.userId ? 'personal' : event.courseId ? 'course' : 'global',
    courseId: event.courseId ?? undefined,
    courseName: event.course?.title ?? undefined,
    createdBy: event.createdBy?.name ?? 'Unknown'
  }
}


export default function SchedulePage() {
  const { data: session } = useSession()
  const [scopeFilter, setScopeFilter] = useState<EventScopeFilter>({
    personal: true,
    course: true,
    global: true
  })
  const [showIcsImport, setShowIcsImport] = useState(false)
  const [showCreateEvent, setShowCreateEvent] = useState(false)

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

  // Get user's push subscriptions for notifications
  const { data: pushSubscriptions } = api.notification.getSubscriptions.useQuery(undefined, {
    enabled: !!session
  })

  const createEventMutation = api.event.createEvent.useMutation({
    onSuccess: async (createdEvent) => {
      toast.success("Event created successfully")
      await refetchAllEvents()
      await refetchMyEvents()
      await refetchCourseEvents()

      // Send notification for course/global events
      // if (!createdEvent.userId && pushSubscriptions?.length > 0) {
      //   try {
      //     await sendNotification(pushSubscriptions[0] ?? "", {
      //       title: "New Event Created",
      //       body: `${createdEvent.title} - ${new Date(createdEvent.start).toLocaleDateString()}`,
      //       type: "event",
      //       url: `/events/${createdEvent.id}`
      //     })
      //   } catch (error) {
      //     console.error("Failed to send notification:", error)
      //   }
      // }
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
  const events: CalendarEvent[] = (() => {
    if (!allEventsData && !myEventsData && !courseEventsData) return []

    const allEvents = [
      ...(allEventsData ?? []).map(mapEventToCalendarEvent),
      ...(myEventsData ?? []).map(mapEventToCalendarEvent),
      ...(courseEventsData ?? []).map(mapEventToCalendarEvent)
    ]

    // Remove duplicates based on ID
    const uniqueEvents = allEvents.filter((event, index, self) =>
      index === self.findIndex(e => e.id === event.id)
    )

    // Filter by scope
    return uniqueEvents.filter(event => {
      if (event.scope === 'personal' && !scopeFilter.personal) return false
      if (event.scope === 'course' && !scopeFilter.course) return false
      if (event.scope === 'global' && !scopeFilter.global) return false
      return true
    })
  })()

  const handleEventAdd = async (event: CalendarEvent) => {
    // Only allow personal event creation for non-admin users
    const eventScope: EventScope = session?.user.role === 'ADMIN' || session?.user.role === 'SUPERADMIN'
      ? (event.scope ?? 'personal')
      : 'personal'

    try {
      await createEventMutation.mutateAsync({
        title: event.title,
        description: event.description ?? "",
        start: event.start,
        end: event.end,
        allDay: event.allDay ?? false,
        location: event.location,
        scope: eventScope,
        courseId: event.courseId,
        eventMode: 'BASIC',
        hasTimeline: false,
        timeline: undefined,
        rsvpDeadline: null,
        rsvpRequiresApproval: false,
      })
    } catch (error) {
      console.error('Failed to create event:', error)
    }
  }

  const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
    // Only admins can edit course/global events, users can only edit their personal events
    const canEdit = session?.user.role === 'ADMIN' || session?.user.role === 'SUPERADMIN' ||
      updatedEvent.scope === 'personal'

    if (!canEdit) {
      toast.error("You don't have permission to edit this event")
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
      console.error('Failed to update event:', error)
    }
  }

  const handleEventDelete = async (eventId: string) => {
    const eventToDelete = events.find(e => e.id === eventId)

    // Only admins can delete course/global events, users can only delete their personal events
    const canDelete = session?.user.role === 'ADMIN' || session?.user.role === 'SUPERADMIN' ||
      eventToDelete?.scope === 'personal'

    if (!canDelete) {
      toast.error("You don't have permission to delete this event")
      return
    }

    try {
      await deleteEventMutation.mutateAsync({ id: eventId })
    } catch (error) {
      console.error('Failed to delete event:', error)
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
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground">
            Your personal calendar with course and global events
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={refetchAllData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          {/* Scope Filter */}
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

          {/* ICS Import */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowIcsImport(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>

          {/* Create Event */}
          <Button
            size="sm"
            onClick={() => setShowCreateEvent(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Card>
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
          />
        )}
      </Card>

      {/* Event Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <div>
              <p className="text-sm font-medium">Personal Events</p>
              <p className="text-2xl font-bold">
                {events.filter(e => e.scope === 'personal').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-violet-500" />
            <div>
              <p className="text-sm font-medium">Course Events</p>
              <p className="text-2xl font-bold">
                {events.filter(e => e.scope === 'course').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-sky-500" />
            <div>
              <p className="text-sm font-medium">Global Events</p>
              <p className="text-2xl font-bold">
                {events.filter(e => e.scope === 'global').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Dialogs */}
      <IcsImportDialog
        open={showIcsImport}
        onOpenChange={setShowIcsImport}
        // onImportComplete={refetchAllData}
      />

      <CreateEventDialog
        open={showCreateEvent}
        onOpenChange={setShowCreateEvent}
        onEventCreated={refetchAllData}
        defaultScope="personal"
        isAdmin={session?.user.role === 'ADMIN' || session?.user.role === 'SUPERADMIN'}
      />
    </div>
  )
}