import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";

const HEARTBEAT_INTERVAL_MS = 15 * 1000; // 15 seconds
const IDLE_TIMEOUT_MS = 60 * 1000 * 2; // 2 minutes

export function useLearningTracker(courseId: string, enabled = true) {
  const [isTracking, setIsTracking] = useState(false);
  const [isIdle, setIsIdle] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const isInitializedRef = useRef(false);

  // tRPC mutation
  const heartbeatMutation = api.lessonTracker.heartbeat.useMutation({
    onSuccess: () => {
      console.log(`Heartbeat successful for course: ${courseId}`);
    },
    onError: (error) => {
      console.error("Heartbeat failed:", error);
    },
  });

  const sendHeartbeat = useCallback(() => {
    if (document.hidden || isIdle || !enabled || !startTimeRef.current) {
      console.log("Skipping heartbeat - conditions not met");
      return;
    }

    console.log(`Sending heartbeat for course: ${courseId}`);
    heartbeatMutation.mutate({ courseId });
  }, [courseId, isIdle, enabled, heartbeatMutation]);

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      console.log("User is now idle.");
      setIsIdle(true);
    }, IDLE_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    if (isInitializedRef.current) {
      return;
    }

    if (!enabled || !courseId) {
      return;
    }

    console.log("Initializing learning tracker for course:", courseId);
    isInitializedRef.current = true;
    setIsTracking(true);
    startTimeRef.current = new Date();

    // Event Handlers
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Tab is hidden, pausing tracking.");
      } else {
        console.log("Tab is visible, resuming tracking.");
        resetIdleTimer();
      }
    };

    const handleUserActivity = () => {
      resetIdleTimer();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);
    window.addEventListener("click", handleUserActivity);

    resetIdleTimer();

    const initialTimeout = setTimeout(() => {
      sendHeartbeat();
    }, 1000);

    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    return () => {
      console.log("Cleaning up learning tracker...");

      clearTimeout(initialTimeout);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);

      setIsTracking(false);
      startTimeRef.current = null;
      isInitializedRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, enabled]);

  useEffect(() => {
    if (intervalRef.current && isInitializedRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    }
  }, [sendHeartbeat]);

  return { isTracking, isIdle };
}
