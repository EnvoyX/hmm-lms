/* eslint-disable */
// @ts-nocheck

"use client";

import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Save, Trash2, ArrowLeft, Loader2 } from "lucide-react";

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
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

import { api } from "~/trpc/react";
import {
  type FormBuilderSchema,
  formBuilderSchema,
  QUESTION_TYPE_CONFIG,
} from "~/lib/types/forms";
import { QuestionBuilderItem } from "./question-builder";

import { useState } from "react";

interface FormsBuilderProps {
  mode: "create" | "edit";
  initialData?: FormBuilderSchema & { id: string };
}

export function FormsBuilder({ mode, initialData }: FormsBuilderProps) {
  const [activeTab, setActiveTab] = useState("questions");
  const router = useRouter();
  const utils = api.useUtils();

  const form = useForm<FormBuilderSchema>({
    resolver: zodResolver(formBuilderSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      type: "NORMAL",
      isPublished: false,
      isActive: true,
      allowMultipleSubmissions: false,
      requireAuth: true,
      showProgressBar: true,
      collectEmail: true,
      questions: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const createForm = api.form.create.useMutation({
    onSuccess: () => {
      toast.success("Form created successfully");
      router.push("/admin/forms");
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Error creating form: ${error.message}`);
    },
  });

  const updateForm = api.form.update.useMutation({
    onSuccess: () => {
      toast.success("Form updated successfully");
      utils.form.getById.invalidate({ id: initialData?.id ?? "" });
      router.push("/admin/forms");
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Error updating form: ${error.message}`);
    },
  });

  const onSubmit = (data: FormBuilderSchema) => {
    // Ensure questions have correct order
    const formattedData = {
      ...data,
      questions: data.questions.map((q, index) => ({
        ...q,
        order: index,
      })),
    };

    if (mode === "create") {
      createForm.mutate(formattedData);
    } else if (mode === "edit" && initialData?.id) {
      updateForm.mutate({
        id: initialData.id,
        ...formattedData,
      });
    }
  };

  const addQuestion = () => {
    append({
      id: crypto.randomUUID(),
      title: "",
      type: "SHORT_ANSWER",
      required: false,
      order: fields.length,
      settings: { placeholder: "" },
    });
  };

  const isSubmitting = createForm.isPending || updateForm.isPending;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {mode === "create" ? "Create New Form" : "Edit Form"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {mode === "create" ? "Create Form" : "Save Changes"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-6">
              {/* Main Form Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Form Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Form Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Event Registration" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the purpose of this form..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Questions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Questions</h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addQuestion}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="rounded-full bg-muted p-4 mb-4">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-lg">No questions yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start building your form by adding a question.
                      </p>
                      <Button type="button" onClick={addQuestion}>
                        Add First Question
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="relative group">
                        <div className="absolute right-4 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <QuestionBuilderItem
                          form={form}
                          questionIndex={index}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {fields.length > 0 && (
                  <div className="h-4" /> // Spacer
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Form Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NORMAL">Normal</SelectItem>
                            <SelectItem value="HOTLINE">Hotline</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Hotline forms appear in the dedicated Hotline section.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Published</FormLabel>
                          <FormDescription>
                            Make this form visible to users.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Accept new submissions.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requireAuth"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Require Login</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="collectEmail"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Collect Email</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allowMultipleSubmissions"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Multiple Submissions</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="showProgressBar"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Progress Bar</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>

      {/* Floating Add Question Button */}
      {activeTab === "questions" && (
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            type="button"
            className="rounded-full aspect-square px-0 h-10 w-10"
            onClick={addQuestion}
          >
            <Plus className="" />
          </Button>
        </div>
      )}
    </div>
  );
}
