// ~/components/job-vacancy/job-vacancy-detail.tsx
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  ArrowLeft,
  BadgeCheck,
  FileText,
  GraduationCap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobVacancy {
  id: string;
  title: string;
  company: string;
  position: string;
  eligibility: string;
  streams: string[];
  overview: string;
  timeline: string;
  applyLink: string;
  salaryLabel: string | null;
  seniority: string | null;
  employmentType: string | null;
  createdAt: Date;
  createdBy: {
    name: string;
  };
}

interface JobVacancyDetailProps {
  jobVacancy: JobVacancy;
}

export function JobVacancyDetail({ jobVacancy }: JobVacancyDetailProps) {
  return (
    <div className="container mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/loker">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Card className="border-border/70">
            <CardHeader className="pb-5">
              <div className="space-y-4">
                <div>
                  <CardTitle className="text-2xl leading-snug sm:text-3xl">
                    {jobVacancy.title}
                  </CardTitle>
                  <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {jobVacancy.company}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {jobVacancy.position}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {jobVacancy.salaryLabel ? (
                    <span className="text-foreground text-sm font-medium">
                      {jobVacancy.salaryLabel}
                    </span>
                  ) : null}
                  {jobVacancy.seniority ? (
                    <Badge
                      variant="outline"
                      className="h-6 text-xs font-normal"
                    >
                      {jobVacancy.seniority}
                    </Badge>
                  ) : null}
                  {jobVacancy.employmentType ? (
                    <Badge
                      variant="outline"
                      className="h-6 text-xs font-normal"
                    >
                      {jobVacancy.employmentType}
                    </Badge>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {jobVacancy.streams.map((stream) => (
                    <span
                      key={stream}
                      className="bg-muted/50 text-muted-foreground inline-flex rounded-md px-2 py-0.5 text-[11px] leading-tight"
                    >
                      {stream}
                    </span>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-7">
              <p className="flex gap-2 text-sm leading-relaxed">
                <GraduationCap className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <span className="font-semibold">Requires: </span>
                  {jobVacancy.eligibility}
                </span>
              </p>

              <Separator />

              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <FileText className="h-4 w-4" />
                  Overview
                </h3>
                <div className="prose prose-sm max-w-none leading-relaxed">
                  <p className="whitespace-pre-wrap">{jobVacancy.overview}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </h3>
                <div className="prose prose-sm max-w-none leading-relaxed">
                  <p className="whitespace-pre-wrap">{jobVacancy.timeline}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <Card className="border-primary/20 bg-primary/[0.03] lg:sticky lg:top-20">
            <CardHeader className="pb-3">
              <CardTitle>Apply Now</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Ready to take the next step in your career?
              </p>
              <Button asChild className="w-full">
                <a
                  href={jobVacancy.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apply Now
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <div className="border-primary/25 bg-background/70 text-muted-foreground rounded-lg border p-3 text-xs">
                <p className="text-foreground flex items-center gap-1 font-medium">
                  <BadgeCheck className="text-primary h-3.5 w-3.5" />
                  Quick tip
                </p>
                <p className="mt-1">
                  Read the timeline and eligibility carefully before submitting.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-lg">Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company:</span>
                  <span className="font-medium">{jobVacancy.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position:</span>
                  <span className="font-medium">{jobVacancy.position}</span>
                </div>
                {jobVacancy.salaryLabel ? (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Salary:</span>
                    <span className="text-right font-medium">
                      {jobVacancy.salaryLabel}
                    </span>
                  </div>
                ) : null}
                {jobVacancy.seniority ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">{jobVacancy.seniority}</span>
                  </div>
                ) : null}
                {jobVacancy.employmentType ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">
                      {jobVacancy.employmentType}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted:</span>
                  <span className="font-medium">
                    {formatDistanceToNow(jobVacancy.createdAt)} ago
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted by:</span>
                  <span className="font-medium">
                    {jobVacancy.createdBy.name}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
