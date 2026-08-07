'use client';

import { Button } from '~/components/ui/button';
import { Trash2 } from 'lucide-react';
import { api } from '~/trpc/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';

interface DeleteEventButtonProps {
  eventId: string;
}

export default function DeleteEventButton({ eventId }: DeleteEventButtonProps) {
  const router = useRouter();
  const deleteEvent = api.event.deleteEvent.useMutation({
    onSuccess: () => {
      toast.success('Event deleted successfully');
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete event');
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Event</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this event? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteEvent.mutate({ id: eventId })}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteEvent.isPending}
          >
            {deleteEvent.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}