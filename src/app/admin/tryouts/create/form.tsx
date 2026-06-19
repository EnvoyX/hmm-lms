// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuestionType } from "@prisma/client";
import { api } from "~/trpc/react";
import {
  createTryoutSchema,
  type CreateTryoutInput,
} from "~/lib/schema/tryout";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical } from "lucide-react";

import QuestionBuilder from "./question-builder";
import type { RouterOutputs } from "~/trpc/react";

type Course = RouterOutputs["course"]["getAllCourses"][number];

export type TryoutFormData = {
  id?: string;
  title: string;
  description?: string | null;
  duration?: number | null;
  courseId: string;
  isActive?: boolean;
  questions: Array<{
    id?: string;
    type: QuestionType;
    question: string;
    points: number;
    required: boolean;
    images?: string[];
    explanation?: string | null;
    explanationImages?: string[]; // Add this
    options?: Array<{
      id?: string;
      text: string;
      isCorrect: boolean;
      explanation?: string | null;
      images?: string[];
    }>;
    // Data from DB can be string[], but form will use { value: string }[]
    shortAnswers?: { value: string }[] | string[];
  }>;
};

interface TryoutFormProps {
  courses: Course[];
  initialData?: TryoutFormData;
  isEdit?: boolean;
}

export default function TryoutForm({
  courses,
  initialData,
  isEdit = false
}: TryoutFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTryout = api.tryout.create.useMutation({
    onSuccess: () => {
      toast.success("Tryout created successfully!");
      router.push("/admin/tryouts");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateTryout = api.tryout.update.useMutation({
    onSuccess: () => {
      toast.success("Tryout updated successfully!");
      router.push("/admin/tryouts");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<CreateTryoutInput>({
    resolver: zodResolver(createTryoutSchema),
    defaultValues: initialData ? {
      ...initialData,
      description: initialData.description ?? "",
      duration: initialData.duration ?? 60,
      questions: initialData.questions.map(q => ({
        ...q,
        points: q.points ?? 1,
        required: q.required ?? true,
        images: q.images ?? [],
        explanation: q.explanation ?? "",
        explanationImages: q.explanationImages ?? [], // Add this
        options: q.options?.map(opt => ({
          ...opt,
          explanation: opt.explanation ?? "",
          images: opt.images ?? [],
        })) ?? [],
        shortAnswers: Array.isArray(q.shortAnswers) ? q.shortAnswers.map(s => typeof s === 'string' ? { value: s } : s) : [],
      }))
    } : {
      title: "",
      description: "",
      duration: 60,
      courseId: "",
      questions: [
        {
          type: QuestionType.MULTIPLE_CHOICE_SINGLE,
          question: "",
          points: 1,
          required: true,
          images: [],
          explanation: "",
          explanationImages: [], // Add this
          options: [
            { text: "", isCorrect: false, explanation: "", images: [] },
            { text: "", isCorrect: false, explanation: "", images: [] },
          ],
          shortAnswers: [],
        },
      ],
    },
  });


  useEffect(() => {
    // If we are in 'edit' mode and have data, reset the form with that data.
    if (isEdit && initialData) {
      form.reset({
        ...initialData,
        description: initialData.description ?? "",
        duration: initialData.duration ?? 60,
        questions: initialData.questions.map(q => ({
          ...q,
          points: q.points ?? 1,
          required: q.required ?? true,
          images: q.images ?? [],
          explanation: q.explanation ?? "",
          options: q.options?.map(opt => ({
            ...opt,
            explanation: opt.explanation ?? "",
            images: opt.images ?? [],
          })) ?? [],
          // The same transformation logic is needed here
          shortAnswers: Array.isArray(q.shortAnswers)
            ? q.shortAnswers.map(s => (typeof s === 'string' ? { value: s } : s))
            : [],
        }))
      });
    }
  }, [initialData, isEdit, form]); // Correct dependencies

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  // ⬇️ *** THIS IS THE MAIN FIX *** ⬇️
  const onSubmit: SubmitHandler<CreateTryoutInput> = async (data) => {
    setIsSubmitting(true);
    try {
      if (isEdit && initialData?.id) {
        await updateTryout.mutateAsync({
          id: initialData.id,
          ...data,
        });
      } else {
        await createTryout.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const addQuestion = () => {
    append({
      type: QuestionType.MULTIPLE_CHOICE_SINGLE,
      question: "",
      points: 1,
      required: true,
      images: [],
      explanation: "",
      explanationImages: [],
      options: [
        { text: "", isCorrect: false, explanation: "", images: [] },
        { text: "", isCorrect: false, explanation: "", images: [] },
      ],
      shortAnswers: [{
        value: ""
      }],
    });

    setTimeout(() => {
      const questionElements = document.querySelectorAll('[data-question-index]');
      const lastQuestion = questionElements[questionElements.length - 1];
      if (lastQuestion) {
        lastQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-12">
          {/* The rest of the JSX is unchanged... */}
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input placeholder="Enter tryout title" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl><Textarea placeholder="Enter tryout description" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="courseId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>{course.title} ({course.classCode})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="duration" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl><Input type="number" min="1" placeholder="60" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} value={field.value ?? 60} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Questions ({fields.length})</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="relative" data-question-index={index}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <Badge variant="outline">Question {index + 1}</Badge>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-destructive hover:text-destructive" disabled={fields.length === 1}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <QuestionBuilder form={form} questionIndex={index} tryoutId={initialData?.id ?? ''} />
                  {index < fields.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Tryout" : "Create Tryout")}
            </Button>
          </div>
        </form>
      </Form>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" onClick={addQuestion} className="sticky bottom-6 left-6 h-10 w-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50" size="icon">
              <Plus className="w-6 h-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left"><p>Add Question</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}