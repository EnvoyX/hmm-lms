// ~/app/admin/courses/[id]/course-settings.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Settings, Save, Trash2, Loader2 } from 'lucide-react';
import { api } from '~/trpc/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { type RouterOutputs } from '~/trpc/react';

type Course = RouterOutputs['course']['getCourseForAdmin'];

interface CourseSettingsProps {
  course: Course;
}

export default function CourseSettings({ course }: CourseSettingsProps) {
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description ?? '',
    classCode: course.classCode,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const router = useRouter();
  const utils = api.useUtils();

  const updateCourseMutation = api.course.updateCourse.useMutation({
    onSuccess: async () => {
      toast.success('Course updated successfully');
      await utils.course.getCourseForAdmin.invalidate({ id: course.id });
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  const deleteCourseMutation = api.course.deleteCourse.useMutation({
    onSuccess: () => {
      toast.success('Course deleted successfully');
      router.push('/admin/courses');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    updateCourseMutation.mutate({
      id: course.id,
      ...formData,
    });
  };

  const handleDeleteCourse = () => {
    deleteCourseMutation.mutate({ id: course.id });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Course Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="classCode">Class Code</Label>
              <Input
                id="classCode"
                value={formData.classCode}
                onChange={(e) => setFormData(prev => ({ ...prev, classCode: e.target.value }))}
                required
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Course description"
                disabled={isUpdating}
              />
            </div>

            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Course
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Deleting this course will permanently remove all associated data including:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>All course documents and materials</li>
              <li>All tryouts and questions</li>
              <li>All student attempts and progress</li>
              <li>All announcements</li>
              <li>Member enrollments</li>
            </ul>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Course
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Course</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you absolutely sure you want to delete &quot;{course.title}&quot;?
                    This action cannot be undone and will permanently delete all course data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteCourse}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Course
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}