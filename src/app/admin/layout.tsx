// ~/app/admin/layout.tsx
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import AdminNavbar from '~/components/admin/navbar';
import { Suspense } from 'react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAdmin = session?.user && (session.user.role === Role.ADMIN || session.user.role === Role.SUPERADMIN);
  // Redirect non-admin users
  if (!session || !isAdmin) {
    redirect("/");
  }

  return <AdminNavbar>
    <Suspense fallback={<div className='w-full h-full grid place-items-center'>Fetching data...</div>}>
      {children}
    </Suspense>
  </AdminNavbar>;
}

export const metadata = {
  title: {
    template: "%s - Admin Panel",
    default: "Admin Panel",
  },
  description: "Admin panel for HMM ITB",
};