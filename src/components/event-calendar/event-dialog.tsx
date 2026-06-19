"use client"

import { useEffect, useMemo, useState } from "react"
import { RiCalendarLine, RiDeleteBinLine, RiMapPinLine, RiStickyNoteLine, RiShieldCheckLine } from "@remixicon/react"
import { format, isBefore } from "date-fns"

import {
  DefaultEndHour,
  DefaultStartHour,
  EndHour,
  StartHour,
} from "~/components/event-calendar/constants"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import type { CalendarEvent, EventColor } from './types'

interface EventDialogProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  onDelete: (eventId: string) => void
  canManageEvents: boolean
}

export function EventDialog({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  canManageEvents,
}: EventDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState(`${DefaultStartHour}:00`)
  const [endTime, setEndTime] = useState(`${DefaultEndHour}:00`)
  const [allDay, setAllDay] = useState(false)
  const [location, setLocation] = useState("")
  const [color, setColor] = useState<EventColor>("SKY")
  const [error, setError] = useState<string | null>(null)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)

  useEffect(() => {
    if (event) {
      setTitle(event.title || "")
      setDescription(event.description ?? "")

      const start = new Date(event.start)
      const end = new Date(event.end)

      setStartDate(start)
      setEndDate(end)
      setStartTime(formatTimeForInput(start))
      setEndTime(formatTimeForInput(end))
      setAllDay(event.allDay ?? false)
      setLocation(event.location ?? "")
      setColor(event.color ?? "SKY")
      setError(null) // Reset error when opening dialog
    } else {
      resetForm()
    }
  }, [event])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setStartDate(new Date())
    setEndDate(new Date())
    setStartTime(`${DefaultStartHour}:00`)
    setEndTime(`${DefaultEndHour}:00`)
    setAllDay(false)
    setLocation("")
    setColor("SKY")
    setError(null)
  }

  const formatTimeForInput = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = Math.floor(date.getMinutes() / 15) * 15
    return `${hours}:${minutes.toString().padStart(2, "0")}`
  }

  // Memoize time options so they're only calculated once
  const timeOptions = useMemo(() => {
    const options = []
    for (let hour = StartHour; hour <= EndHour; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, "0")
        const formattedMinute = minute.toString().padStart(2, "0")
        const value = `${formattedHour}:${formattedMinute}`
        // Use a fixed date to avoid unnecessary date object creations
        const date = new Date(2000, 0, 1, hour, minute)
        const label = format(date, "h:mm a")
        options.push({ value, label })
      }
    }
    return options
  }, []) // Empty dependency array ensures this only runs once

  const handleSave = () => {
    if (!canManageEvents) return

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (!allDay) {
      const [startHours = 0, startMinutes = 0] = startTime
        .split(":")
        .map(Number)
      const [endHours = 0, endMinutes = 0] = endTime.split(":").map(Number)

      if (
        startHours < StartHour ||
        startHours > EndHour ||
        endHours < StartHour ||
        endHours > EndHour
      ) {
        setError(
          `Selected time must be between ${StartHour}:00 and ${EndHour}:00`
        )
        return
      }

      start.setHours(startHours, startMinutes, 0)
      end.setHours(endHours, endMinutes, 0)
    } else {
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
    }

    // Validate that end date is not before start date
    if (isBefore(end, start)) {
      setError("End date cannot be before start date")
      return
    }

    // Use generic title if empty
    const eventTitle = title.trim() ? title : "(no title)"

    onSave({
      id: event?.id ?? "",
      title: eventTitle,
      description,
      start,
      end,
      allDay,
      location,
      color,
    })
  }

  const handleDelete = () => {
    if (!canManageEvents) return
    if (event?.id) {
      onDelete(event.id)
    }
  }

  // Updated color options to match types.ts
  const colorOptions: Array<{
    value: EventColor
    label: string
    bgClass: string
    borderClass: string
  }> = [
      {
        value: "SKY",
        label: "Sky",
        bgClass: "bg-sky-400 data-[state=checked]:bg-sky-400",
        borderClass: "border-sky-400 data-[state=checked]:border-sky-400",
      },
      {
        value: "AMBER",
        label: "Amber",
        bgClass: "bg-amber-400 data-[state=checked]:bg-amber-400",
        borderClass: "border-amber-400 data-[state=checked]:border-amber-400",
      },
      {
        value: "VIOLET",
        label: "Violet",
        bgClass: "bg-violet-400 data-[state=checked]:bg-violet-400",
        borderClass: "border-violet-400 data-[state=checked]:border-violet-400",
      },
      {
        value: "ROSE",
        label: "Rose",
        bgClass: "bg-rose-400 data-[state=checked]:bg-rose-400",
        borderClass: "border-rose-400 data-[state=checked]:border-rose-400",
      },
      {
        value: "EMERALD",
        label: "Emerald",
        bgClass: "bg-emerald-400 data-[state=checked]:bg-emerald-400",
        borderClass: "border-emerald-400 data-[state=checked]:border-emerald-400",
      },
      {
        value: "ORANGE",
        label: "Orange",
        bgClass: "bg-orange-400 data-[state=checked]:bg-orange-400",
        borderClass: "border-orange-400 data-[state=checked]:border-orange-400",
      },
    ]

  const isExistingEvent = Boolean(event?.id)
  const isReadOnly = isExistingEvent && !canManageEvents

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {isReadOnly ? "Event details" : isExistingEvent ? "Edit event" : "Create event"}
          </DialogTitle>
          <DialogDescription>
            {isReadOnly
              ? "You can view this event, but only admins can change schedule entries."
              : "Update event details and save your changes."}
          </DialogDescription>
        </DialogHeader>
        {!canManageEvents && (
          <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <RiShieldCheckLine size={14} />
            Read-only mode for your role.
          </div>
        )}
        {error && (
          <div className="bg-destructive/15 text-destructive rounded-md px-3 py-2 text-sm">
            {error}
          </div>
        )}
        {isReadOnly ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-lg font-semibold">{title || "(no title)"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {allDay
                  ? `${format(startDate, "PPP")} - ${format(endDate, "PPP")} (All day)`
                  : `${format(startDate, "PPP")} ${startTime} - ${format(endDate, "PPP")} ${endTime}`}
              </p>
            </div>

            {location && (
              <div className="flex items-center gap-2 text-sm">
                <RiMapPinLine size={16} className="text-muted-foreground" />
                <span>{location}</span>
              </div>
            )}

            {description && (
              <div className="rounded-lg border bg-background p-3 text-sm">
                <div className="mb-1 flex items-center gap-2 font-medium">
                  <RiStickyNoteLine size={16} className="text-muted-foreground" />
                  Notes
                </div>
                <p className="whitespace-pre-wrap text-muted-foreground">{description}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 py-2">
            <div className="*:not-first:mt-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Exam prep session"
              />
            </div>

            <div className="*:not-first:mt-1.5">
              <Label htmlFor="description">Notes</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Optional details"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="*:not-first:mt-1.5">
                <Label htmlFor="start-date">Start Date</Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="start-date"
                      variant={"outline"}
                      className={cn(
                        "group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
                      )}
                    >
                      <span className="truncate">{format(startDate, "PPP")}</span>
                      <RiCalendarLine size={16} className="text-muted-foreground/80 shrink-0" aria-hidden="true" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      defaultMonth={startDate}
                      onSelect={(date) => {
                        if (!date) return
                        setStartDate(date)
                        if (isBefore(endDate, date)) setEndDate(date)
                        setError(null)
                        setStartDateOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="*:not-first:mt-1.5">
                <Label htmlFor="end-date">End Date</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="end-date"
                      variant={"outline"}
                      className="group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
                    >
                      <span className="truncate">{format(endDate, "PPP")}</span>
                      <RiCalendarLine size={16} className="text-muted-foreground/80 shrink-0" aria-hidden="true" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      defaultMonth={endDate}
                      disabled={{ before: startDate }}
                      onSelect={(date) => {
                        if (!date) return
                        setEndDate(date)
                        setError(null)
                        setEndDateOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {!allDay && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="*:not-first:mt-1.5">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger id="start-time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="*:not-first:mt-1.5">
                  <Label htmlFor="end-time">End Time</Label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger id="end-time">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2">
              <Checkbox
                id="all-day"
                checked={allDay}
                onCheckedChange={(checked) => setAllDay(checked === true)}
              />
              <Label htmlFor="all-day">All day</Label>
            </div>

            <div className="*:not-first:mt-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Optional location"
              />
            </div>

            <fieldset className="space-y-3 rounded-md border bg-muted/20 p-3">
              <legend className="text-foreground text-sm leading-none font-medium">
                Color
              </legend>
              <RadioGroup
                className="flex gap-1.5"
                defaultValue={colorOptions[0]?.value}
                value={color}
                onValueChange={(value: EventColor) => setColor(value)}
              >
                {colorOptions.map((colorOption) => (
                  <RadioGroupItem
                    key={colorOption.value}
                    id={`color-${colorOption.value}`}
                    value={colorOption.value}
                    aria-label={colorOption.label}
                    className={cn(
                      "size-6 shadow-none",
                      colorOption.bgClass,
                      colorOption.borderClass
                    )}
                  />
                ))}
              </RadioGroup>
            </fieldset>
          </div>
        )}

        <DialogFooter className="flex-row sm:justify-between">
          {canManageEvents && isExistingEvent ? (
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              aria-label="Delete event"
            >
              <RiDeleteBinLine size={16} aria-hidden="true" />
            </Button>
          ) : (
            <div />
          )}
          <div className="flex flex-1 justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {canManageEvents && (
              <Button onClick={handleSave}>
                {isExistingEvent ? "Save changes" : "Create event"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
