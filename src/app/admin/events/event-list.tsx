// ~/app/(admin)/admin/events/event-list.tsx
'use client';

import { useState } from 'react';
import { api, type RouterOutputs } from '~/trpc/react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import {
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
  Loader2,
  CalendarX2,
  MapPin,
  Users,
  Clock,
  Calendar as CalendarIcon,
  Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

type EventAdmin = RouterOutputs['event']['getAllEventsAdmin']['items'][number];
type InitialEvents = RouterOutputs['event']['getAllEventsAdmin'];

export default function EventList({ initialEvents }: { initialEvents: InitialEvents }) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventAdmin | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = api.event.getAllEventsAdmin.useInfiniteQuery(
    { limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialData: { pages: [initialEvents], pageParams: [undefined] },
    }
  );

  const deleteEventMutation = api.event.deleteEvent.useMutation({
    onSuccess: async () => {
      toast.success("Event deleted successfully.");
      await refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setEventToDelete(null);
      setShowDeleteDialog(false);
    }
  });

  const allEvents = data?.pages.flatMap((page) => page.items) ?? [];

  const getEventScope = (event: EventAdmin) => {
    if (event.courseId)
      return {
        text: 'Course',
        variant: 'secondary' as const,
        detail: event.course?.title
      };
    if (event.userId)
      return {
        text: 'Personal',
        variant: 'outline' as const,
        detail: event.user?.name
      };
    return {
      text: 'Global',
      variant: 'default' as const,
      detail: 'All users'
    };
  };

  const getEventStatus = (event: EventAdmin) => {
    const now = new Date();
    const start = new Date(event.start);
    const end = new Date(event.end);

    if (end < now)
      return {
        text: 'Ended',
        color: 'bg-muted text-muted-foreground'
      };
    if (start <= now && end >= now)
      return {
        text: 'Ongoing',
        color: 'bg-green-500 text-white'
      };
    return {
      text: 'Upcoming',
      color: 'bg-blue-500 text-white'
    };
  };

  const handleDeleteClick = (event: EventAdmin) => {
    setEventToDelete(event);
    setShowDeleteDialog(true);
  };

  if (allEvents.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CalendarX2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            There are no events in the system yet. Create your first event!
          </p>
          <Button asChild>
            <Link href="/admin/events/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {allEvents.map((event) => {
          const scope = getEventScope(event);
          const status = getEventStatus(event);
          const rsvpCount = event._count?.rsvpResponses ?? 0;
          const attendanceCount = event._count?.presenceRecords ?? 0;

          return (
            <Card key={event.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={status.color}>{status.text}</Badge>
                      <Badge variant={scope.variant}>{scope.text}</Badge>
                      <Badge variant="outline" className="capitalize">
                        {event.eventMode.replace(/_/g, ' ').toLowerCase()}
                      </Badge>
                    </div>

                    <div>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          {format(new Date(event.start), 'MMM d, yyyy')}
                          {new Date(event.start).toDateString() !== new Date(event.end).toDateString() &&
                            ` - ${format(new Date(event.end), 'MMM d, yyyy')}`
                          }
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                        </span>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}

                      {scope.detail && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span className="truncate">{scope.detail}</span>
                        </div>
                      )}
                    </div>

                    {/* Event Stats */}
                    {(rsvpCount > 0 || attendanceCount > 0) && (
                      <div className="flex items-center gap-4 pt-2 border-t">
                        {rsvpCount > 0 && (
                          <div className="text-sm">
                            <span className="font-medium">{rsvpCount}</span>
                            <span className="text-muted-foreground"> RSVP{rsvpCount !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {attendanceCount > 0 && (
                          <div className="text-sm">
                            <span className="font-medium">{attendanceCount}</span>
                            <span className="text-muted-foreground"> Check-in{attendanceCount !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Created by {event.createdBy.name} • {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/admin/events/${event.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/admin/events/${event.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(event)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {hasNextPage && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Events'
            )}
          </Button>
        </div>
      )}

      {!hasNextPage && allEvents.length > 0 && (
        <p className="text-center text-sm text-muted-foreground mt-6">
          You've reached the end of the list.
        </p>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              <strong> "{eventToDelete?.title}"</strong> and all of its associated RSVP and attendance data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (eventToDelete) {
                  deleteEventMutation.mutate({ id: eventToDelete.id });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEventMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
