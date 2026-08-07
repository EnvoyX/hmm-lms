// ~/components/job-vacancy/job-vacancy-card.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  Building2,
  MapPin,
  Clock,
  UsersRound,
  ArrowRight,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "~/lib/utils";

interface JobVacancy {
  id: string;
  title: string;
  company: string;
  position: string;
  eligibility: string;
  streams: string[];
  overview: string;
  salaryLabel: string | null;
  seniority: string | null;
  employmentType: string | null;
  createdAt: Date;
  createdBy: {
    name: string;
  };
}

interface JobVacancyCardProps {
  jobVacancy: JobVacancy;
}

export function JobVacancyCard({ jobVacancy }: JobVacancyCardProps) {
  const [expanded, setExpanded] = useState(false);
  const {
    title,
    company,
    position,
    eligibility,
    streams,
    overview,
    salaryLabel,
    seniority,
    employmentType,
    createdAt,
    createdBy,
  } = jobVacancy;

  const showPostedByTip =
    createdBy.name.length <= 4 || /^[A-Z]{2,4}$/i.test(createdBy.name.trim());

  return (
    <Card className="border-border/70 transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="min-w-0 space-y-1">
              <Link
                href={`/loker/${jobVacancy.id}`}
                className="group inline-block"
              >
                <h3 className="group-hover:text-primary text-xl leading-snug font-semibold">
                  {title}
                </h3>
              </Link>
              <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <div className="flex min-w-0 items-center gap-1">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">{company}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {position}
                </div>
              </div>
              {[salaryLabel, seniority, employmentType].some(
                (v) => v != null && v !== "",
              ) && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {salaryLabel ? (
                    <span className="text-foreground text-sm font-medium">
                      {salaryLabel}
                    </span>
                  ) : null}
                  {seniority ? (
                    <Badge
                      variant="outline"
                      className="h-5 text-[11px] font-normal"
                    >
                      {seniority}
                    </Badge>
                  ) : null}
                  {employmentType ? (
                    <Badge
                      variant="outline"
                      className="h-5 text-[11px] font-normal"
                    >
                      {employmentType}
                    </Badge>
                  ) : null}
                </div>
              )}
            </div>
            <Link
              href={`/loker/${jobVacancy.id}`}
              className="shrink-0 sm:self-start"
            >
              <Button variant="default" size="sm" className="shadow-sm">
                View details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {streams.slice(0, 4).map((stream) => (
              <span
                key={stream}
                className="bg-muted/50 text-muted-foreground inline-flex max-w-full items-center rounded-md px-2 py-0.5 text-[11px] leading-tight"
              >
                {stream}
              </span>
            ))}
            {streams.length > 4 && (
              <span className="text-muted-foreground text-[11px]">
                +{streams.length - 4} more
              </span>
            )}
          </div>

          <p className="text-foreground/95 flex gap-2 text-sm leading-relaxed">
            <GraduationCap className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <span className="font-medium">Requires: </span>
              {eligibility}
            </span>
          </p>

          <div className="space-y-1.5">
            <p
              className={cn(
                "text-foreground/90 text-sm leading-relaxed",
                !expanded && "line-clamp-3",
              )}
            >
              {overview}
            </p>
            {overview.length > 180 || overview.split("\n").length > 3 ? (
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="text-primary inline-flex items-center gap-0.5 text-sm font-medium hover:underline"
              >
                {expanded ? "Show less" : "Show more"}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    expanded && "rotate-180",
                  )}
                />
              </button>
            ) : null}
          </div>

          <div className="border-border/60 text-muted-foreground border-t pt-3 text-xs">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Posted {formatDistanceToNow(createdAt)} ago
              </span>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex cursor-default items-center gap-1">
                      <UsersRound className="h-3 w-3" />
                      Posted by {createdBy.name}
                    </span>
                  </TooltipTrigger>
                  {showPostedByTip ? (
                    <TooltipContent side="top" className="max-w-xs text-left">
                      <p className="text-xs">Posted by: {createdBy.name}</p>
                      <p className="text-muted-foreground text-[11px]">
                        HMM ITB job board listing. Contact the organization for
                        questions about this opening.
                      </p>
                    </TooltipContent>
                  ) : (
                    <TooltipContent side="top" className="max-w-sm">
                      <p className="text-xs">Posted by: {createdBy.name}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
