import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { WeeklyPodiumPopup } from '~/components/hall-of-fame/weekly-podium-popup';
import { InstallPrompt } from '~/components/install-prompt';
// import { NotificationPromptModal } from '~/components/notif-prompt-modal';
import { auth } from '~/server/auth';
import { Role } from "@prisma/client";
import MachiningNavbar from '~/components/machining/machining-navbar';

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  const isStudent = session?.user && (session.user.role === Role.STUDENT);
  if (isStudent) {
    redirect("/dashboard")
  }

  if (!session) {
    redirect('/auth/sign-in');
  }

  return (
    <MachiningNavbar>
      <Suspense fallback={<div className='w-full h-full grid place-items-center'>Fetching data...</div>}>
        <InstallPrompt />
        <WeeklyPodiumPopup />
        {/* <NotificationPromptModal /> */}
        {children}
      </Suspense>
    </MachiningNavbar>
  )
}

export const metadata = {
  title: {
    default: "LMS",
    template: "%s | Machining",
  },
}
