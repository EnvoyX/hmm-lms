'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // For redirection after success
import { signIn } from 'next-auth/react'; // Optional: For auto-login after register

// Shadcn UI Components
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { toast } from 'sonner';
import { signUpSchema } from '~/lib/schema/auth';
import { api } from '~/trpc/react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiEye, FiEyeOff } from 'react-icons/fi';

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (session) {
      router.replace('/dashboard');
    }
  }, [session, router]);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      nim: '',
      password: '',
      confirmPassword: '',
    },
  });

  // tRPC mutation hook for registration
  const signupMutation = api.auth.signUp.useMutation({
    onSuccess: async (data) => {
      toast.success(data.message || "Registration successful!");

      const loginResult = await signIn('credentials', {
        redirect: false, // Prevent NextAuth.js from redirecting automatically
        email: form.getValues('email'), // Get email from form state
        password: form.getValues('password'), // Get password from form state
      });

      if (loginResult?.error) {
        toast.error("Auto-login failed. Please log in manually.");
        router.push('/auth/sign-in'); // Redirect to login page if auto-login fails
      } else {
        router.push('/auth/sign-in'); // Redirect to dashboard after successful auto-login
      }
    },
    onError: (error) => {
      // tRPCError has a 'message' property that includes the error message from the server
      toast.error(error.message || "Registration failed. Please try again.");

      // If it's a CONFLICT error (email exists), you might want to specifically set it on the email field
      if (error.data?.code === 'CONFLICT') {
        form.setError('email', { type: 'manual', message: error.message });
      }
    },
  });

  const onSubmit = (values: SignUpFormValues) => {
    signupMutation.mutate(values); // Call the tRPC mutation
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
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
      <div className="flex flex-col items-center w-sm gap-4 bg-card px-6 py-4 rounded-xl shadow">
        <h1 className='font-semibold text-base'>Sign up to HMM LMS</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Adi Haditya Nursyam" {...field} autoFocus disabled={signupMutation.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nim"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIM</FormLabel>
                  <FormControl>
                    <Input placeholder="131xxxxx" {...field} disabled={signupMutation.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="nim@mahasiswa.itb.ac.id"  {...field} onChange={(e) => {
                      const v = e.target.value;
                      if (v.includes('@')) {
                        field.onChange(v.replace(/@.*/, '@mahasiswa.itb.ac.id'));
                      } else {
                        field.onChange(v);
                      }
                    }}
                      type="email" disabled={signupMutation.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <Input

                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        disabled={signupMutation.isPending}
                      />
                      {showPassword ? (
                        <FiEye
                          className="absolute right-3 cursor-pointer text-primary"
                          onClick={() => setShowPassword(false)}
                        />
                      ) : (
                        <FiEyeOff
                          className="absolute right-3 cursor-pointer text-primary"
                          onClick={() => setShowPassword(true)}
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <Input

                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        disabled={signupMutation.isPending}
                      />
                      {showConfirmPassword ? (
                        <FiEye
                          className="absolute right-3 cursor-pointer text-primary"
                          onClick={() => setShowConfirmPassword(false)}
                        />
                      ) : (
                        <FiEyeOff
                          className="absolute right-3 cursor-pointer text-primary"
                          onClick={() => setShowConfirmPassword(true)}
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={signupMutation.isPending || !form.formState.isValid}>
              {signupMutation.isPending ? 'Signing Up...' : 'Sign Up'}
            </Button>
          </form>
        </Form>
        <p className="text-center text-sm">
          Already have an account?{' '}
          <Link href='/auth/sign-in'>
            <span className='font-medium underline'>Sign in</span>
          </Link>
        </p>
      </div>
    </main>
  );
}