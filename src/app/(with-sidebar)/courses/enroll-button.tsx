'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { api } from '~/trpc/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';

interface EnrollButtonProps {
  courseId: string;
  courseName: string;
}

export default function EnrollButton({ courseId }: EnrollButtonProps) {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const router = useRouter();

  const enrollMutation = api.course.enrollInCourse.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      router.refresh(); // Refresh the page to show enrolled content
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setIsEnrolling(false);
    },
  });

  const handleEnroll = async () => {
    setIsEnrolling(true);
    enrollMutation.mutate({ courseId });
  };

  return (
    <Button
      onClick={handleEnroll}
      disabled={isEnrolling}
      size="lg"
      className="w-full sm:w-auto"
    >
      {isEnrolling ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enrolling...
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Enroll in Course
        </>
      )}
    </Button>
  );
}