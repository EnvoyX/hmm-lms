'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { api, type RouterOutputs } from '~/trpc/react';
import { EventMode, type RSVPStatus, ApprovalStatus, PresenceStatus } from '@prisma/client';
import { BellRing, Check, ThumbsUp, ThumbsDown, CircleEllipsis, Loader2, LogIn, CircleX, Clock, User } from 'lucide-react';
import { toast } from 'sonner';

type EventDetail = NonNullable<RouterOutputs['event']['getEventById']>;

const RSVP_RESPONSE_TEXT: Record<RSVPStatus, string> = {
  YES: "You are going",
  NO: "You are not going",
  MAYBE: "You might be going"
};

const PRESENCE_STATUS_UI: Record<PresenceStatus, { text: string; icon: React.ElementType; color: string }> = {
  [PresenceStatus.PRESENT]: { text: "You were present", icon: ThumbsUp, color: "bg-primary" },
  [PresenceStatus.PENDING_APPROVAL]: { text: "Pending Approval", icon: CircleEllipsis, color: "bg-amber-500" },
  [PresenceStatus.ABSENT]: { text: "Marked as Absent", icon: ThumbsDown, color: "bg-destructive" },
  [PresenceStatus.LATE]: { text: "You were late", icon: Clock, color: "bg-amber-500" },
  [PresenceStatus.EXCUSED]: { text: "You were excused", icon: User, color: "bg-secondary" },
  [PresenceStatus.REJECTED]: { text: "Attendance Rejected", icon: CircleX, color: "bg-destructive" },
};

export default function EventActions({ event }: { event: EventDetail }) {
  const router = useRouter();
  const showRsvp = event.eventMode === EventMode.RSVP_ONLY || event.eventMode === EventMode.RSVP_AND_ATTENDANCE;
  const showAttendance = event.eventMode === EventMode.ATTENDANCE_ONLY || event.eventMode === EventMode.RSVP_AND_ATTENDANCE;
  const Icon = PRESENCE_STATUS_UI[event.userPresence?.status ?? PresenceStatus.PENDING_APPROVAL].icon;

  const { mutate: respond, isPending: isResponding } = api.event.respondToRsvp.useMutation({
    onSuccess: () => { toast.success("Your RSVP has been recorded!"); router.refresh(); },
    onError: (err) => toast.error(err.message),
  });

  const { mutate: checkIn, isPending: isCheckingIn } = api.event.recordPresence.useMutation({
    onSuccess: () => { toast.success("Successfully checked in!"); router.refresh(); },
    onError: (err) => toast.error(err.message),
  });

  const handleRsvp = (status: RSVPStatus) => respond({ eventId: event.id, status });
  const isEventActive = new Date() >= new Date(event.start) && new Date() <= new Date(event.end);

  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
      {showRsvp && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5" /> RSVP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.userRsvp ? (
              <div className="p-3 bg-accent text-accent-foreground rounded-md text-sm font-medium">
                {RSVP_RESPONSE_TEXT[event.userRsvp.status]}
                {event.userRsvp.approvalStatus === ApprovalStatus.PENDING && " (Pending Approval)"}
                {event.userRsvp.approvalStatus === ApprovalStatus.REJECTED && " (Not Approved)"}
              </div>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => handleRsvp('YES')} disabled={isResponding} className="flex-1">
                  <ThumbsUp className="h-4 w-4 mr-2" /> Yes
                </Button>
                {event.rsvpAllowMaybe && (
                  <Button onClick={() => handleRsvp('MAYBE')} disabled={isResponding} variant="secondary" className="flex-1">
                    <CircleEllipsis className="h-4 w-4 mr-2" /> Maybe
                  </Button>
                )}
                <Button onClick={() => handleRsvp('NO')} disabled={isResponding} variant="outline" className="flex-1">
                  <ThumbsDown className="h-4 w-4 mr-2" /> No
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showAttendance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5" /> Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {event.userPresence ? (
              <div className={`flex items-center gap-2 text-sm font-medium p-2 rounded-md text-primary-foreground ${PRESENCE_STATUS_UI[event.userPresence.status].color}`}>
                <Icon className="h-4 w-4" />
                {PRESENCE_STATUS_UI[event.userPresence.status].text}
              </div>
            ) : (
              <Button onClick={() => checkIn({ eventId: event.id })} disabled={isCheckingIn || !isEventActive} className="w-full">
                {isCheckingIn && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {!isEventActive && <CircleX className="h-4 w-4 mr-2" />}
                {isEventActive && !isCheckingIn && <LogIn className="h-4 w-4 mr-2" />}
                {isCheckingIn ? "Checking in..." : isEventActive ? "Check-in Now" : "Check-in Not Available"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
