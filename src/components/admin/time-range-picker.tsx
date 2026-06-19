// ~/components/admin/time-range-picker.tsx
"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay } from "date-fns";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { TimeRange } from "~/lib/types/analytics";

interface TimeRangePickerProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  className?: string;
}

const presetRanges = [
  {
    label: "Last 24 hours",
    value: "24h",
    getRange: () => ({
      from: subDays(new Date(), 1),
      to: new Date(),
    }),
  },
  {
    label: "Last 3 days",
    value: "3d",
    getRange: () => ({
      from: subDays(new Date(), 3),
      to: new Date(),
    }),
  },
  {
    label: "Last 7 days",
    value: "7d",
    getRange: () => ({
      from: subDays(new Date(), 7),
      to: new Date(),
    }),
  },
  {
    label: "Last 2 weeks",
    value: "2w",
    getRange: () => ({
      from: subWeeks(new Date(), 2),
      to: new Date(),
    }),
  },
  {
    label: "Last month",
    value: "1m",
    getRange: () => ({
      from: subMonths(new Date(), 1),
      to: new Date(),
    }),
  },
  {
    label: "Last 3 months",
    value: "3m",
    getRange: () => ({
      from: subMonths(new Date(), 3),
      to: new Date(),
    }),
  },
  {
    label: "Custom range",
    value: "custom",
    getRange: () => ({
      from: subDays(new Date(), 7),
      to: new Date(),
    }),
  },
];

export function TimeRangePicker({ value, onChange, className }: TimeRangePickerProps) {
  const [selectedPreset, setSelectedPreset] = useState("7d");
  const [isCustom, setIsCustom] = useState(false);

  const handlePresetChange = (presetValue: string) => {
    setSelectedPreset(presetValue);
    if (presetValue === "custom") {
      setIsCustom(true);
    } else {
      setIsCustom(false);
      const preset = presetRanges.find(p => p.value === presetValue);
      if (preset) {
        onChange(preset.getRange());
      }
    }
  };

  const handleCustomDateChange = (field: "from" | "to", date: Date | undefined) => {
    if (!date) return;

    const newRange = {
      ...value,
      [field]: field === "from" ? startOfDay(date) : endOfDay(date),
    };
    onChange(newRange);
  };

  return (
    <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Select time range" />
        </SelectTrigger>
        <SelectContent>
          {presetRanges.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isCustom && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-[140px] justify-start text-left font-normal",
                  !value.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value.from ? format(value.from, "MMM dd") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value.from}
                onSelect={(date) => handleCustomDateChange("from", date)}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-[140px] justify-start text-left font-normal",
                  !value.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value.to ? format(value.to, "MMM dd") : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value.to}
                onSelect={(date) => handleCustomDateChange("to", date)}
                disabled={(date) => date > new Date() || date < value.from}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}