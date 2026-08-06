import { Role } from '@prisma/client';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { baseOptions } from '~/lib/layout.shared.admin';
import { adminSource } from '~/lib/source';
import { auth } from '~/server/auth';

export default async function Layout({ children }: LayoutProps<'/docs/admin'>) {
  const session = await auth();
  const isAdmin =
    session?.user && (session.user.role === Role.ADMIN || session.user.role === Role.SUPERADMIN);

  if (!session || !isAdmin) {
    redirect('/dashboard');
  } else if (!session.user.verified) {
    redirect(`/auth/not-verified?email=${session.user.email}`);
  }

  return (
    <DocsLayout
      tree={adminSource.getPageTree()}
      {...baseOptions()}
      links={[
        {
          icon: <ArrowLeft className="size-4" />,
          text: 'Back to Admin Dashboard',
          url: '/admin',
          active: 'none',
        },
      ]}
      githubUrl="https://github.com/Himpunan-Mahasiswa-Mesin-ITB/hmm-lms"
    >
      <Suspense fallback={<div className="w-full h-full grid place-items-center">Loading...</div>}>
        {children}
      </Suspense>
    </DocsLayout>
  );
}
