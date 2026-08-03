'use client';

import { Loader2, MailWarning } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { api } from '~/trpc/react';

export default function NotVerifiedPage() {
  const [isLoading, setIsLoading] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();

  const resendVerificationMutation = api.auth.resendVerificationEmail.useMutation({
    onSuccess: () => {
      toast.success('Verification email has been sent to your email.');
      router.replace('/auth/resend-success');
    },
    onError: (error) => {
      console.error('Error resending verification email:', error);
      toast.error('Failed to send verification email. Please try again.');
    },
  });

  const handleSignOut = async () => {
    setIsLoading(true);
    const toastId = toast.loading('Signing out...');
    await signOut();
    toast.dismiss(toastId);
    setIsLoading(false);
  };
  async function resendVerificationEmail() {
    const email = session?.user?.email;
    if (!email) {
      toast.error('No email found in session');
      return;
    }
    resendVerificationMutation.mutate({ email });
  }

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
    router.replace('/auth/sign-in');
    return null;
  } else if (status === 'authenticated' && session.user.verified) {
    router.replace('/auth/sign-in');
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
          <Button
            disabled={resendVerificationMutation.isPending || isLoading}
            onClick={resendVerificationEmail}
            variant="outline"
            className="w-full"
          >
            {resendVerificationMutation.isPending ? 'Sending...' : 'Resend Verification Email'}
          </Button>
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
