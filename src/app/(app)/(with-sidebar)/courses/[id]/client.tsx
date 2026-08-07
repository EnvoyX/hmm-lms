'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import ResourceItem, { type ResourceWithDetails } from '../resourse-item';
import {
  BookOpen, FileText, Video, Award, Clock, ClipboardList, Users, Star, FileQuestion, Presentation, Loader2
} from 'lucide-react';
import { api } from '~/trpc/react';
import { type AppRouter } from '~/server/api/root';
import { type inferRouterOutputs } from '@trpc/server';
import { Badge } from '~/components/ui/badge';
import DocumentViewer from '~/components/document-viewer';

type RouterOutputs = inferRouterOutputs<AppRouter>;
type CourseDataType = RouterOutputs['course']['getCourseById'];

interface CourseContentClientProps {
  initialCourseData: CourseDataType;
  courseId: string;
}

const ResourceCategorySection = ({
  title,
  icon: Icon,
  resources,
  onViewResource
}: {
  title: string;
  icon: React.ElementType;
  resources: ResourceWithDetails[];
  onViewResource: (resource: ResourceWithDetails) => void;
}) => {
  if (!resources || resources.length === 0) {
    return (
      <section className="space-y-3 border-b border-border/70 pb-6 last:border-b-0">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </h3>
        <p className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">No resources in this category yet.</p>
      </section>
    );
  }
  return (
    <section className="space-y-3 border-b border-border/70 pb-6 last:border-b-0">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h3>
      <div className="grid gap-3">
        {resources.map((resource) => (
          <ResourceItem key={resource.id} resource={resource} onViewResource={onViewResource} />
        ))}
      </div>
    </section>
  );
};

export default function CourseContentClient({ initialCourseData, courseId }: CourseContentClientProps) {
  const [selectedResource, setSelectedResource] = useState<ResourceWithDetails | null>(null);
  const [openViewer, setOpenViewer] = useState(false);

  const { data: materials, isLoading, error } = api.course.getCourseMaterials.useQuery({ id: courseId });

  const course = initialCourseData;

  const handleViewResource = (resource: ResourceWithDetails) => {
    setSelectedResource(resource);
    setOpenViewer(true);
  };

  const sectionLinks = [
    { id: 'materials', label: 'Materials' },
    { id: 'problems', label: 'Problems' },
    { id: 'tryouts', label: 'Tryouts' },
    { id: 'videos', label: 'Videos' },
  ] as const;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading course materials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center h-40 p-4 border border-destructive/50 bg-destructive/10 rounded-lg flex flex-col justify-center items-center">
        <p className="font-semibold text-destructive">Failed to load materials</p>
        <p className="text-sm text-destructive/80">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {selectedResource && (
          <DocumentViewer resource={selectedResource} open={openViewer} onOpenChange={setOpenViewer} />
        )}
        <nav className="sticky top-3 z-20 -mx-1 overflow-x-auto rounded-xl border border-border/80 bg-background p-2 shadow-sm">
          <div className="flex min-w-max items-center gap-2 px-1">
            {sectionLinks.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-full border border-border/80 bg-muted/60 px-3 py-1.5 text-sm font-semibold text-foreground/90 transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
              >
                {section.label}
              </a>
            ))}
          </div>
        </nav>

        <section id="materials" className="scroll-mt-24 space-y-6 rounded-xl border border-border/80 bg-card/40 p-4 shadow-sm md:p-5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">Materials</h2>
          </div>
          <div className="h-px bg-border/80" />
            <ResourceCategorySection title="E-books" icon={BookOpen} resources={materials?.E_BOOK ?? []} onViewResource={handleViewResource} />
            <ResourceCategorySection title="Presentations & Slides" icon={Presentation} resources={materials?.PRESENTATION ?? []} onViewResource={handleViewResource} />
            <ResourceCategorySection title="Notes" icon={FileText} resources={materials?.NOTES ?? []} onViewResource={handleViewResource} />
            <ResourceCategorySection title="Syllabus" icon={Star} resources={materials?.SYLLABUS ?? []} onViewResource={handleViewResource} />
            <ResourceCategorySection title="Other Resources" icon={ClipboardList} resources={materials?.OTHER ?? []} onViewResource={handleViewResource} />
        </section>

        <section id="problems" className="scroll-mt-24 space-y-6 rounded-xl border border-border/80 bg-card/40 p-4 shadow-sm md:p-5">
          <div className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">Problems</h2>
          </div>
          <div className="h-px bg-border/80" />
            <ResourceCategorySection title="Problems & Past Exams" icon={FileQuestion} resources={materials?.PROBLEMS ?? []} onViewResource={handleViewResource} />
        </section>

        <section id="tryouts" className="scroll-mt-24 space-y-4 rounded-xl border border-border/80 bg-card/40 p-4 shadow-sm md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight text-foreground">Tryouts</h2>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{course.tryout.length} total</span>
          </div>
          <div className="grid gap-4">
              {course.tryout.map((tryout) => (
                <article key={tryout.id} className="rounded-lg border border-border/80 bg-background p-4 transition-colors hover:border-primary/40 hover:bg-primary/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="flex items-center gap-2 text-base font-semibold">
                        <Award className="h-4 w-4" />
                        {tryout.title}
                      </h4>
                      <p className="text-sm text-muted-foreground/90">
                        {tryout.description ?? 'No description available'}
                      </p>
                    </div>
                    <Badge variant={tryout.isActive ? "default" : "secondary"}>
                      {tryout.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-foreground/80 sm:text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {tryout.duration ? `${tryout.duration} minutes` : 'No time limit'}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClipboardList className="h-4 w-4" />
                        {tryout._count.questions} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {tryout._count.attempts} attempts
                      </span>
                    </div>
                    <Button asChild size="sm" disabled={!tryout.isActive}>
                      <Link href={`/tryouts/${tryout.id}`} className='text-sm'>
                        Start Tryout
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
              {course.tryout.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 py-10 text-center">
                  <Award className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">No tryouts available yet.</p>
                </div>
              )}
          </div>
        </section>

        <section id="videos" className="scroll-mt-24 space-y-6 rounded-xl border border-border/80 bg-card/40 p-4 shadow-sm md:p-5">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">Videos</h2>
          </div>
          <div className="h-px bg-border/80" />
            <ResourceCategorySection title="Learning Videos" icon={Video} resources={materials?.VIDEO ?? []} onViewResource={handleViewResource} />
        </section>

        {course.announcements.length > 0 && (
          <section className="space-y-4 rounded-xl border border-border/80 bg-card/40 p-4 shadow-sm md:p-5">
            <h3 className="text-xl font-bold tracking-tight">Recent Announcements</h3>
            {course.announcements.map((announcement) => (
              <div key={announcement.id} className="rounded-md border-l-2 border-primary bg-background/60 px-3 py-2">
                <h4 className="font-semibold">{announcement.title}</h4>
                <p className="line-clamp-2 text-sm text-foreground/80">
                  {announcement.content}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  By {announcement.createdBy.name} • {formatDistanceToNow(announcement.createdAt)} ago
                </p>
              </div>
            ))}
          </section>
        )}
      </div>
    </>
  );
}