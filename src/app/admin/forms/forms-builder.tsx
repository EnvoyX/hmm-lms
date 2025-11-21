// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "~/trpc/react";

import {
  formBuilderSchema,
  type FormBuilderSchema,
} from "~/lib/types/forms"; // Using the types file we created

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { Plus, Trash2, GripVertical } from "lucide-react";

import { QuestionBuilderItem } from "./question-builder"; // The new sub-component
import { Switch } from "~/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

// Helper to create a default empty question
const createDefaultQuestion = (order: number): FormBuilderSchema['questions'][number] => ({
  id: crypto.randomUUID(), // Temporary client-side ID
  title: "",
  description: "",
  type: 'MULTIPLE_CHOICE',
  required: false,
  order,
  settings: {
    options: [
      { id: crypto.randomUUID(), text: "", value: "option_1" },
      { id: crypto.randomUUID(), text: "", value: "option_2" },
    ],
    allowOther: false,
  },
});

interface FormsBuilderProps {
  initialData?: FormBuilderSchema & { id:  string};
  mode: 'create' | 'edit';
}

export function FormsBuilder({ initialData, mode }: FormsBuilderProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = api.useContext();

  // --- tRPC Mutations ---
  const createFormMutation = api.form.create.useMutation();
  const updateFormMutation = api.form.update.useMutation();
  // We'll need individual question mutations because the backend is structured that way
  const createQuestionMutation = api.form.createQuestion.useMutation();
  const updateQuestionMutation = api.form.updateQuestion.useMutation();
  const deleteQuestionMutation = api.form.deleteQuestion.useMutation();
  const reorderQuestionsMutation = api.form.reorderQuestions.useMutation();

  const form = useForm<FormBuilderSchema>({
    resolver: zodResolver(formBuilderSchema),
    defaultValues:
      mode === 'edit' && initialData
        ? initialData
        : {
          title: "",
          description: "",
          type: "NORMAL",
          isPublished: false,
          isActive: true,
          allowMultipleSubmissions: false,
          requireAuth: true,
          showProgressBar: true,
          collectEmail: true,
          questions: [createDefaultQuestion(0)],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const addQuestion = () => {
    append(createDefaultQuestion(fields.length));
  };

  const onSubmit: SubmitHandler<FormBuilderSchema> = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading(mode === 'edit' ? 'Updating form...' : 'Creating form...');

    try {
      if (mode === 'edit' && initialData?.id) {
        // --- EDIT MODE LOGIC ---
        const formId = initialData.id;

        // 1. Update form settings
        await updateFormMutation.mutateAsync({ id: formId, ...data });

        // 2. Sync Questions (Create new, Update existing)
        const updatePromises = data.questions.map(async (q, index) => {
          const questionPayload = { ...q, order: index, formId };
          // Check if question is new by checking if ID is a CUID (Prisma default) or temporary UUID
          if (q.id.length > 25) { // Simple check: UUIDs are longer than CUIDs
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...createData } = questionPayload; // remove temporary ID
            return createQuestionMutation.mutateAsync(createData);
          } else {
            return updateQuestionMutation.mutateAsync(questionPayload);
          }
        });
        await Promise.all(updatePromises);

        // 3. Delete questions that were removed
        const newQuestionIds = new Set(data.questions.map(q => q.id));
        const questionsToDelete = initialData.questions.filter(q => !newQuestionIds.has(q.id));
        const deletePromises = questionsToDelete.map(q => deleteQuestionMutation.mutateAsync({ id: q.id }));
        await Promise.all(deletePromises);

        // 4. Reorder (optional but good for consistency)
        await reorderQuestionsMutation.mutateAsync({ formId, questionIds: data.questions.map(q => q.id) })


      } else {
        // --- CREATE MODE LOGIC ---
        // 1. Create the form to get an ID
        const newForm = await createFormMutation.mutateAsync({
          title: data.title,
          description: data.description,
          type: data.type,
        });

        // 2. Create each question associated with the new form ID
        const questionPromises = data.questions.map((q, index) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...createData } = q; // remove temporary ID
          return createQuestionMutation.mutateAsync({ ...createData, order: index, formId: newForm.id });
        });
        await Promise.all(questionPromises);
      }

      toast.success("Form saved successfully!", { id: toastId });
      await utils.form.getMyForms.invalidate();
      router.push("/admin/forms");
      router.refresh();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative">
        {/* Basic Information Card */}
        <Card>
          <CardHeader><CardTitle>Form Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Event Registration" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="Provide details about your form..." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel>Form Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a form type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HOTLINE">Hotline</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Form Settings Card */}
        <Card>
          <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="requireAuth" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Require Sign-in</FormLabel><FormDescription>Users must be logged in to respond.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="allowMultipleSubmissions" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Allow Multiple Responses</FormLabel><FormDescription>If off, users can only respond once.</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Questions Card */}
        <Card>
          <CardHeader><CardTitle>Questions ({fields.length})</CardTitle></CardHeader>
          <CardContent className="space-y-8">
            {fields.map((field, index) => (
              <div key={field.id} className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <Badge variant="secondary">Question {index + 1}</Badge>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:text-destructive" disabled={fields.length <= 1}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <QuestionBuilderItem form={form} questionIndex={index} />
                {index < fields.length - 1 && <Separator className="mt-8" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Floating Add Button */}
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

        {/* Submission Bar */}
        <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t p-4 flex justify-end gap-4 z-40">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Form"}
          </Button>
        </div>
      </form>
    </Form>
  );
}