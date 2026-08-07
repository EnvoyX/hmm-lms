'use client';

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryStates, parseAsString } from 'nuqs';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { api } from '~/trpc/react';

const errorMessages: Record<string, { title: string; description: string }> = {
  MissingToken: {
    title: 'Verification Token Missing',
    description:
      'No verification token was provided. Please check your email for the verification link.',
  },
  InvalidToken: {
    title: 'Invalid Verification Token',
    description: 'The verification token is invalid. Please request a new verification email.',
  },
  TokenExpired: {
    title: 'Verification Token Expired',
    description: 'The verification link has expired. Please request a new verification email.',
  },
  MissingEmail: {
    title: 'Email Address Missing',
    description: 'No email address was provided to send verification link.',
  },
  UserNotFound: {
    title: 'User Not Found',
    description: 'The user account associated with this email could not be found.',
  },
  AlreadyVerified: {
    title: 'Already Verified',
    description: 'This email address is already verified.',
  },
};

export default function VerifyErrorPage() {
  const router = useRouter();
  const [{ error, email }] = useQueryStates({
    error: parseAsString.withDefault('MissingToken'),
    email: parseAsString,
  });

  const errorInfo = errorMessages[error] || errorMessages.MissingToken;

  const resendVerificationMutation = api.auth.resendVerificationEmail.useMutation({
    onSuccess: () => {
      toast.success('Verification email has been sent to your email.');
      router.replace('/auth/resend-success');
    },
    onError: (err) => {
      console.error('Error resending verification email:', err);
      toast.error('Failed to send verification email. Please try again.');
    },
  });

  async function resendVerificationEmail() {
    if (!email) {
      toast.error('No email provided');
      return;
    }
    resendVerificationMutation.mutate({ email });
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center w-sm gap-4 bg-card px-6 py-4 rounded-xl shadow">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <h1 className="font-semibold text-base text-center">{errorInfo?.title}</h1>
          <p className="text-sm text-center text-muted-foreground">{errorInfo?.description}</p>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Link href="/auth/sign-in" className="w-full">
            <Button className="w-full">Back to Sign In</Button>
          </Link>
          {error === 'TokenExpired' && (
            <Button
              disabled={resendVerificationMutation.isPending}
              type="button"
              onClick={resendVerificationEmail}
              variant="outline"
              className="w-full"
            >
              {resendVerificationMutation.isPending
                ? 'Sending...'
                : 'Request New Verification Email'}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
