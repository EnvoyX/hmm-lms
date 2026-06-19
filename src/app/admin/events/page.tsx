// ~/app/(admin)/admin/events/page.tsx
import { api } from "~/trpc/server";
import EventList from "./event-list";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function AdminEventsPage() {
  const initialEvents = await api.event.getAllEventsAdmin({ limit: 20 });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all platform events
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>

      <EventList initialEvents={initialEvents} />
    </div>
  );
}
