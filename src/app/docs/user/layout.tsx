import { Role } from '@prisma/client';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { baseOptions } from '~/lib/layout.shared.user';
import { userSource } from '~/lib/source';
import { auth } from '~/server/auth';

export default async function Layout({ children }: LayoutProps<'/docs/user'>) {
  const session = await auth();

  const isMachining = session?.user && session.user.role === Role.MACHINING;

  if (isMachining) {
    redirect('/machining');
  } else if (!session) {
    redirect('/auth/sign-in');
  } else if (!session.user.verified) {
    redirect(`/auth/not-verified?email=${session.user.email}`);
  }
  return (
    <DocsLayout
      tree={userSource.getPageTree()}
      {...baseOptions()}
      links={[
        {
          icon: <ArrowLeft className="size-4" />,
          text: 'Back to Dashboard',
          url: '/dashboard',
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
