import { api } from '~/trpc/server';
import { Button } from '~/components/ui/button';
import Link from 'next/link';
import CoursesList from './list'

export default async function AdminCoursesPage() {
  const courses = await api.course.getAllCourses();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Courses</h1>
        <Button asChild>
          <Link href="/admin/courses/create">Create Course</Link>
        </Button>
      </div>
      <CoursesList courses={courses} />
    </div>
  );
}
