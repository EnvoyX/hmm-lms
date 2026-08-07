"use client";

import { useParams } from 'next/navigation';
import { useLearningTracker } from '~/hooks/use-learning-session';

export default function Template({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const params = useParams();
  const courseId = params.id as string;
  const { isTracking, isIdle } = useLearningTracker(courseId, true);
  return (
    <div className="relative">
      {/* Optional: Show tracking status */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed top-4 right-4 z-50 text-xs bg-black/80 text-white px-2 py-1 rounded">
          {isTracking ? (isIdle ? "Idle" : "Tracking") : "Not tracking"}
        </div>
      )}
      {children}
    </div>
  )
}