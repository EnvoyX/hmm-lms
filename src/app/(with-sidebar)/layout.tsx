import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { InstallPrompt } from '~/components/install-prompt';
import MainNavbar from '~/components/main/navbar';
// import { NotificationPromptModal } from '~/components/notif-prompt-modal';
import { auth } from '~/server/auth';

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/sign-in');
  }

  return (
    <MainNavbar>
      <Suspense fallback={<div className='w-full h-full grid place-items-center'>Fetching data...</div>}>
        <InstallPrompt />
        {/* <NotificationPromptModal /> */}
        {children}
      </Suspense>
    </MainNavbar>
  )
}

export const metadata = {
  title: {
    default: "LMS",
    template: "%s | HMM LMS",
  },
}