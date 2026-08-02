'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

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
import { getUserByEmail } from '~/server/action';
import { sendResetPasswordEmail } from '~/server/action/send-reset-password';

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function RequestResetPasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      const user = await getUserByEmail(values.email);

      if (!user) {
        toast.error('If an account with this email exists, a password reset link has been sent.');
        setIsSubmitting(false);
        return;
      }

      const result = await sendResetPasswordEmail(values.email, user.name);

      if (result.success) {
        toast.success('Password reset link has been sent to your email.');
        router.push('/auth/sign-in');
      } else {
        toast.error(result.error || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center w-sm gap-4 bg-card px-6 py-4 rounded-xl shadow">
        <div className="flex flex-col mb-4 gap-2 items-center">
          <h1 className="font-semibold text-base">Reset Password</h1>
          <p className="text-center text-sm text-muted-foreground">
            Enter your email to receive a password reset link
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="nim@mahasiswa.itb.ac.id"
                      {...field}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v.includes('@')) {
                          field.onChange(v.replace(/@.*/, '@mahasiswa.itb.ac.id'));
                        } else {
                          field.onChange(v);
                        }
                      }}
                      type="email"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm">
          Remember your password?{' '}
          <Link href="/auth/sign-in">
            <span className="font-medium underline">Sign in</span>
          </Link>
        </p>
      </div>
    </main>
  );
}
