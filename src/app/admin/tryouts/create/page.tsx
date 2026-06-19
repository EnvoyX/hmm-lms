import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function TryoutCreatePage() {

  const draft = await api.tryout.createDraft();
  redirect(`/admin/tryouts/${draft.id}/edit`);
}
