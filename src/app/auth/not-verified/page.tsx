'use client';

import cn from 'cnfast';
import { Loader2, MailWarning } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';

export default function NotVerifiedPage() {
  const [isLoading, setIsLoading] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoading(true);
    const toastId = toast.loading('Signing out...');
    await signOut();
    toast.dismiss(toastId);
    setIsLoading(false);
  };

  if (status === 'loading') {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center w-sm gap-4 bg-card px-6 py-4 rounded-xl shadow">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-12 h-12 text-destructive animate-spin" />
            </div>
          </div>
        </div>
      </>
    );
  } else if (status === 'unauthenticated') {
    router.push('/auth/sign-in');
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center w-sm gap-4 bg-card px-6 py-4 rounded-xl shadow">
        <div className="flex flex-col items-center gap-2">
          <MailWarning className="w-12 h-12 text-destructive" />
          <h1 className="font-semibold text-base text-center">Email Not Verified</h1>
          <p className="text-sm text-center text-muted-foreground">
            Your email address has not been verified yet. Please check your email for the
            verification link.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Link
            href={`/api/resend-verification?email=${session?.user?.email}`}
            className={cn('w-full', {
              'pointer-events-none cursor-not-allowed': isLoading,
            })}
          >
            <Button
              disabled={isLoading}
              onClick={() => setIsLoading(true)}
              variant="outline"
              className="w-full"
            >
              {isLoading ? 'Sending...' : 'Resend Verification Email'}
            </Button>
          </Link>
          {/* <Link href="/auth/sign-in" className="w-full">
            <Button className="w-full">Back to Sign In</Button>
          </Link> */}
          <Button
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full"
            variant="destructive"
          >
            {isLoading ? 'Signing out...' : 'Sign Out'}
          </Button>
        </div>
      </div>
    </main>
  );
}
