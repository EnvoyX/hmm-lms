'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '~/trpc/react';
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
import { Button } from '~/components/ui/button';
import { Loader2, LogOut } from 'lucide-react';

interface UnenrollButtonProps {
  courseId: string;
  courseName: string;
}

export default function UnenrollButton({ courseId, courseName }: UnenrollButtonProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const unenrollMutation = api.course.unenrollFromCourse.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setIsDialogOpen(false);
      // Refresh the page data to show the course preview state
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleUnenroll = () => {
    unenrollMutation.mutate({ courseId });
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-background/50 border border-destructive text-destructive hover:bg-destructive/10 w-full sm:w-auto">
          <LogOut className="mr-2 h-4 w-4" />
          Leave Course
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            You will lose access to all materials and content for the course &quot;{courseName}&quot;. You can always re-enroll later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={unenrollMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUnenroll}
            disabled={unenrollMutation.isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {unenrollMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Yes, Unenroll
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}