"use client";

import React from "react";
import { api } from "~/trpc/react";
import { FormSubmitClient } from "~/app/(with-sidebar)/forms/forms-submit-client";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter, useParams } from "next/navigation";

export default function AdminFormPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: form, isLoading, error } = api.form.getById.useQuery({ id: id! });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="container mx-auto max-w-5xl text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Form</h1>
        <p className="text-muted-foreground mb-6">
          {error?.message ?? "Form not found or you don't have permission to view it."}
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5 xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Forms
        </Button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Form Preview</h1>
          <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
            Admin Preview Mode
          </div>
        </div>
      </div>
      
      <FormSubmitClient form={form} isPreview={true} />
    </div>
  );
}
