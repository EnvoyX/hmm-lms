'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

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

  useEffect(() => {
    if (!token) {
      router.replace('/auth/verify-error?error=MissingToken');
      return;
    }
    verifyEmailMutation.mutate({ token });
  }, [token, router, verifyEmailMutation]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center w-sm gap-4 bg-card px-6 py-4 rounded-xl shadow">
        <div className="flex flex-col items-center gap-2">
          {verifyEmailMutation.isPending ? (
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          ) : (
            <CheckCircle2 className="w-12 h-12 text-primary" />
          )}
          <h1 className="font-semibold text-base text-center">
            {verifyEmailMutation.isPending ? 'Verifying Email...' : 'Email Verified'}
          </h1>
          <p className="text-sm text-center text-muted-foreground">
            {verifyEmailMutation.isPending
              ? 'Please wait while we verify your email address'
              : 'Your email has been verified successfully'}
          </p>
        </div>
      </div>
    </main>
  );
}
