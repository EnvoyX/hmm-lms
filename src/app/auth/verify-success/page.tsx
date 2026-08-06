'use client';

import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '~/components/ui/button';

export default function VerifySuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center w-sm gap-4 bg-card px-6 py-4 rounded-xl shadow">
        <div className="flex flex-col items-center gap-2">
          <CheckCircle className="w-12 h-12 text-green-500" />
          <h1 className="font-semibold text-base text-center">Email Verified Successfully</h1>
          <p className="text-sm text-center text-muted-foreground">
            Your email has been verified. You can now sign in to your account.
          </p>
        </div>

        <Link href="/auth/sign-in" className="w-full">
          <Button className="w-full">Go to Sign In</Button>
        </Link>
      </div>
    </main>
  );
}
