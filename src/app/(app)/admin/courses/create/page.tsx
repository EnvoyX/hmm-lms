import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function CourseCreatePage() {
  const draft = await api.course.createDraft();
  redirect(`/admin/courses/${draft.id}/edit`);
}
