'use client';

import cn from 'cnfast';
import { formatDistanceToNow, isPast } from 'date-fns';
import { ChevronDown, Clock, CalendarClock, ListChecks, CheckCircle2 , Check, CheckCheck} from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { type RouterOutputs } from '~/trpc/react';

type AssignmentWithRelations = RouterOutputs['machining']['getAssignments'][number];

interface AssignmentCardProps {
  assignment: AssignmentWithRelations;
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const {
    id,
    title,
    description,
    creator,
    createdAt,
    start,
    end,
    hasSubmitted,
    _count,
    allowMultipleSubmissions,
  } = assignment;

  const [isExpanded, setIsExpanded] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Window status, based on Form.start / Form.end
  const now = Date.now();
  const opensAt = start ? new Date(start) : null;
  const dueAt = end ? new Date(end) : null;
  const notOpenYet = opensAt ? opensAt.getTime() > now : false;
  const overdue = dueAt ? isPast(dueAt) : false;
  const hoursLeft = dueAt ? (dueAt.getTime() - now) / (1000 * 60 * 60) : null;
  const dueSoon = !overdue && hoursLeft !== null && hoursLeft <= 48;

  const statusBadge = hasSubmitted
    ? { variant: 'default' as const, label: 'Submitted', icon: CheckCircle2 }
    : notOpenYet
      ? { variant: 'secondary' as const, label: 'Not open yet', icon: Clock }
      : overdue
        ? { variant: 'destructive' as const, label: 'Overdue', icon: Clock }
        : dueSoon
          ? { variant: 'default' as const, label: 'Due soon', icon: Clock }
          : { variant: 'secondary' as const, label: 'Upcoming', icon: Clock };

  const StatusIcon = statusBadge.icon;

  const isDisabled = notOpenYet || overdue || (hasSubmitted && !allowMultipleSubmissions)

  // Check if description height exceeds threshold
  useEffect(() => {
    if (descRef.current) {
      setShowSeeMore(descRef.current.scrollHeight > 72);
    }
  }, [description]);

  return (
    <Card className="border-border/60 bg-card/80 overflow-hidden border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="p-5 sm:p-7">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar className="ring-primary/10 h-9 w-9 shrink-0 ring-2">
            <AvatarImage src={creator.image ?? undefined} alt={creator.name ?? 'User'} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(creator.name ?? 'U')}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-foreground truncate text-sm font-semibold">{creator.name}</span>
              <span className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="gap-1 text-[11px] sm:text-xs py-0.5 px-2">
                {assignment.type.charAt(0) + assignment.type.slice(1).toLowerCase()}
              </Badge>

              {allowMultipleSubmissions ? (
                <Badge variant="default" className="gap-1 text-[11px] sm:text-xs py-0.5 px-2">
                  <CheckCheck className="h-3 w-3 shrink-0" />
                  <span className="truncate">Multiple Submission</span>
                </Badge>
              ) : (
                <Badge variant="default" className="gap-1 text-[11px] sm:text-xs py-0.5 px-2">
                  <Check className="h-3 w-3 shrink-0" />
                  <span className="truncate">Single Submission</span>
                </Badge>
              )}

              <Badge variant={statusBadge.variant} className="gap-1 text-[11px] sm:text-xs py-0.5 px-2">
                <StatusIcon className="h-3 w-3 shrink-0" />
                <span className="truncate">{statusBadge.label}</span>
              </Badge>
            </div>
          </div>
        </div>

        <h3 className="text-foreground mb-2.5 text-base font-semibold sm:text-xl break-words">{title}</h3>

        <div className="text-muted-foreground mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm">
          {opensAt && (
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4 shrink-0" />
              <span>
                {notOpenYet
                  ? `Opens ${formatDistanceToNow(opensAt, { addSuffix: true })}`
                  : `Opened ${formatDistanceToNow(opensAt, { addSuffix: true })}`}
              </span>
            </span>
          )}
          {dueAt && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                {overdue ? 'Was due' : 'Due'} {formatDistanceToNow(dueAt, { addSuffix: true })}
              </span>
            </span>
          )}
        </div>

        {description && (
          <div className="mb-5">
            <p
              ref={descRef}
              className={`text-foreground text-sm leading-relaxed whitespace-pre-line ${
                !isExpanded && showSeeMore ? 'line-clamp-3' : ''
              }`}
            >
              {description}
            </p>
            {showSeeMore && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary mt-1 h-8 rounded-full px-3 text-xs"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'See less' : 'See more'}
                <ChevronDown
                  className={`ml-1 h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </Button>
            )}
          </div>
        )}

        <div className="border-border flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm">
            <span className="flex items-center gap-1.5">
              <ListChecks className="h-4 w-4 shrink-0" />
              {_count.questions} {_count.questions === 1 ? 'question' : 'questions'}
            </span>
            <span className="text-muted-foreground/40 hidden sm:inline">•</span>
            <span>
              {_count.submissions} {_count.submissions === 1 ? 'submission' : 'submissions'}
            </span>
          </span>

          <Button
            size="sm"
            disabled={notOpenYet || overdue || (hasSubmitted && !allowMultipleSubmissions)}
            className="w-full sm:w-auto"
            asChild
          >
            <Link
              href={isDisabled ? "" : `/machining/forms/${id}`}
              className={cn(
                "justify-center text-center",
                isDisabled ? "pointer-events-none opacity-50 cursor-not-allowed" : ""
              )}
            >
              {notOpenYet
                ? 'Not open yet'
                : overdue
                  ? 'Overdue'
                  : allowMultipleSubmissions
                    ? 'Open Assignment'
                    : hasSubmitted
                      ? 'Submitted'
                      : 'Open Assignment'}
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
