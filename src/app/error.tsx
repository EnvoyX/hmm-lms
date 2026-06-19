'use client';

import type { Metadata } from 'next';
import { Button } from '~/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className='flex flex-col gap-4 min-h-dvh w-full justify-center items-center text-error'>
      <div className='text-center flex flex-col gap-2'>
        <p className='text-2xl md:text-4xl font-medium'>Error</p>
        <p
          className=''>{error.message ?
            error.message : 'Oops... an Error occurred'}</p>
      </div>
      <Button
        onClick={reset}
        className='text-primary'
        variant='ghost'
      >
        Try Again
      </Button>
    </main>
  );
}

export const metadata: Metadata = {
  title: '500 - Error',
};
