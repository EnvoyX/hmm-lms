// src/app/admin/database/_components/create-record-dialog.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { ScrollArea } from "~/components/ui/scroll-area";

interface CreateRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelName: string;
  displayName: string;
  onSuccess: () => void;
}

// Define field types for different models
const MODEL_FIELDS: Record<string, Record<string, { type: string; required?: boolean; options?: string[] }>> = {
  user: {
    email: { type: "email", required: true },
    name: { type: "text", required: true },
    password: { type: "password", required: true },
    nim: { type: "text", required: true },
    faculty: { type: "text" },
    program: { type: "text" },
    position: { type: "text" },
    role: { type: "select", options: ["ADMIN", "STUDENT", "SUPERADMIN"], required: true },
  },
  course: {
    title: { type: "text", required: true },
    description: { type: "textarea" },
    classCode: { type: "text", required: true },
  },
  tryout: {
    title: { type: "text", required: true },
    description: { type: "textarea" },
    duration: { type: "number" },
    isActive: { type: "boolean" },
    courseId: { type: "text", required: true },
  },
  event: {
    title: { type: "text", required: true },
    description: { type: "textarea" },
    start: { type: "datetime-local", required: true },
    end: { type: "datetime-local", required: true },
    allDay: { type: "boolean" },
    location: { type: "text" },
    color: { type: "select", options: ["SKY", "AMBER", "VIOLET", "ROSE", "EMERALD", "ORANGE"] },
    createdById: { type: "text", required: true },
  },
  announcement: {
    title: { type: "text", required: true },
    content: { type: "textarea", required: true },
    scope: { type: "select", options: ["GLOBAL", "COURSE"], required: true },
    createdById: { type: "text", required: true },
    courseId: { type: "text" },
  },
  scholarship: {
    title: { type: "text", required: true },
    description: { type: "textarea", required: true },
    provider: { type: "text", required: true },
    deadline: { type: "datetime-local", required: true },
    link: { type: "url", required: true },
    createdById: { type: "text", required: true },
  },
  document: {
    title: { type: "text", required: true },
    description: { type: "textarea" },
    filename: { type: "text", required: true },
    key: { type: "text", required: true },
    mimeType: { type: "text", required: true },
    size: { type: "number", required: true },
    type: { type: "select", options: ["EBOOK", "PRESENTATION", "DOCUMENT", "SPREADSHEET", "IMAGE", "VIDEO", "AUDIO", "EXAM", "MATERIAL"], required: true },
    courseId: { type: "text", required: true },
    uploadedById: { type: "text", required: true },
  },
  jobVacancy: {
    title: { type: "text", required: true },
    company: { type: "text", required: true },
    position: { type: "text", required: true },
    eligibility: { type: "text", required: true },
    streams: { type: "array" },
    overview: { type: "textarea", required: true },
    timeline: { type: "textarea", required: true },
    applyLink: { type: "url", required: true },
    isActive: { type: "boolean" },
    createdById: { type: "text", required: true },
  },
  courseTestimonial: {
    comment: { type: "textarea", required: true },
    rating: { type: "number", required: true },
    userId: { type: "text", required: true },
    courseId: { type: "text", required: true },
  },
};

export function CreateRecordDialog({
  open,
  onOpenChange,
  modelName,
  displayName,
  onSuccess,
}: CreateRecordDialogProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = api.database.createRecord.useMutation({
    onSuccess: () => {
      toast.success(`Successfully created ${displayName}`);
      setFormData({});
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to create ${displayName}: ${error.message}`);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const fields = useMemo(() => {
    return MODEL_FIELDS[modelName] ?? {};
  }, [modelName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Process form data
    const processedData: Record<string, string | number | boolean | string[] | null> = {};

    Object.entries(formData).forEach(([key, value]) => {
      const fieldConfig = fields[key];
      if (!fieldConfig) return;

      if (fieldConfig.type === "number" && typeof value === "string") {
        processedData[key] = value ? parseInt(value, 10) : null;
      } else if (fieldConfig.type === "boolean") {
        processedData[key] = Boolean(value);
      } else if (fieldConfig.type === "array" && typeof value === "string") {
        processedData[key] = value.split(",").map(s => s.trim()).filter(Boolean);
      } else if (fieldConfig.type === "datetime-local" && typeof value === "string") {
        processedData[key] = value ? new Date(value).toISOString() : null;
      } else if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        Array.isArray(value) ||
        value === null
      ) {
        processedData[key] = value as string | number | boolean | string[] | null;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        processedData[key] = value !== undefined ? String(value) : null;
      }
    });

    await createMutation.mutateAsync({
      model: modelName as never,
      data: processedData,
    });
  };

  const updateFormData = (key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderField = (key: string, config: { type: string; required?: boolean; options?: string[] }) => {
    const value = formData[key];

    switch (config.type) {
      case "textarea":
        return (
          <Textarea
            value={(value as string) || ""}
            onChange={(e) => updateFormData(key, e.target.value)}
            placeholder={`Enter ${key}`}
            rows={3}
          />
        );

      case "select":
        return (
          <Select
            value={(value as string) || ""}
            onValueChange={(newValue) => updateFormData(key, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${key}`} />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={Boolean(value)}
              onCheckedChange={(checked) => updateFormData(key, checked)}
            />
            <Label className="text-sm font-normal">
              {key === "isActive" ? "Active" : key === "allDay" ? "All Day" : "Yes"}
            </Label>
          </div>
        );

      case "number":
        return (
          <Input
            type="number"
            value={(value as string) || ""}
            onChange={(e) => updateFormData(key, e.target.value)}
            placeholder={`Enter ${key}`}
          />
        );

      case "datetime-local":
        return (
          <Input
            type="datetime-local"
            value={(value as string) || ""}
            onChange={(e) => updateFormData(key, e.target.value)}
          />
        );

      case "email":
        return (
          <Input
            type="email"
            value={(value as string) || ""}
            onChange={(e) => updateFormData(key, e.target.value)}
            placeholder={`Enter ${key}`}
          />
        );

      case "password":
        return (
          <Input
            type="password"
            value={(value as string) || ""}
            onChange={(e) => updateFormData(key, e.target.value)}
            placeholder={`Enter ${key}`}
          />
        );

      case "url":
        return (
          <Input
            type="url"
            value={(value as string) || ""}
            onChange={(e) => updateFormData(key, e.target.value)}
            placeholder={`Enter ${key}`}
          />
        );

      case "array":
        return (
          <Input
            value={(value as string) || ""}
            onChange={(e) => updateFormData(key, e.target.value)}
            placeholder="Enter comma-separated values"
          />
        );

      default:
        return (
          <Input
            value={(value as string) || ""}
            onChange={(e) => updateFormData(key, e.target.value)}
            placeholder={`Enter ${key}`}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Create New {displayName}</span>
          </DialogTitle>
          <DialogDescription>
            Fill in the details to create a new {displayName.toLowerCase()} record.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-96 pr-4">
            <div className="space-y-4 py-4">
              {Object.entries(fields).map(([key, config]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="text-sm font-medium">
                    {key}
                    {config.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {renderField(key, config)}
                </div>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create {displayName}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}