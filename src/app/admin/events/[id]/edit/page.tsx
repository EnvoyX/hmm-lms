// app/admin/events/[id]/edit/page.tsx
import { api } from '~/trpc/server';
import { notFound } from 'next/navigation';
import EventForm from '../../event-form';

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await api.event.getEventById({ id });

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <EventForm event={event} mode="edit" />
    </div>
  );
}
