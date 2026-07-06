"use client";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  ChevronDown,
  Clock,
  CalendarClock,
  ListChecks,
  CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import { type RouterOutputs, api } from "~/trpc/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type AssignmentWithRelations =
  RouterOutputs["machining"]["getAssignments"][number];

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
  } = assignment;

  const [isExpanded, setIsExpanded] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
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
    ? { variant: "default" as const, label: "Submitted", icon: CheckCircle2 }
    : notOpenYet
      ? { variant: "secondary" as const, label: "Not open yet", icon: Clock }
      : overdue
        ? { variant: "destructive" as const, label: "Overdue", icon: Clock }
        : dueSoon
          ? { variant: "default" as const, label: "Due soon", icon: Clock }
          : { variant: "secondary" as const, label: "Upcoming", icon: Clock };

  const StatusIcon = statusBadge.icon;

  // Check if description height exceeds threshold
  useEffect(() => {
    if (descRef.current) {
      setShowSeeMore(descRef.current.scrollHeight > 72);
    }
  }, [description]);

  return (
    <Card className="border-border/60 bg-card/80 overflow-hidden border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="px-6 py-5 sm:px-7">
        {/* Header Section */}
        <div className="mb-5 flex items-start gap-4">
          <Avatar className="ring-primary/10 h-9 w-9 ring-2">
            <AvatarImage
              src={creator.image ?? undefined}
              alt={creator.name ?? "User"}
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(creator.name ?? "U")}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-foreground text-sm font-semibold">
                {creator.name}
              </span>
              <span className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1 text-xs">
                Machining
              </Badge>
              <Badge variant={statusBadge.variant} className="gap-1 text-xs">
                <StatusIcon className="h-3 w-3" />
                {statusBadge.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-foreground mb-3 text-lg font-semibold sm:text-xl">
          {title}
        </h3>

        {/* Window / due date row */}
        <div className="text-muted-foreground mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {opensAt && (
            <span className="flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4" />
              {notOpenYet
                ? `Opens ${formatDistanceToNow(opensAt, { addSuffix: true })}`
                : `Opened ${formatDistanceToNow(opensAt, { addSuffix: true })}`}
            </span>
          )}
          {dueAt && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {overdue ? "Was due" : "Due"}{" "}
              {formatDistanceToNow(dueAt, { addSuffix: true })}
            </span>
          )}
        </div>

        {/* Description (plain text, not rich content — Form.description has no rich-text storage) */}
        {description && (
          <div className="mb-4">
            <p
              ref={descRef}
              className={`text-foreground text-sm leading-relaxed whitespace-pre-line ${
                !isExpanded && showSeeMore ? "line-clamp-3" : ""
              }`}
            >
              {description}
            </p>
            {showSeeMore && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary mt-1 rounded-full px-3"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "See less" : "See more"}
                <ChevronDown
                  className={`ml-1 h-4 w-4 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </Button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="border-border flex items-center justify-between gap-4 border-t pt-4">
          <span className="text-muted-foreground flex items-center gap-2 text-sm">
            <ListChecks className="h-4 w-4" />
            {_count.questions} {_count.questions === 1 ? "question" : "questions"}
            <span className="text-muted-foreground/60">•</span>
            {_count.submissions}{" "}
            {_count.submissions === 1 ? "submission" : "submissions"}
          </span>

          <Button size="sm" disabled={notOpenYet} asChild>
            <Link href={`/machining/forms/${id}`}>
              {hasSubmitted ? "View submission" : "Open assignment"}
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}