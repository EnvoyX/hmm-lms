// ~/app/(student)/tryouts/page.tsx
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import {
  Clock,
  BookOpen,
  Users,
  Trophy,
  Calendar,
  PlayCircle,
} from "lucide-react";

export default async function TryoutsPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const courses = await api.tryout.getMyTryouts();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {courses.length === 0 ? (
        <section className="rounded-xl border border-dashed py-16 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No Courses Found</h3>
          <p className="text-muted-foreground">
            You need to be enrolled in courses to access tryouts.
          </p>
        </section>
      ) : (
        <div className="space-y-8">
          {courses.map((course) => (
            <section key={course.id} className="space-y-4 rounded-xl border p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{course.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Class Code: {course.classCode}
                  </p>
                </div>
                <Badge variant="outline">
                  {course.tryout.length} tryout{course.tryout.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {course.tryout.length === 0 ? (
                <div className="rounded-lg border border-dashed py-8 text-center">
                  <Trophy className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No tryouts available for this course
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {course.tryout
                    .filter((tryout) => tryout.isActive)
                    .map((tryout) => (
                      <TryoutCard key={tryout.id} tryout={tryout} />
                    ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

interface TryoutCardProps {
  tryout: {
    id: string;
    title: string;
    description: string | null;
    duration: number | null;
    isActive: boolean;
    createdAt: Date;
    _count: {
      questions: number;
      attempts: number;
    };
  };
}

function TryoutCard({ tryout }: TryoutCardProps) {
  return (
    <article className="rounded-lg border p-4 transition-colors hover:bg-muted/30">
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-base font-semibold">{tryout.title}</h3>
        <Badge variant={tryout.isActive ? "default" : "secondary"} className="shrink-0 ml-2">
            {tryout.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>
      {tryout.description && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {tryout.description}
        </p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span>{tryout._count.questions} questions</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{tryout._count.attempts} attempts</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{tryout.duration ? `${tryout.duration}m` : "No limit"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(tryout.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <Button asChild size="sm" className="mt-4 w-full">
        <Link href={`/tryouts/${tryout.id}`}>
          <PlayCircle className="h-4 w-4 mr-2" />
          Start Tryout
        </Link>
      </Button>
    </article>
  );
}

export const metadata = {
  title: "Tryouts",
};