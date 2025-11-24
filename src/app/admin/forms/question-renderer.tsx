// ~/admin/forms/question-builder.tsx

import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { format } from 'date-fns';
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Clock,
  Heart,
  Star,
  ThumbsUp,
  Upload,
  X,
} from 'lucide-react';

import type {
  FormQuestionType,
  MultipleChoiceSettings,
  MultipleSelectSettings,
  FileUploadSettings,
  RatingSettings,
  TextSettings,
  DateTimeSettings,
} from '~/lib/types/forms';
import { api } from '~/trpc/react';
import { cn } from '~/lib/utils';

import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '~/components/ui/command';
import {
  FormField,
  FormItem,
  FormControl,
  FormDescription,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import { Textarea } from '~/components/ui/textarea';
import type { JsonValue } from '@prisma/client/runtime/library';

// Define a more specific type for a form question
interface FormQuestion {
  id: string;
  title: string;
  description?: string | null;
  type: FormQuestionType;
  required: boolean;
  settings?:
  JsonValue
}

// Define the shape of the form data for better type safety
type FormValues = {
  answers: Record<string, unknown>;
};

interface QuestionComponentProps {
  question: FormQuestion;
  form: UseFormReturn<FormValues>;
  fieldName: `answers.${string}`;
}

export const QuestionRenderer: React.FC<{ question: FormQuestion, form: UseFormReturn<FormValues> }> = ({ question, form }) => {
  const fieldName = `answers.${question.id}` as const;

  const renderQuestionContent = () => {
    const props = { question, form, fieldName };
    switch (question.type) {
      case 'SHORT_ANSWER':
        return <ShortAnswerQuestion {...props} />;
      case 'LONG_ANSWER':
        return <LongAnswerQuestion {...props} />;
      case 'MULTIPLE_CHOICE':
        return <MultipleChoiceQuestion {...props} />;
      case 'MULTIPLE_SELECT':
        return <MultipleSelectQuestion {...props} />;
      case 'FILE_UPLOAD':
        return <FileUploadQuestion {...props} />;
      case 'NAME_SELECT':
        return <NameSelectQuestion {...props} />;
      case 'NIM_SELECT':
        return <NimSelectQuestion {...props} />;
      case 'RATING':
        return <RatingQuestion {...props} />;
      case 'DATE':
        return <DateQuestion {...props} />;
      case 'TIME':
        return <TimeQuestion {...props} />;
      case 'COURSE_SELECT':
        return <CourseSelectQuestion {...props} />;
      case 'EVENT_SELECT':
        return <EventSelectQuestion {...props} />;
      default:
        return <div>Unknown question type</div>;
    }
  };

  return (
    <Card className="max-sm:shadow-none max-sm:border-0 max-sm:gap-2">
      <CardHeader className="">
        <CardTitle className="md:text-lg">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-0">
        <FormField
          control={form.control}
          name={fieldName}
          render={() => (
            <FormItem>
              {question.description && (
                <FormDescription className="mb-4">{question.description}</FormDescription>
              )}
              <FormControl>{renderQuestionContent()}</FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

// --- Individual Question Components ---

const ShortAnswerQuestion: React.FC<QuestionComponentProps> = ({ question, form, fieldName }) => {
  const settings = question.settings as TextSettings;
  return (
    <Input
      placeholder={settings?.placeholder ?? 'Your answer...'}
      {...form.register(fieldName)}
      className="w-full"
    />
  );
};

const LongAnswerQuestion: React.FC<QuestionComponentProps> = ({ question, form, fieldName }) => {
  const settings = question.settings as TextSettings;
  return (
    <Textarea
      placeholder={settings?.placeholder ?? 'Your answer...'}
      rows={4}
      {...form.register(fieldName)}
      className="w-full resize-y"
    />
  );
};

const MultipleChoiceQuestion: React.FC<QuestionComponentProps> = ({ question, form, fieldName }) => {
  const settings = question.settings as MultipleChoiceSettings;
  const isOtherSelected = settings.options?.find(opt => opt.value === form.watch(fieldName)) === undefined;

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <RadioGroup onValueChange={field.onChange} value={isOtherSelected ? '__other__' : field.value as string} className="space-y-3">
          {settings?.options?.map((option) => (
            <Label
              key={option.id}
              htmlFor={`${fieldName}-${option.id}`}
              className="p-4 flex items-center border rounded-md cursor-pointer hover:bg-accent has-[[data-state=checked]]:bg-accent has-[[data-state=checked]]:border-primary"
            >
              <RadioGroupItem value={option.value} id={`${fieldName}-${option.id}`} />
              <span className="ml-3 flex-1">{option.text}</span>
            </Label>
          ))}
          {settings?.allowOther && (
            <Label
              htmlFor={`${fieldName}-other`}
              className="p-4 flex flex-wrap items-center border rounded-md cursor-pointer hover:bg-accent has-[[data-state=checked]]:bg-accent has-[[data-state=checked]]:border-primary"
            >
              <RadioGroupItem value="__other__" id={`${fieldName}-other`} />
              <span className="ml-3">Other:</span>
              {(field.value === '__other__' || isOtherSelected) && (
                <Input
                  placeholder="Please specify..."
                  value={isOtherSelected ? field.value as string : ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="ml-2 mt-2 sm:mt-0 sm:ml-2 flex-1 min-w-[200px]"
                  onClick={(e) => e.preventDefault()} // Prevents label from re-triggering radio click
                />
              )}
            </Label>
          )}
        </RadioGroup>
      )}
    />
  );
};

const MultipleSelectQuestion: React.FC<QuestionComponentProps> = ({ question, form, fieldName }) => {
  const settings = question.settings as MultipleSelectSettings;

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => {
        const selectedValues = Array.isArray(field.value) ? (field.value as string[]) : [];
        const predefinedOptions = settings?.options?.map(o => o.value) ?? [];
        const otherValue = selectedValues.find(v => !predefinedOptions.includes(v));
        const isOtherChecked = otherValue !== undefined;

        const handleOptionChange = (optionValue: string, checked: boolean) => {
          let newValues = [...selectedValues];
          if (checked) {
            newValues.push(optionValue);
          } else {
            newValues = newValues.filter((v) => v !== optionValue);
          }
          field.onChange(newValues);
        };

        const handleOtherCheckedChange = (checked: boolean) => {
          let newValues = [...selectedValues];
          // First, remove any existing other value
          if (otherValue) {
            newValues = newValues.filter(v => v !== otherValue);
          }
          // If checking, add a placeholder to be filled by the input
          if (checked) {
            newValues.push(''); // Add an empty string as a placeholder
          }
          field.onChange(newValues);
        };

        const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const newOtherValue = e.target.value;
          let newValues = [...selectedValues];
          // Remove the old other value
          if (otherValue !== undefined) {
            newValues = newValues.filter(v => v !== otherValue);
          }
          // Add the new one
          newValues.push(newOtherValue);
          field.onChange(newValues);
        };

        return (
          <div className="space-y-3">
            {settings?.options?.map((option) => (
              <Label
                key={option.id}
                htmlFor={`${fieldName}-${option.id}`}
                className="p-4 flex items-center border rounded-md cursor-pointer hover:bg-accent has-[[data-state=checked]]:bg-accent has-[[data-state=checked]]:border-primary"
              >
                <Checkbox
                  id={`${fieldName}-${option.id}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked) => handleOptionChange(option.value, !!checked)}
                />
                <span className="ml-3 flex-1">{option.text}</span>
              </Label>
            ))}
            {settings?.allowOther && (
              <Label
                htmlFor={`${fieldName}-other`}
                className="p-4 flex flex-wrap items-center border rounded-md cursor-pointer hover:bg-accent has-[[data-state=checked]]:bg-accent has-[[data-state=checked]]:border-primary"
              >
                <Checkbox
                  id={`${fieldName}-other`}
                  checked={isOtherChecked}
                  onCheckedChange={handleOtherCheckedChange}
                />
                <span className="ml-3">Other:</span>
                {isOtherChecked && (
                  <Input
                    placeholder="Please specify..."
                    value={otherValue ?? ''}
                    onChange={handleOtherInputChange}
                    className="ml-2 mt-2 sm:mt-0 sm:ml-2 flex-1 min-w-[200px]"
                  />
                )}
              </Label>
            )}
          </div>
        );
      }}
    />
  );
};


const FileUploadQuestion: React.FC<QuestionComponentProps> = ({ question, form, fieldName }) => {
  const settings = question.settings as FileUploadSettings;
  const [files, setFiles] = React.useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const maxFiles = settings?.maxFiles ?? 5;
    const validFiles = selectedFiles.slice(0, maxFiles);
    setFiles(validFiles);
    form.setValue(fieldName, validFiles);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label htmlFor={`${fieldName}-file`} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-4 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            {settings?.allowedFileTypes && (
              <p className="text-xs text-gray-500">
                {settings.allowedFileTypes.join(', ')}
              </p>
            )}
          </div>
          <input
            id={`${fieldName}-file`}
            type="file"
            className="hidden"
            multiple={settings?.maxFiles !== 1}
            accept={settings?.allowedFileTypes?.join(',')}
            onChange={handleFileChange}
          />
        </label>
      </div>
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
              <span className="text-sm truncate">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newFiles = files.filter((_, i) => i !== index);
                  setFiles(newFiles);
                  form.setValue(fieldName, newFiles);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const NameSelectQuestion: React.FC<QuestionComponentProps> = ({ form, fieldName }) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const { data: users = [] } = api.form.getUserNames.useQuery({ search });

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {(field.value as string) ?? "Select a person..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput
                placeholder="Search people..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandEmpty>No person found.</CommandEmpty>
              <CommandGroup>
                {users.map(user => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => {
                      field.onChange(user.name);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        field.value === user.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    />
  );
};

const NimSelectQuestion: React.FC<QuestionComponentProps> = ({ form, fieldName }) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const { data: users = [] } = api.form.getUserNims.useQuery({ search });

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {(field.value as string) ?? "Select a NIM..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput
                placeholder="Search NIM or name..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandEmpty>No student found.</CommandEmpty>
              <CommandGroup>
                {users.map(user => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => {
                      field.onChange(user.nim);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        field.value === user.nim ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div>
                      <div className="font-medium">{user.nim}</div>
                      <div className="text-sm text-gray-500">{user.name}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    />
  );
};

const RatingQuestion: React.FC<QuestionComponentProps> = ({ question, form, fieldName }) => {
  const settings = question.settings as RatingSettings;
  const scale = settings?.scale ?? 5;
  const icon = settings?.icon ?? 'star';

  const renderIcon = (filled: boolean) => {
    const className = cn(
      "w-8 h-8 cursor-pointer transition-colors",
      filled ? "text-yellow-400" : "text-gray-300"
    );

    switch (icon) {
      case 'heart':
        return <Heart className={className} fill={filled ? "currentColor" : "none"} />;
      case 'thumbs':
        return <ThumbsUp className={className} fill={filled ? "currentColor" : "none"} />;
      case 'numbers':
        return null;
      default:
        return <Star className={className} fill={filled ? "currentColor" : "none"} />;
    }
  };

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            {settings?.lowLabel && <span>{settings.lowLabel}</span>}
            {settings?.highLabel && <span>{settings.highLabel}</span>}
          </div>
          <div className="flex items-center space-x-2">
            {icon === 'numbers' ? (
              Array.from({ length: scale }, (_, i) => (
                <Button
                  key={i + 1}
                  type="button"
                  variant={field.value === i + 1 ? "default" : "outline"}
                  className="w-12 h-12 rounded-full"
                  onClick={() => field.onChange(i + 1)}
                >
                  {i + 1}
                </Button>
              ))
            ) : (
              Array.from({ length: scale }, (_, i) => (
                <div
                  key={i + 1}
                  onClick={() => field.onChange(i + 1)}
                >
                  {renderIcon(field.value as number >= i + 1)}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    />
  );
};

const DateQuestion: React.FC<QuestionComponentProps> = ({ question, form, fieldName }) => {
  const settings = question.settings as DateTimeSettings;

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !field.value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {field.value ? format(field.value as Date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={field.value as Date}
              onSelect={field.onChange}
              disabled={(date) => {
                if (settings?.minDate && date < new Date(settings.minDate)) return true;
                if (settings?.maxDate && date > new Date(settings.maxDate)) return true;
                return false;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}
    />
  );
};

const TimeQuestion: React.FC<QuestionComponentProps> = ({ form, fieldName }) => {
  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <Input
            type="time"
            {...field}
            className="w-auto"
            value={field.value as string ?? ''}
          />
        </div>
      )}
    />
  );
};

const CourseSelectQuestion: React.FC<QuestionComponentProps> = ({ form, fieldName }) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const { data: courses = [] } = api.form.getCourses.useQuery({ search });

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {(field.value as string) ?? "Select a course..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput
                placeholder="Search courses..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandEmpty>No course found.</CommandEmpty>
              <CommandGroup>
                {courses.map(course => (
                  <CommandItem
                    key={course.id}
                    onSelect={() => {
                      field.onChange(course.title);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        field.value === course.title ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div>
                      <div className="font-medium">{course.title}</div>
                      <div className="text-sm text-gray-500">{course.classCode}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    />
  );
};

const EventSelectQuestion: React.FC<QuestionComponentProps> = ({ form, fieldName }) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const { data: events = [] } = api.form.getEvents.useQuery({ search });

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {(field.value as string) ?? "Select an event..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput
                placeholder="Search events..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandEmpty>No event found.</CommandEmpty>
              <CommandGroup>
                {events.map(event => (
                  <CommandItem
                    key={event.id}
                    onSelect={() => {
                      field.onChange(event.title);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        field.value === event.title ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(event.start), "PPP")} • {event.location}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    />
  );
};