import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import EventItem from './event-item';
import { api } from '~/trpc/server';
import { CalendarDays } from 'lucide-react';
import { type RouterOutputs } from '~/trpc/react';

export default async function EventsPage() {
  const machiningEvents = await api.event.getMachiningEvents();

  const renderEventList = (events: RouterOutputs['event']['getMachiningEvents'], emptyMessage: string) => {
    if (events.length === 0) {
      return (
        <div className="text-center py-12">
          <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">{emptyMessage}</p>
        </div>
      );
    }
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventItem
            key={event.id}
            event={event}
            href={`/events/${event.id}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Tabs defaultValue="all-events" className="w-full">
        <TabsList className="text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1 mb-6">
          <TabsTrigger
            value="all-events"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            All Events
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all-events">{renderEventList(machiningEvents, "No machining events available.")}</TabsContent>
      </Tabs>
    </div>
  );
}

export const metadata = {
  title: 'Events',
};
