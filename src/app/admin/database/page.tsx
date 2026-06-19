// src/app/admin/database/page.tsx
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { DatabaseAdminClient } from './database-admin-client';

export default async function DatabaseAdminPage() {
  const session = await auth()

  if (!session?.user || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    redirect("/");
  }

  return (
    <div className="max-w-5xl mx-auto">
      <DatabaseAdminClient userRole={session.user.role} />
    </div>
  );
}