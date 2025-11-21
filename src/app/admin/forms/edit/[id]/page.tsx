import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { FormsBuilder } from '../../forms-builder';
import type { FormBuilderSchema } from "~/lib/types/forms";

// Page props in Next.js App Router
interface EditFormPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditFormPage({ params }: EditFormPageProps) {
  const { id } = await params;
  const form = await api.form.getById({ id });

  // If no form is found, render the 404 page
  if (!form) {
    notFound();
  }

  // The data from tRPC/Prisma should be compatible with our FormBuilderSchema.
  // We cast it to ensure type consistency for the component props.
  const initialData = form as unknown as FormBuilderSchema;

  return (
    <div className="container mx-auto max-w-5xl">
      <FormsBuilder mode="edit" initialData={{id: id, ...initialData}} />
    </div>
  );
}