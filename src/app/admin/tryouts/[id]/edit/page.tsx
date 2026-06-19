
import { api } from "~/trpc/server";
import TryoutForm from '../../create/form';
import type { TryoutFormData } from '../../create/form';

interface EditTryoutPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTryoutPage({ params }: EditTryoutPageProps) {

  const { id } = await params;
  const [tryout, courses] = await Promise.all([
    api.tryout.getForEdit({ id }),
    api.course.getAllCourses(),
  ]);

  const initialData: TryoutFormData = {
    id: tryout.id,
    title: tryout.title,
    description: tryout.description ?? "",
    duration: tryout.duration ?? 60,
    courseId: tryout.courseId,
    isActive: tryout.isActive,
    questions: tryout.questions.map(q => ({
      id: q.id,
      type: q.type,
      question: q.question,
      points: q.points,
      required: q.required,
      explanation: q.explanation,
      explanationImages: q.explanationImages,
      options: q.options?.map(opt => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.isCorrect,
        explanation: opt.explanation,
      })),
      images: q.images || [],
      shortAnswers: q.shortAnswers ?? [],
    })),
  };

  return (
    <div className="max-w-5xl mx-auto">
      <TryoutForm
        courses={courses}
        initialData={initialData}
        isEdit={true}
      />
    </div>
  );
}

export const metadata = {
  title: "Edit Tryout",
};