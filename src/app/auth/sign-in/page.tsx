'use client';

import { signIn, useSession } from 'next-auth/react';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { type z } from 'zod';
import { toast } from 'sonner';
import { signInSchema } from '~/lib/schema/auth';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect user if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const onSubmit = (data: z.infer<typeof signInSchema>) => {
    startTransition(async () => {
      const result = await signIn('credentials', {
        ...data,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Sign in failed.");
      } else {
        toast.success('Sign in success.');
        router.push('/dashboard');
        form.reset();
      }
    });
  };

  // Render a loading state or nothing while session status is determined
  if (status === 'loading' || session) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main className='relative w-full min-h-dvh flex items-center justify-center'>
      {/* Background Images */}
      <Image
        src='/hmm-vstock/bp-black-transparent.png'
        className='opacity-20 absolute left-0 bottom-0 w-2/5 md:w-1/6'
        alt='bp-black-transparent'
        width={2000}
        height={2000}
      />
      <Image
        src='/hmm-vstock/bp-black-transparent.png'
        className='opacity-20 absolute right-0 top-0 w-1/3 md:w-1/6'
        alt='bp-black-transparent'
        width={2000}
        height={2000}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col items-center w-sm gap-4 bg-card px-6 py-4 rounded-xl backdrop-blur-sm shadow'
        >
          <div className='flex flex-col mb-4 gap-2 items-center'>
            <h1 className='font-semibold text-base'>Sign in to your account</h1>
            <h4 className='text-center text-sm'>
              Enter your email below to sign in to your account
            </h4>
          </div>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className='self-start text-primary font-medium'>
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    className=''
                    type='email'
                    autoFocus
                    {...field}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v.includes('@')) {
                        field.onChange(v.replace(/@.*/, '@mahasiswa.itb.ac.id'));
                      } else {
                        field.onChange(v);
                      }
                    }}
                  />
                </FormControl>
                <FormDescription className='text-xs'>
                  131*****@mahasiswa.itb.ac.id
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className='self-start text-primary font-medium'>
                  Password
                </FormLabel>
                <FormControl>
                  <div className='relative items-center flex'>
                    <Input
                      className=''
                      type={showPassword ? 'text' : 'password'}
                      {...field}
                    />
                    {showPassword ? (
                      <FiEye
                        className='absolute right-3 cursor-pointer text-primary'
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <FiEyeOff
                        className='absolute right-3 cursor-pointer text-primary'
                        onClick={() => setShowPassword(true)}
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='w-full flex justify-end'>
            <Link href='/auth/forgot-password' className='text-xs text-muted-foreground hover:text-primary hover:underline'>
              Forgot password?
            </Link>
          </div>
          <Button
            type='submit'
            className='rounded-md w-full shadow-md'
            disabled={isPending || !form.formState.isDirty || !form.formState.isValid}
          >
            {isPending ? 'Signing in...' : 'Sign In'}
          </Button>
          <span className='flex gap-1 text-sm'>
            <h4>{"Don't have account?"}</h4>
            <Link href='/auth/sign-up'>
              <h4 className='font-medium underline'>Sign up</h4>
            </Link>
          </span>
        </form>
      </Form>
    </main>
  );
}