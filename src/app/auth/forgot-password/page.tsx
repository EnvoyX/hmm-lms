"use client";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";
import { toast } from "sonner";
import { forgotPasswordSchema } from "~/lib/schema/auth";
import { api } from "~/trpc/react";
import { RiArrowLeftLine, RiMailLine } from "@remixicon/react";

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const requestResetMutation = api.auth.requestPasswordReset.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setIsSubmitted(true);
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to send reset email. Please try again.",
      );
    },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    requestResetMutation.mutate(values);
  };

  if (isSubmitted) {
    return (
      <main className="relative flex min-h-dvh w-full items-center justify-center">
        <Image
          src="/hmm-vstock/bp-black-transparent.png"
          className="absolute bottom-0 left-0 w-2/5 opacity-20 md:w-1/6"
          alt="bp-black-transparent"
          width={2000}
          height={2000}
        />
        <Image
          src="/hmm-vstock/bp-black-transparent.png"
          className="absolute top-0 right-0 w-1/3 opacity-20 md:w-1/6"
          alt="bp-black-transparent"
          width={2000}
          height={2000}
        />
        <div className="bg-card flex w-sm flex-col items-center gap-4 rounded-xl px-6 py-8 text-center shadow backdrop-blur-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <RiMailLine className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-lg font-semibold">Check Your Email</h1>
          <p className="text-muted-foreground text-sm">
            If an account exists with that email and has a recovery email set,
            we&apos;ve sent password reset instructions to your alternative
            email.
          </p>
          <p className="text-muted-foreground text-xs">
            The link will expire in 1 hour.
          </p>
          <Link href="/auth/sign-in" className="w-full">
            <Button variant="outline" className="mt-4 w-full">
              <RiArrowLeftLine className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center">
      <Image
        src="/hmm-vstock/bp-black-transparent.png"
        className="absolute bottom-0 left-0 w-2/5 opacity-20 md:w-1/6"
        alt="bp-black-transparent"
        width={2000}
        height={2000}
      />
      <Image
        src="/hmm-vstock/bp-black-transparent.png"
        className="absolute top-0 right-0 w-1/3 opacity-20 md:w-1/6"
        alt="bp-black-transparent"
        width={2000}
        height={2000}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-card flex w-sm flex-col items-center gap-4 rounded-xl px-6 py-4 shadow backdrop-blur-sm"
        >
          <div className="mb-4 flex flex-col items-center gap-2">
            <h1 className="text-base font-semibold">Forgot Password</h1>
            <h4 className="text-muted-foreground text-center text-sm">
              Enter your ITB email and we&apos;ll send a reset link to your
              alternative email
            </h4>
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-primary self-start font-medium">
                  ITB Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoFocus
                    placeholder="13122080@mahasiswa.itb.ac.id"
                    {...field}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v.includes("@")) {
                        field.onChange(
                          v.replace(/@.*/, "@mahasiswa.itb.ac.id"),
                        );
                      } else {
                        field.onChange(v);
                      }
                    }}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Enter your registered ITB student email
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full rounded-md shadow-md"
            disabled={
              requestResetMutation.isPending ||
              !form.formState.isDirty ||
              !form.formState.isValid
            }
          >
            {requestResetMutation.isPending ? "Sending..." : "Send Reset Link"}
          </Button>
          <Link
            href="/auth/sign-in"
            className="text-muted-foreground hover:text-primary text-sm"
          >
            <span className="flex items-center gap-1">
              <RiArrowLeftLine className="h-4 w-4" />
              Back to Sign In
            </span>
          </Link>
        </form>
      </Form>
    </main>
  );
}
