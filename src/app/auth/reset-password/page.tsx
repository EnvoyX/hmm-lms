'use client';

import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { type z } from 'zod';
import { toast } from 'sonner';
import { resetPasswordSchema } from '~/lib/schema/auth';
import { api } from '~/trpc/react';
import { RiArrowLeftLine, RiCheckLine, RiErrorWarningLine, RiLoader4Line } from '@remixicon/react';

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Verify token
  const { data: tokenData, isLoading: isVerifying, error: verifyError } = 
    api.auth.verifyResetToken.useQuery(
      { token: token ?? '' },
      { enabled: !!token, retry: false }
    );

  const resetMutation = api.auth.resetPassword.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/auth/sign-in');
      }, 3000);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset password. Please try again.');
    },
  });

  const onSubmit = (values: ResetPasswordFormValues) => {
    if (!token) return;
    resetMutation.mutate({ ...values, token });
  };

  // No token provided
  if (!token) {
    return (
      <div className='flex flex-col items-center w-sm gap-4 bg-card px-6 py-8 rounded-xl backdrop-blur-sm shadow text-center'>
        <div className='w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center'>
          <RiErrorWarningLine className='w-8 h-8 text-red-600 dark:text-red-400' />
        </div>
        <h1 className='font-semibold text-lg'>Invalid Link</h1>
        <p className='text-sm text-muted-foreground'>
          No reset token was provided. Please request a new password reset link.
        </p>
        <Link href='/auth/forgot-password' className='w-full'>
          <Button className='w-full mt-4'>Request New Link</Button>
        </Link>
      </div>
    );
  }

  // Verifying token
  if (isVerifying) {
    return (
      <div className='flex flex-col items-center w-sm gap-4 bg-card px-6 py-8 rounded-xl backdrop-blur-sm shadow text-center'>
        <RiLoader4Line className='w-12 h-12 animate-spin text-primary' />
        <p className='text-sm text-muted-foreground'>Verifying reset link...</p>
      </div>
    );
  }

  // Token verification failed
  if (verifyError) {
    return (
      <div className='flex flex-col items-center w-sm gap-4 bg-card px-6 py-8 rounded-xl backdrop-blur-sm shadow text-center'>
        <div className='w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center'>
          <RiErrorWarningLine className='w-8 h-8 text-red-600 dark:text-red-400' />
        </div>
        <h1 className='font-semibold text-lg'>Link Expired or Invalid</h1>
        <p className='text-sm text-muted-foreground'>
          {verifyError.message || 'This password reset link is no longer valid.'}
        </p>
        <Link href='/auth/forgot-password' className='w-full'>
          <Button className='w-full mt-4'>Request New Link</Button>
        </Link>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className='flex flex-col items-center w-sm gap-4 bg-card px-6 py-8 rounded-xl backdrop-blur-sm shadow text-center'>
        <div className='w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
          <RiCheckLine className='w-8 h-8 text-green-600 dark:text-green-400' />
        </div>
        <h1 className='font-semibold text-lg'>Password Reset Successful!</h1>
        <p className='text-sm text-muted-foreground'>
          Your password has been updated. Redirecting to sign in...
        </p>
        <Link href='/auth/sign-in' className='w-full'>
          <Button variant='outline' className='w-full mt-4'>
            <RiArrowLeftLine className='w-4 h-4 mr-2' />
            Go to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col items-center w-sm gap-4 bg-card px-6 py-4 rounded-xl backdrop-blur-sm shadow'
      >
        <div className='flex flex-col mb-4 gap-2 items-center'>
          <h1 className='font-semibold text-base'>Reset Your Password</h1>
          <h4 className='text-center text-sm text-muted-foreground'>
            Hello <span className='font-medium'>{tokenData?.userName}</span>, enter your new password below
          </h4>
        </div>
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='w-full'>
              <FormLabel className='self-start text-primary font-medium'>New Password</FormLabel>
              <FormControl>
                <div className='relative items-center flex'>
                  <Input type={showPassword ? 'text' : 'password'} {...field} />
                  {showPassword ? (
                    <FiEye className='absolute right-3 cursor-pointer text-primary' onClick={() => setShowPassword(false)} />
                  ) : (
                    <FiEyeOff className='absolute right-3 cursor-pointer text-primary' onClick={() => setShowPassword(true)} />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem className='w-full'>
              <FormLabel className='self-start text-primary font-medium'>Confirm Password</FormLabel>
              <FormControl>
                <div className='relative items-center flex'>
                  <Input type={showConfirmPassword ? 'text' : 'password'} {...field} />
                  {showConfirmPassword ? (
                    <FiEye className='absolute right-3 cursor-pointer text-primary' onClick={() => setShowConfirmPassword(false)} />
                  ) : (
                    <FiEyeOff className='absolute right-3 cursor-pointer text-primary' onClick={() => setShowConfirmPassword(true)} />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type='submit'
          className='rounded-md w-full shadow-md'
          disabled={resetMutation.isPending || !form.formState.isDirty || !form.formState.isValid}
        >
          {resetMutation.isPending ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </Form>
  );
}

export default function ResetPassword() {
  return (
    <main className='relative w-full min-h-dvh flex items-center justify-center'>
      <Image src='/hmm-vstock/bp-black-transparent.png' className='opacity-20 absolute left-0 bottom-0 w-2/5 md:w-1/6' alt='bp-black-transparent' width={2000} height={2000} />
      <Image src='/hmm-vstock/bp-black-transparent.png' className='opacity-20 absolute right-0 top-0 w-1/3 md:w-1/6' alt='bp-black-transparent' width={2000} height={2000} />
      <Suspense fallback={<div className='flex flex-col items-center w-sm gap-4 bg-card px-6 py-8 rounded-xl backdrop-blur-sm shadow text-center'><RiLoader4Line className='w-12 h-12 animate-spin text-primary' /></div>}>
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}

