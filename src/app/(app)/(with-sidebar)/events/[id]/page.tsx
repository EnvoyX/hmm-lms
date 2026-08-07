import { api } from '~/trpc/server';
import { notFound } from 'next/navigation';
import { auth } from '~/server/auth';
import { EventMode } from '@prisma/client';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { AlertCircle } from 'lucide-react';
import EventDetailView from './event-detail-view';
import EventActions from './event-actions';

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const event = await api.event.getEventById({ id });

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <EventDetailView event={event} />

      {session?.user ? (
        event.eventMode !== EventMode.BASIC && <EventActions event={event} />
      ) : (
        event.eventMode !== EventMode.BASIC && (
          <Card className="max-w-5xl mx-auto">
            <CardHeader />
            <CardContent className="flex items-center gap-4">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <p className="text-muted-foreground">Please sign in to RSVP or check-in to this event.</p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
