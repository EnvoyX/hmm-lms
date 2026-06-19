// ~/app/(admin)/admin/events/[id]/page.tsx
import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import EventAdminDashboard from "./event-admin-dashboard";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const {id} = await params
  const event = await api.event.getEventById({ id });

  if (!event) {
    notFound();
  }

  const getEventStatus = () => {
    const now = new Date();
    const start = new Date(event.start);
    const end = new Date(event.end);

    if (end < now) return { text: 'Ended', color: 'bg-muted text-muted-foreground' };
    if (start <= now && end >= now) return { text: 'Ongoing', color: 'bg-green-500 text-white' };
    return { text: 'Upcoming', color: 'bg-blue-500 text-white' };
  };

  const status = getEventStatus();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/events">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/admin/events/${event.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Event
          </Link>
        </Button>
      </div>

      {/* Event Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={status.color}>{status.text}</Badge>
                <Badge variant="secondary" className="capitalize">
                  {event.eventMode.replace(/_/g, ' ').toLowerCase()}
                </Badge>
                {event.courseId && <Badge variant="outline">Course Event</Badge>}
                {event.allDay && <Badge variant="outline">All Day</Badge>}
              </div>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.description && (
            <p className="text-muted-foreground">{event.description}</p>
          )}

          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium mb-1">Start</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(event.start), 'EEEE, MMMM d, yyyy • HH:mm')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">End</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(event.end), 'EEEE, MMMM d, yyyy • HH:mm')}
              </p>
            </div>
            {event.location && (
              <div>
                <p className="text-sm font-medium mb-1">Location</p>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
            )}
            {event.course && (
              <div>
                <p className="text-sm font-medium mb-1">Course</p>
                <p className="text-sm text-muted-foreground">
                  {event.course.title} ({event.course.classCode})
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* RSVP and Attendance Management */}
      <EventAdminDashboard eventId={id} />
    </div>
  );
}
