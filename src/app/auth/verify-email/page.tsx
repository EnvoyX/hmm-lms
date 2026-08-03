'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { api } from '~/trpc/react';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const verifyEmailMutation = api.auth.verifyEmail.useMutation({
    onSuccess: () => {
      toast.success('Email verified successfully');
      router.replace('/auth/verify-success');
    },
    onError: (error) => {
      console.error('Error verifying email:', error);
      const email = searchParams.get('email');
      const errorParam = error.message || 'InvalidToken';
      router.replace(`/auth/verify-error?error=${errorParam}${email ? `&email=${email}` : ''}`);
    },
  });

  const handleVerify = () => {
    if (!token) {
      router.replace('/auth/verify-error?error=MissingToken');
      return;
    }
    verifyEmailMutation.mutate({ token });
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center w-sm gap-4 bg-card px-6 py-4 rounded-xl shadow">
        <div className="flex flex-col items-center gap-2">
          {verifyEmailMutation.isSuccess ? (
            <CheckCircle2 className="w-12 h-12 text-primary" />
          ) : verifyEmailMutation.isPending ? (
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          ) : (
            <CheckCircle2 className="w-12 h-12 text-muted-foreground" />
          )}
          <h1 className="font-semibold text-base text-center">
            {verifyEmailMutation.isSuccess
              ? 'Email Verified'
              : verifyEmailMutation.isPending
                ? 'Verifying Email...'
                : 'Verify Email'}
          </h1>
          <p className="text-sm text-center text-muted-foreground">
            {verifyEmailMutation.isSuccess
              ? 'Your email has been verified'
              : verifyEmailMutation.isPending
                ? 'Please wait while we verify your email...'
                : 'Click the button below to verify your email'}
          </p>
        </div>

        {!verifyEmailMutation.isSuccess && (
          <Button
            onClick={handleVerify}
            disabled={verifyEmailMutation.isPending}
            className="w-full"
          >
            {verifyEmailMutation.isPending ? 'Verifying...' : 'Verify Email'}
          </Button>
        )}
      </div>
    </main>
  );
}
