import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function ScholarshipCreatePage() {
  const draft = await api.scholarship.createDraft();
  redirect(`/admin/scholarships/${draft.id}/edit`);
}
