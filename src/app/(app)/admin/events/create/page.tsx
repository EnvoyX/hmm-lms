import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function EventCreatePage() {
  const draft = await api.event.createDraft();
  redirect(`/admin/events/${draft.id}/edit`);
}
