import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function AnnouncementCreatePage() {
  const draft = await api.announcement.createDraft();
  redirect(`/admin/announcements/${draft.id}/edit`);
}
