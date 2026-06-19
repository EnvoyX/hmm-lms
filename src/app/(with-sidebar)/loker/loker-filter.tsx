// ~/components/job-vacancy/job-vacancy-filters.tsx
"use client";

import { useState, useCallback, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { useIsMobile } from "~/hooks/use-mobile";
import { Search, X, SlidersHorizontal, Filter } from "lucide-react";

export const AVAILABLE_STREAMS = [
  "Design & Manufacturing",
  "Automotive Engineering",
  "Aerospace Engineering",
  "Energy & Power Systems",
  "HVAC & Refrigeration",
  "Materials Engineering",
  "Robotics & Automation",
  "Maintenance Engineering",
  "Quality Control & Assurance",
  "Project Management",
  "Research & Development",
  "Production Engineering",
  "Thermal Engineering",
  "Fluid Mechanics",
  "Machine Design",
  "Industrial Engineering",
  "Oil & Gas Engineering",
  "Marine Engineering",
  "Biomedical Engineering",
  "Environmental Engineering",
];

export const LOKER_SENIORITY = ["Intern", "Junior", "Mid", "Senior"] as const;
export const LOKER_EMPLOYMENT = [
  "Internship",
  "Full-time",
  "Part-time",
  "Contract",
] as const;
/** `position` contains this substring (case-insensitive) */
export const LOKER_LOCATIONS = [
  { value: "__all__", label: "All locations" },
  { value: "Bandung", label: "Bandung" },
  { value: "Jakarta", label: "Jakarta" },
] as const;

type FilterState = {
  search: string;
  streams: string[];
  location: string;
  seniority: string;
  employmentType: string;
};

function readStateFromParams(searchParams: URLSearchParams): FilterState {
  return {
    search: searchParams.get("search") ?? "",
    streams: Array.from(new Set(searchParams.getAll("streams"))),
    location: searchParams.get("location") ?? "",
    seniority: searchParams.get("seniority") ?? "",
    employmentType: searchParams.get("employmentType") ?? "",
  };
}

function buildQueryString(s: FilterState): string {
  const params = new URLSearchParams();
  const t = s.search.trim();
  if (t) params.set("search", t);
  s.streams.forEach((st) => params.append("streams", st));
  if (s.location) params.set("location", s.location);
  if (s.seniority) params.set("seniority", s.seniority);
  if (s.employmentType) params.set("employmentType", s.employmentType);
  return params.toString();
}

function countActive(s: FilterState): number {
  let n = 0;
  if (s.search.trim()) n += 1;
  n += s.streams.length;
  if (s.location) n += 1;
  if (s.seniority) n += 1;
  if (s.employmentType) n += 1;
  return n;
}

function FilterFormFields({
  state,
  setState,
  onApplySearch,
  onClearSearch,
  applyToUrl,
  onClearAll,
  canClearAll,
}: {
  state: FilterState;
  setState: React.Dispatch<React.SetStateAction<FilterState>>;
  onApplySearch: (e: FormEvent<HTMLFormElement>) => void;
  onClearSearch: () => void;
  applyToUrl: (next: FilterState) => void;
  onClearAll: () => void;
  canClearAll: boolean;
}) {
  const selectLocValue = state.location || "__all__";
  const selectSenValue = state.seniority || "__all__";
  const selectEmpValue = state.employmentType || "__all__";
  const streamCount = state.streams.length;
  const hasStreamFilters = streamCount > 0;

  return (
    <div className="flex flex-col gap-2.5">
      <form
        onSubmit={onApplySearch}
        className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-2"
      >
        <div className="min-w-0 flex-1 space-y-1">
          <Label
            htmlFor="job-search"
            className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase"
          >
            Search
          </Label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              id="job-search"
              value={state.search}
              onChange={(e) =>
                setState((p) => ({ ...p, search: e.target.value }))
              }
              placeholder="Job title, company..."
              className="h-9 pl-8 text-sm"
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:pb-0.5">
          <Button
            type="submit"
            size="sm"
            className="h-9 flex-1 sm:flex-initial"
          >
            Search
          </Button>
          {state.search ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 px-2"
              onClick={onClearSearch}
              aria-label="Clear keyword"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
          {canClearAll ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-9 text-xs"
              onClick={onClearAll}
            >
              Reset all
            </Button>
          ) : null}
        </div>
      </form>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="min-w-0">
          <Label className="sr-only">Location</Label>
          <Select
            value={selectLocValue}
            onValueChange={(v) => {
              const loc = v === "__all__" ? "" : v;
              setState((p) => {
                const next = { ...p, location: loc };
                applyToUrl(next);
                return next;
              });
            }}
          >
            <SelectTrigger
              className="h-9 w-full text-xs"
              aria-label="Filter by work location"
            >
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              {LOKER_LOCATIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-0">
          <Label className="sr-only">Seniority</Label>
          <Select
            value={selectSenValue}
            onValueChange={(v) => {
              const val = v === "__all__" ? "" : v;
              setState((p) => {
                const next = { ...p, seniority: val };
                applyToUrl(next);
                return next;
              });
            }}
          >
            <SelectTrigger
              className="h-9 w-full text-xs"
              aria-label="Filter by seniority"
            >
              <SelectValue placeholder="Any level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Any level</SelectItem>
              {LOKER_SENIORITY.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 min-w-0 sm:col-span-1">
          <Label className="sr-only">Employment type</Label>
          <Select
            value={selectEmpValue}
            onValueChange={(v) => {
              const val = v === "__all__" ? "" : v;
              setState((p) => {
                const next = { ...p, employmentType: val };
                applyToUrl(next);
                return next;
              });
            }}
          >
            <SelectTrigger
              className="h-9 w-full text-xs"
              aria-label="Filter by employment type"
            >
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Any type</SelectItem>
              {LOKER_EMPLOYMENT.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:shrink-0">
          <span className="text-foreground text-xs font-medium whitespace-nowrap">
            Streams
          </span>
          {hasStreamFilters ? (
            <Badge
              variant="secondary"
              className="h-5 px-1.5 text-[10px] font-normal"
            >
              {streamCount}
            </Badge>
          ) : null}
          {hasStreamFilters ? (
            <button
              type="button"
              onClick={() => {
                setState((p) => {
                  const next = { ...p, streams: [] };
                  applyToUrl(next);
                  return next;
                });
              }}
              className="text-primary text-[11px] font-medium underline-offset-2 hover:underline"
            >
              Clear
            </button>
          ) : null}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 w-full min-w-0 justify-between sm:flex-1"
              title="Select engineering streams or tracks"
            >
              <span className="truncate text-left text-xs">
                {hasStreamFilters
                  ? `${streamCount} stream(s)`
                  : "Streams (optional)…"}
              </span>
              <SlidersHorizontal className="ml-1.5 h-3.5 w-3.5 shrink-0 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[min(100vw-2rem,22rem)] p-0"
            align="start"
          >
            <div className="loker-streams-scroll max-h-64 space-y-2 overflow-y-auto p-3 pr-2">
              {AVAILABLE_STREAMS.map((stream, idx) => (
                <div key={stream} className="flex items-center space-x-2">
                  <Checkbox
                    id={`loker-stream-${idx}`}
                    checked={state.streams.includes(stream)}
                    onCheckedChange={(checked) => {
                      setState((p) => {
                        const nextStreams = checked
                          ? p.streams.includes(stream)
                            ? p.streams
                            : [...p.streams, stream]
                          : p.streams.filter((s) => s !== stream);
                        const next = { ...p, streams: nextStreams };
                        applyToUrl(next);
                        return next;
                      });
                    }}
                  />
                  <Label
                    htmlFor={`loker-stream-${idx}`}
                    className="cursor-pointer text-sm leading-snug font-normal"
                  >
                    {stream}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export function JobVacancyFilters() {
  const searchParams = useSearchParams();
  const [openSheet, setOpenSheet] = useState(false);
  return (
    <JobVacancyFiltersBody
      key={searchParams.toString()}
      sheetOpen={openSheet}
      onSheetOpenChange={setOpenSheet}
    />
  );
}

function JobVacancyFiltersBody({
  sheetOpen,
  onSheetOpenChange,
}: {
  sheetOpen: boolean;
  onSheetOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [state, setState] = useState<FilterState>(() =>
    readStateFromParams(searchParams),
  );

  const applyToUrl = useCallback(
    (next: FilterState) => {
      const q = buildQueryString(next);
      router.replace(q ? `/loker?${q}` : "/loker", { scroll: false });
    },
    [router],
  );

  const clearAll = () => {
    const empty: FilterState = {
      search: "",
      streams: [],
      location: "",
      seniority: "",
      employmentType: "",
    };
    setState(empty);
    router.replace("/loker", { scroll: false });
  };

  const onApplySearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    applyToUrl({ ...state, search: state.search });
  };

  const onClearSearch = () => {
    setState((p) => {
      const next = { ...p, search: "" };
      applyToUrl(next);
      return next;
    });
  };

  const activeCount = countActive(state);
  const hasAnyFilter = activeCount > 0;

  const barInner = (
    <FilterFormFields
      state={state}
      setState={setState}
      onApplySearch={onApplySearch}
      onClearSearch={onClearSearch}
      applyToUrl={applyToUrl}
      onClearAll={clearAll}
      canClearAll={hasAnyFilter}
    />
  );

  return (
    <div className="border-border/80 bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 -mx-4 border-b px-3 py-2 backdrop-blur md:mx-0 md:rounded-lg md:border md:px-3 md:py-2.5 md:shadow-sm">
      {isMobile ? (
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground min-w-0 text-sm">
            {hasAnyFilter ? (
              <span>
                {activeCount} filter{activeCount === 1 ? "" : "s"} active
              </span>
            ) : (
              <span>Find a role</span>
            )}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            {hasAnyFilter ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={clearAll}
              >
                Clear all
              </Button>
            ) : null}
            <Sheet open={sheetOpen} onOpenChange={onSheetOpenChange}>
              <SheetTrigger asChild>
                <Button type="button" size="sm" variant="default">
                  <Filter className="mr-1.5 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Search &amp; filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">{barInner}</div>
                <div className="mt-4">
                  <Button
                    type="button"
                    className="w-full"
                    onClick={() => onSheetOpenChange(false)}
                  >
                    Show results
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      ) : (
        <div>{barInner}</div>
      )}
    </div>
  );
}
