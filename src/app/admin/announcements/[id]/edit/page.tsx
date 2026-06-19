import { api } from "~/trpc/server";
import { AnnouncementForm } from '../../announcement-form';
import { notFound } from "next/navigation";

interface EditAnnouncementPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAnnouncementPage({
  params,
}: EditAnnouncementPageProps) {
  const { id } = await params
  const courses = await api.course.getAllCourses();

  let announcement;
  try {
    announcement = await api.announcement.getById({ id });
  } catch {
    notFound();
  }

  if (!announcement) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <AnnouncementForm courses={courses} announcement={announcement} />
    </div>
  );
}
