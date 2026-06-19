// ~/app/admin/tryouts/page.tsx
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { api } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import TryoutsList from './list';

export default async function AdminTryoutsPage() {
  const session = await auth();

  if (!session || (session.user.role !== Role.ADMIN && session.user.role !== Role.SUPERADMIN)) {
    redirect("/");
  }

  const tryouts = await api.tryout.getAll();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Tryouts</h1>
          <p className="text-muted-foreground">
            Create and manage tryouts for your courses
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tryouts/create">Create Tryout</Link>
        </Button>
      </div>

      <TryoutsList tryouts={tryouts} />
    </div>
  );
}

export const metadata = {
  title: "Manage Tryouts",
};