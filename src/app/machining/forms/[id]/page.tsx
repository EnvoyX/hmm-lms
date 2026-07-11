import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { FormSubmitClient } from "~/app/machining/forms/forms-submit-client";

interface AssignmentSubmitPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AssignmentSubmitPage({
  params,
}: AssignmentSubmitPageProps) {
  const { id } = await params;
  const form = await api.form.getById({ id });

  if (form.type !== "MACHINING") {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 md:py-6">
      <FormSubmitClient
        form={form}
        basePath="/machining/forms"
        dashboardHref="/machining"
      />
    </div>
  );
}
