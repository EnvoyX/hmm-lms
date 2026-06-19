import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import {
  BookOpen,
  Users,
  Lock,
  Award,
  Star,
  BookMarked
} from 'lucide-react';
import { type Prisma } from '@prisma/client';

type CourseForPreview = Prisma.CourseGetPayload<{
  include: {
    testimonial: { include: { user: true } };
    _count: {
      select: {
        members: true;
        tryout: true;
        resources: true;
      };
    };
  };
}>

const getInitials = (name: string | null) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
};

interface CoursePreviewProps {
  course: CourseForPreview;
}

export default function CoursePreview({ course }: CoursePreviewProps) {
  const previewItems = [
    {
      title: "Learning Resources",
      description: "Access e-books, videos, presentations, and notes",
      icon: BookOpen,
      count: `${course._count.resources} resources`,
    },
    {
      title: "Practice Tryouts",
      description: "Test your knowledge with practice exams",
      icon: Award,
      count: `${course._count.tryout} tryouts`,
    },
  ];

  return (
    <div className="space-y-8">
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Course Preview</CardTitle>
          <CardDescription>
            Enroll in this course to access all materials and resources
          </CardDescription>
        </CardHeader>
      </Card>

      {course.syllabus && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookMarked className="h-6 w-6 text-primary" />
              <CardTitle>Syllabus</CardTitle>
            </div>
            <CardDescription>An overview of the topics you&apos;ll master in this course.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {course.syllabus}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>What you&apos;ll get access to:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {previewItems.map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg border bg-muted/20">
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{item.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {item.count}
                  </Badge>
                </div>
                <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {course.testimonial && course.testimonial.length > 0 && (
        <div className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {course.testimonial.map((testimonial, index) => (
              <Card key={index} className="flex flex-col">
                <CardContent className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center mb-4">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < testimonial.rating
                          ? 'text-primary fill-primary'
                          : 'text-muted-foreground/50 fill-muted'
                          }`}
                      />
                    ))}
                  </div>
                  <blockquote className="text-muted-foreground flex-grow italic">
                    &ldquo;{testimonial.comment}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3 mt-6">
                    <Avatar>
                      <AvatarImage src={testimonial.user.image ?? undefined} alt={testimonial.user.name ?? 'User'} />
                      <AvatarFallback>{getInitials(testimonial.user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.user.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.user.nim}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold">
              <Users className="h-6 w-6 text-muted-foreground" />
              {course._count.members}
            </div>
            <p className="text-sm text-muted-foreground">Students Enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold">
              <Award className="h-6 w-6 text-muted-foreground" />
              {course._count.tryout}
            </div>
            <p className="text-sm text-muted-foreground">Practice Tryouts</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}