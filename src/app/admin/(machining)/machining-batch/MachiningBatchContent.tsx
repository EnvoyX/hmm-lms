"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

const batchSchema = z.object({
  batch: z.string().min(1, "Batch number is required"),
});

type BatchForm = z.infer<typeof batchSchema>;

export default function MachiningBatchContent() {
  const [existingId, setExistingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  

  const form = useForm<BatchForm>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      batch: "",
    },
  });

  const { data: batchData } = api.machining.getBatch.useQuery();
   const utils = api.useUtils();

  useEffect(() => {
    if (batchData) {
      if (batchData.data) {
        form.setValue("batch", batchData.data.currentBatch);
        setExistingId(batchData.data.id);
      }
      setIsLoading(false);
    }
  }, [batchData, form]);

  const createMutation = api.machining.createBatch.useMutation({
    onSuccess: () => {
      toast.success("Batch created successfully");
      void utils.machining.getBatch.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = api.machining.updateBatch.useMutation({
    onSuccess: () => {
      toast.success("Batch updated successfully");
      void utils.machining.getBatch.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: BatchForm) => {
    if (existingId) {
      updateMutation.mutate({
        id: existingId,
        batch: data.batch,
      });
    } else {
      createMutation.mutate({
        batch: data.batch,
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Machining Batch</h1>
        <p className="text-muted-foreground">
          Manage machining batch settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Batch Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="batch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Number</FormLabel>
                      <FormControl>
                        <Input placeholder="13125" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : existingId
                      ? "Update Batch"
                      : "Create Batch"}
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