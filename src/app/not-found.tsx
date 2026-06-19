"use client";

// import type { Metadata } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '~/components/ui/button';

export default function NotFound() {
  const router = useRouter();
  return (
    <main className='flex flex-col gap-4 min-h-dvh w-full justify-center items-center'>
      <div className='text-center flex flex-col gap-2'>
        <p className='text-2xl md:text-4xl font-medium'>404</p>
        <p className=''>{'Sorry, page could not be found'}</p>
      </div>
      <div className="flex gap-4 text-primary">
        <Button variant='ghost' asChild>
          <Link
            href='/'
          >
            Home
          </Link>
        </Button>
        <Button variant='ghost' onClick={() => router.back()} className='cursor-pointer'>
          Back
        </Button>
      </div>
    </main>
  );
}

// export const metadata: Metadata = {
//   title: "404 - Page Not Found",
// }