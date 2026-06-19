import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import ScholarshipSettings from "./scholarship-settings";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ScholarshipEditPage({ params }: PageProps) {
  const { id } = await params;
  const scholarship = await api.scholarship.getById({ id });

  if (!scholarship) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ScholarshipSettings scholarship={scholarship} />
    </div>
  );
}
