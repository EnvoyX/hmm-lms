import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import AdminNavbar from '~/components/admin/navbar';
import { auth } from '~/server/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isAdmin =
    session?.user && (session.user.role === Role.ADMIN || session.user.role === Role.SUPERADMIN);
  // Redirect non-admin users
  if (!session || !isAdmin) {
    redirect('/dashboard');
  } else if (!session.user.verified) {
    redirect(`/auth/not-verified?email=${session.user.email}`);
  }

  return (
    <AdminNavbar>
      <Suspense
        fallback={<div className="w-full h-full grid place-items-center">Fetching data...</div>}
      >
        {children}
      </Suspense>
    </AdminNavbar>
  );
}

export const metadata = {
  title: {
    template: '%s - Admin Panel',
    default: 'Admin Panel',
  },
  description: 'Admin panel for HMM ITB',
};
