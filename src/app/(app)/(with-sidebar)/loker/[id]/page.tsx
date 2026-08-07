// ~/app/(student)/loker/[id]/page.tsx
import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { JobVacancyDetail } from '../loker-detail';

interface JobVacancyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobVacancyDetailPage({
  params,
}: JobVacancyDetailPageProps) {
  const { id } = await params;

  try {
    const jobVacancy = await api.loker.getById({ id });
    return <JobVacancyDetail jobVacancy={jobVacancy} />;
  } catch {
    notFound();
  }
}