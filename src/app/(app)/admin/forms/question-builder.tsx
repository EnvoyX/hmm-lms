"use client";

import type { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import {
  type FormBuilderSchema,
  QUESTION_TYPE_CONFIG,
  type FormQuestionType,
} from "~/lib/types/forms";
import { cn } from "~/lib/utils";

import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { AlertCircle, Plus, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Checkbox } from "~/components/ui/checkbox";

interface QuestionBuilderItemProps {
  form: UseFormReturn<FormBuilderSchema>;
  questionIndex: number;
}

export function QuestionBuilderItem({ form, questionIndex }: QuestionBuilderItemProps) {
  const questionType = form.watch(`questions.${questionIndex}.type`);
  const questionErrors = form.formState.errors.questions?.[questionIndex];

  const handleTypeChange = (newType: FormQuestionType) => {
    form.setValue(`questions.${questionIndex}.type`, newType);

    // Reset settings based on question type
    if (newType === 'SHORT_ANSWER' || newType === 'LONG_ANSWER') {
      form.setValue(`questions.${questionIndex}.settings`, { placeholder: '' });
    } else if (newType === 'MULTIPLE_CHOICE' || newType === 'MULTIPLE_SELECT') {
      form.setValue(`questions.${questionIndex}.settings`, {
        options: [
          { id: crypto.randomUUID(), text: "", value: "option_1" },
          { id: crypto.randomUUID(), text: "", value: "option_2" },
        ],
        allowOther: false
      });
    } else if (newType === 'RATING') {
      form.setValue(`questions.${questionIndex}.settings`, { scale: 5, icon: 'star' });
    } else if (newType === 'FILE_UPLOAD') {
      form.setValue(`questions.${questionIndex}.settings`, { maxFiles: 1 });
    } else if (newType === 'DATE' || newType === 'TIME') {
      form.setValue(`questions.${questionIndex}.settings`, {});
    } else {
      // For NAME_SELECT, NIM_SELECT, COURSE_SELECT, EVENT_SELECT
      // These types expect null settings
      form.setValue(`questions.${questionIndex}.settings`, null);
    }
  };

  return (
    <Card className={cn("border-l-4", questionErrors ? "border-destructive" : "border-primary")}>
      <CardContent className="pt-6 space-y-6">
        {questionErrors?.settings && 'message' in questionErrors.settings && (
          <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{questionErrors.settings.message}</AlertDescription></Alert>
        )}

        {/* Question Type and Required Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name={`questions.${questionIndex}.type`} render={({ field }) => (
            <FormItem><FormLabel>Question Type</FormLabel>
              <Select onValueChange={(value) => handleTypeChange(value as FormQuestionType)} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {Object.values(QUESTION_TYPE_CONFIG).map(qType => (
                    <SelectItem key={qType.type} value={qType.type}>{qType.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select><FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name={`questions.${questionIndex}.required`} render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border px-3 shadow-sm mt-2">
              <div className="space-y-0.5"><FormLabel>Required</FormLabel></div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
        </div>

        {/* Question Title & Description */}
        <FormField control={form.control} name={`questions.${questionIndex}.title`} render={({ field }) => (
          <FormItem><FormLabel>Question Text</FormLabel><FormControl><Textarea placeholder="What would you like to ask?" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name={`questions.${questionIndex}.description`} render={({ field }) => (
          <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Input placeholder="Add extra context for this question" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
        )} />

        {/* --- CONDITIONAL SETTINGS RENDER --- */}
        {(questionType === 'MULTIPLE_CHOICE' || questionType === 'MULTIPLE_SELECT') && (
          <MultipleChoiceEditor form={form} questionIndex={questionIndex} />
        )}
        {(questionType === 'SHORT_ANSWER' || questionType === 'LONG_ANSWER') && (
          <FormField control={form.control} name={`questions.${questionIndex}.settings.placeholder`} render={({ field }) => (
            <FormItem><FormLabel>Placeholder Text (Optional)</FormLabel><FormControl><Input placeholder="e.g., Enter your full name" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
          )} />
        )}
        {questionType === 'FILE_UPLOAD' && (
          <FileUploadEditor form={form} questionIndex={questionIndex} />
        )}

      </CardContent>
    </Card>
  );
}

// Sub-component for editing Multiple Choice options
function MultipleChoiceEditor({ form, questionIndex }: QuestionBuilderItemProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `questions.${questionIndex}.settings.options`
  });

  const addOption = () => append({ id: crypto.randomUUID(), text: "", value: `option_${fields.length + 1}` });

  return (
    <div className="space-y-3 pt-4 border-t">
      <Label className="font-semibold">Answer Options</Label>
      {fields.map((field, optionIndex) => (
        <div key={field.id} className="flex items-center gap-2">
          <RadioGroup disabled><RadioGroupItem value={field.id} /></RadioGroup>
          <FormField control={form.control} name={`questions.${questionIndex}.settings.options.${optionIndex}.text`} render={({ field }) => (
            <FormItem className="flex-1"><FormControl><Input placeholder={`Option ${optionIndex + 1}`} {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(optionIndex)} disabled={fields.length <= 1}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" size="sm" onClick={addOption}>
          <Plus className="w-4 h-4 mr-2" /> Add Option
        </Button>

        <FormField
          control={form.control}
          name={`questions.${questionIndex}.settings.allowOther`}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2 space-y-0">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal">
                Add {'"Other"'} option
              </FormLabel>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

const FILE_TYPE_CATEGORIES = [
  { label: 'Images', types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] },
  { label: 'PDF', types: ['application/pdf'] },
  { label: 'Documents', types: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'] },
  { label: 'Spreadsheets', types: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'] },
  { label: 'Presentations', types: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'] },
  { label: 'Archives', types: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'] },
];

function FileUploadEditor({ form, questionIndex }: QuestionBuilderItemProps) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <Label className="font-semibold">File Upload Settings</Label>

      <FormField
        control={form.control}
        name={`questions.${questionIndex}.settings.maxFiles`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Maximum Number of Files</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                max={10}
                {...field}
                onChange={e => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`questions.${questionIndex}.settings.allowedFileTypes`}
        render={({ field }) => {
          const currentTypes = (field.value ?? []);

          const handleCategoryChange = (categoryTypes: string[], checked: boolean) => {
            let newTypes = [...currentTypes];
            if (checked) {
              // Add types that aren't already present
              categoryTypes.forEach(t => {
                if (!newTypes.includes(t)) newTypes.push(t);
              });
            } else {
              // Remove types
              newTypes = newTypes.filter(t => !categoryTypes.includes(t));
            }
            field.onChange(newTypes);
          };

          const isCategoryChecked = (categoryTypes: string[]) => {
            // Check if all types in the category are present
            return categoryTypes.every(t => currentTypes.includes(t));
          };

          return (
            <FormItem>
              <FormLabel>Allowed File Types</FormLabel>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {FILE_TYPE_CATEGORIES.map((category) => (
                  <div key={category.label} className="flex items-start space-x-2">
                    <Checkbox
                      id={`file-type-${questionIndex}-${category.label}`}
                      checked={isCategoryChecked(category.types)}
                      onCheckedChange={(checked) => handleCategoryChange(category.types, checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={`file-type-${questionIndex}-${category.label}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <FormDescription>
                Leave all unchecked to allow any file type.
              </FormDescription>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
}