'use client';

import cn from 'cnfast';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '~/components/ui/button';

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
};

export default function VerifyErrorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'MissingToken';
  const errorInfo = errorMessages[error] || errorMessages.MissingToken;

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
            <Link
              href={`/api/resend-verification?email=${searchParams.get('email')}`}
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
                {isLoading ? 'Sending...' : 'Request New Verification Email'}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
