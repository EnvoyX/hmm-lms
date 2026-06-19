import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { Badge } from "~/components/ui/badge";
import { ResponsesClient } from "./responses-client";

export default async function FormResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [form, submissionsData] = await Promise.all([
    api.form.getById({ id }),
    api.form.getSubmissions({ formId: id, limit: 100 }), // Fetching up to 100 submissions
  ]);

  if (!form) {
    notFound();
  }

  const { submissions } = submissionsData;

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">Responses</Badge>
          {form.isPublished ? (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">Published</Badge>
          ) : (
            <Badge variant="outline">Draft</Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{form.title}</h1>
        {form.description && (
          <p className="text-muted-foreground mt-2">{form.description}</p>
        )}
      </header>

      <ResponsesClient form={form} submissions={submissions} />
    </div>
  );
}