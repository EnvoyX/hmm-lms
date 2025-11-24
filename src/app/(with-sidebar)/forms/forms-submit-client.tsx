"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";

import { api, type RouterOutputs } from "~/trpc/react";
import { QuestionRenderer } from "~/app/admin/forms/question-renderer";

import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { CheckCircle, Loader2, Eye } from "lucide-react";
import { useSession } from 'next-auth/react';

type FormWithQuestions = RouterOutputs["form"]["getById"];

interface FormSubmitClientProps {
  form: FormWithQuestions;
  isPreview?: boolean;
}

// Create a dynamic Zod schema based on the form's required questions
const createSubmissionSchema = (form: FormWithQuestions) => {
  const answerShape: Record<string, z.ZodTypeAny> = {};
  form.questions.forEach(q => {
    if (q.required) {
      answerShape[q.id] = z.any().refine(val => val !== null && val !== undefined && val !== '' && (!Array.isArray(val) || val.length > 0), {
        message: "This field is required.",
      });
    }
  });
  return z.object({
    answers: z.object(answerShape),
  });
};

interface Answer {
  questionId: string;
  textValue?: string;
  jsonValue?: unknown;
  numberValue?: number;
  dateValue?: Date;
}

export function FormSubmitClient({ form: initialForm, isPreview = false }: FormSubmitClientProps) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  // Check if user has already submitted this form
  // Skip this check if in preview mode
  const { data: submissionStatus, isLoading: isLoadingStatus } = api.form.getUserSubmissionStatus.useQuery(
    { formId: initialForm.id },
    { enabled: !isPreview && initialForm.requireAuth && sessionStatus === 'authenticated' }
  );

  const submitMutation = api.form.submit.useMutation();

  const formSchema = React.useMemo(() => createSubmissionSchema(initialForm), [initialForm]);

  const form = useForm<{ answers: Record<string, unknown> }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answers: {},
    },
  });

  const onSubmit = async (data: { answers: Record<string, unknown> }) => {
    if (isPreview) {
      toast.info("This is a preview. Submission is disabled.");
      return;
    }

    const formattedAnswers = Object.entries(data.answers).map(([questionId, value]) => {
      const question = initialForm.questions.find(q => q.id === questionId);
      if (!question) return null;

      const answer: Answer = { questionId };

      // Map the value to the correct field based on question type
      switch (question.type) {
        case 'SHORT_ANSWER':
        case 'LONG_ANSWER':
        case 'MULTIPLE_CHOICE':
        case 'NAME_SELECT':
        case 'NIM_SELECT':
        case 'TIME':
        case 'COURSE_SELECT':
        case 'EVENT_SELECT':
          // Ensure value is a string
          if (value !== undefined && value !== null) {
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
              answer.textValue = String(value);
            } else {
              answer.textValue = JSON.stringify(value);
            }
          }
          break;

        case 'MULTIPLE_SELECT':
          // Value should be an array of strings
          if (Array.isArray(value)) {
            answer.jsonValue = value;
          }
          break;

        case 'RATING':
          // Value should be a number
          if (value !== undefined && value !== null) {
            answer.numberValue = Number(value);
          }
          break;

        case 'DATE':
          // Value should be a Date object
          if (value instanceof Date) {
            answer.dateValue = value;
          } else if (typeof value === 'string') {
            answer.dateValue = new Date(value);
          }
          break;

        case 'FILE_UPLOAD':
          // TODO: Handle file uploads properly. 
          break;

        default:
          // Fallback for unknown types, try to store as text if string, or json otherwise
          if (typeof value === 'string') {
            answer.textValue = value;
          } else {
            answer.jsonValue = value;
          }
      }

      return answer;
    }).filter((ans): ans is NonNullable<typeof ans> => ans !== null);

    toast.promise(
      submitMutation.mutateAsync({
        formId: initialForm.id,
        answers: formattedAnswers,
      }),
      {
        loading: 'Submitting your response...',
        success: () => {
          router.push(`/forms/${initialForm.id}/result`);
          return 'Your response has been submitted!';
        },
        error: (err: Error) => err.message ?? "Failed to submit response.",
      }
    );
  };

  if (!isPreview && (isLoadingStatus || sessionStatus === 'loading')) {
    return <Card><CardContent className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" /><p className="mt-2 text-muted-foreground">Loading form...</p></CardContent></Card>;
  }

  if (!isPreview && !initialForm.allowMultipleSubmissions && submissionStatus) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
          <CardTitle className="mt-4">You&apos;ve Already Responded</CardTitle>
          <CardDescription>
            You submitted this form on {format(new Date(submissionStatus.submittedAt), "PPP")}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {isPreview && (
        <Alert className="bg-amber-50 border-amber-200">
          <Eye className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            You are viewing this form in <strong>Preview Mode</strong>. Submissions are disabled.
          </AlertDescription>
        </Alert>
      )}

      <Card className='max-sm:bg-transparent max-sm:border-0 max-sm:shadow-none'>
        <CardHeader className='max-sm:bg-card max-sm:py-4 max-sm:rounded-md max-sm:shadow-sm'>
          <CardTitle className="text-2xl">{initialForm.title}</CardTitle>
          {initialForm.description && (
            <CardDescription>{initialForm.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="py-0 max-sm:px-0">
          {!isPreview && initialForm.requireAuth && sessionStatus === 'unauthenticated' ? (
            <Alert variant="destructive">
              <AlertDescription>
                You must be signed in to submit this form. <Link href="/api/auth/signin" className="font-bold underline">Sign In</Link>
              </AlertDescription>
            </Alert>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {initialForm.questions.map((question) => (
                  <QuestionRenderer key={question.id} question={question} form={form} />
                ))}
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={submitMutation.isPending || isPreview}>
                      {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPreview ? "Submit (Disabled in Preview)" : "Submit"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}