// ~/components/admin/job-vacancy/edit-job-vacancy-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { toast } from "sonner";
import type { JobVacancyWithCreator } from "~/lib/types/loker";
import { AVAILABLE_STREAMS } from "~/app/(with-sidebar)/loker/loker-filter";

const updateJobVacancySchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  eligibility: z.string().min(1, "Eligibility is required"),
  streams: z.array(z.string()).min(1, "At least one stream is required"),
  overview: z.string().min(1, "Overview is required"),
  timeline: z.string().min(1, "Timeline is required"),
  applyLink: z.string().url("Valid URL is required"),
  salaryLabel: z.string().max(120).optional(),
  seniority: z.string().max(64).optional(),
  employmentType: z.string().max(64).optional(),
});

type UpdateJobVacancyForm = z.infer<typeof updateJobVacancySchema>;

interface EditJobVacancyDialogProps {
  jobVacancy: JobVacancyWithCreator;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditJobVacancyDialog({
  jobVacancy,
  open,
  onOpenChange,
  onSuccess,
}: EditJobVacancyDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateJobVacancyForm>({
    resolver: zodResolver(updateJobVacancySchema),
    defaultValues: {
      title: "",
      company: "",
      position: "",
      eligibility: "",
      streams: [],
      overview: "",
      timeline: "",
      applyLink: "",
      salaryLabel: "",
      seniority: "",
      employmentType: "",
    },
  });

  useEffect(() => {
    if (jobVacancy) {
      form.reset({
        title: jobVacancy.title,
        company: jobVacancy.company,
        position: jobVacancy.position,
        eligibility: jobVacancy.eligibility,
        streams: jobVacancy.streams,
        overview: jobVacancy.overview,
        timeline: jobVacancy.timeline,
        applyLink: jobVacancy.applyLink,
        salaryLabel: jobVacancy.salaryLabel ?? "",
        seniority: jobVacancy.seniority ?? "",
        employmentType: jobVacancy.employmentType ?? "",
      });
    }
  }, [jobVacancy, form]);

  const updateMutation = api.loker.update.useMutation({
    onSuccess: () => {
      toast.success("Job vacancy updated successfully");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: UpdateJobVacancyForm) => {
    setIsSubmitting(true);
    const opt = (s: string | undefined) => {
      const t = s?.trim();
      return t === "" || t === undefined ? undefined : t;
    };
    updateMutation.mutate({
      id: jobVacancy.id,
      ...data,
      salaryLabel: opt(data.salaryLabel),
      seniority: opt(data.seniority),
      employmentType: opt(data.employmentType),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Vacancy</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Frontend Developer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Tech Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position/Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Jakarta, Remote" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="salaryLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary (display)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Competitive, IDR 8–12M / month"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seniority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seniority</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Junior, Mid, Senior"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Internship, Full-time"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="eligibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eligibility</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Who can apply for this position..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="streams"
              render={() => (
                <FormItem>
                  <FormLabel>Available Streams/Tracks</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_STREAMS.map((stream) => (
                      <FormField
                        key={stream}
                        control={form.control}
                        name="streams"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(stream)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, stream])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== stream,
                                        ),
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {stream}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="overview"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overview</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Job description and requirements..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeline</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Application deadline, interview process, etc..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="applyLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://company.com/careers/apply"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Job Vacancy"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
