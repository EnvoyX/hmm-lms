// ~/app/(student)/tryouts/[id]/attempt/[attemptId]/page.tsx
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { TryoutAttemptClient } from "./client";

interface TryoutAttemptPageProps {
  params: Promise<{
    id: string;
    attemptId: string;
  }>;
}

export default async function TryoutAttemptPage({ params }: TryoutAttemptPageProps) {
  const { id, attemptId } = await params;

  try {
    const [attempt, tryout] = await Promise.all([
      api.tryout.getActiveAttempt({ id }),
      api.tryout.getForStudent({ id }),
    ]);

    if (!attempt || attempt.id !== attemptId) {
      redirect(`/tryouts/${id}`);
    }

    return (
      <TryoutAttemptClient
        // @ts-expect-error Server Component
        attempt={attempt}
        // @ts-expect-error Server Component
        tryout={tryout}
        tryoutId={id}
      />
    );
  } catch {
    redirect(`/tryouts/${id}`);
  }
}

export const metadata = {
  title: "Taking Tryout",
};