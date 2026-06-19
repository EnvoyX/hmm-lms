"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import {
  Calendar,
  Plus,
  Globe,
  GraduationCap,
  User
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Switch } from "~/components/ui/switch"
import { Card, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"
import { api } from "~/trpc/react"
import { toast } from "sonner"
import { format } from "date-fns"
import type { EventScope, EventColor } from '~/components/event-calendar/types'
import { SCOPE_COLORS } from '~/components/event-calendar/types'

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEventCreated?: () => void
  defaultScope?: EventScope
  isAdmin?: boolean
  presetDate?: Date
}

export function CreateEventDialog({
  open,
  onOpenChange,
  onEventCreated,
  defaultScope = 'personal',
  isAdmin = false,
  presetDate
}: CreateEventDialogProps) {
  const { data: session } = useSession()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: presetDate ? format(presetDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    startTime: presetDate ? format(presetDate, "HH:mm") : "09:00",
    endDate: presetDate ? format(presetDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    endTime: presetDate ? format(presetDate, "HH:mm") : "10:00",
    allDay: false,
    location: "",
    scope: defaultScope,
    courseId: "",
    color: SCOPE_COLORS[defaultScope]
  })

  // Get user's courses for course scope selection
  const { data: coursesData } = api.course.getMyCourses.useQuery(undefined, {
    enabled: !!session && (formData.scope === 'course' || isAdmin)
  })

  const createEventMutation = api.event.createEvent.useMutation({
    onSuccess: () => {
      toast.success("Event created successfully")
      onEventCreated?.()
      resetForm()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to create event")
    }
  })

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      startTime: "09:00",
      endDate: format(new Date(), "yyyy-MM-dd"),
      endTime: "10:00",
      allDay: false,
      location: "",
      scope: defaultScope,
      courseId: "",
      color: SCOPE_COLORS[defaultScope]
    })
  }

  const handleScopeChange = (newScope: EventScope) => {
    setFormData(prev => ({
      ...prev,
      scope: newScope,
      courseId: newScope === 'course' ? "" : prev.courseId,
      color: SCOPE_COLORS[newScope]
    }))
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter an event title")
      return
    }

    if (formData.scope === 'course' && !formData.courseId) {
      toast.error("Please select a course")
      return
    }

    const startDateTime = formData.allDay
      ? new Date(`${formData.startDate}T00:00:00`)
      : new Date(`${formData.startDate}T${formData.startTime}:00`)

    const endDateTime = formData.allDay
      ? new Date(`${formData.endDate}T23:59:59`)
      : new Date(`${formData.endDate}T${formData.endTime}:00`)

    if (endDateTime <= startDateTime) {
      toast.error("End time must be after start time")
      return
    }

    try {
      await createEventMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        start: startDateTime,
        end: endDateTime,
        allDay: formData.allDay,
        location: formData.location || undefined,
        scope: formData.scope,
        courseId: formData.scope === 'course' ? formData.courseId : undefined,
        eventMode: 'BASIC',
        hasTimeline: false,
        timeline: undefined,
        rsvpDeadline: null,
        rsvpRequiresApproval: false,
        presenceRequiresApproval: false,
      })
    } catch {
      // Error handling is done in mutation
    }
  }

  const scopeOptions = [
    {
      value: 'personal' as const,
      label: 'Personal',
      icon: User,
      description: 'Only visible to you',
      color: 'emerald'
    },
    ...(isAdmin ? [{
      value: 'course' as const,
      label: 'Course',
      icon: GraduationCap,
      description: 'Visible to course members',
      color: 'violet'
    }, {
      value: 'global' as const,
      label: 'Global',
      icon: Globe,
      description: 'Visible to all users',
      color: 'sky'
    }] : [])
  ]

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm()
      onOpenChange(newOpen)
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create New Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                placeholder="Enter event title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter event description (optional)"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter location (optional)"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="all-day"
                checked={formData.allDay}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allDay: checked }))}
              />
              <Label htmlFor="all-day">All day event</Label>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Start</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  {!formData.allDay && (
                    <div className="flex-1">
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>End</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                  {!formData.allDay && (
                    <div className="flex-1">
                      <Input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Event Scope */}
          <div className="space-y-3">
            <Label>Event Scope</Label>
            <div className="grid gap-2">
              {scopeOptions.map((option) => {
                const Icon = option.icon
                return (
                  <Card
                    key={option.value}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-muted/50",
                      formData.scope === option.value && "ring-2 ring-primary"
                    )}
                    onClick={() => handleScopeChange(option.value)}
                  >
                    <CardContent className="flex items-center gap-3 p-3">
                      <div className={`w-3 h-3 rounded-full bg-${option.color}-500`} />
                      <Icon className="h-4 w-4" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                      {formData.scope === option.value && (
                        <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Course Selection */}
            {formData.scope === 'course' && (
              <div className="space-y-2">
                <Label htmlFor="course">Select Course</Label>
                <Select value={formData.courseId} onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, courseId: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesData?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex items-center gap-2">
                          <span>{course.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {course.classCode}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <Label>Event Color</Label>
            <div className="flex gap-2">
              {(['EMERALD', 'VIOLET', 'SKY', 'AMBER', 'ROSE', 'ORANGE'] as EventColor[]).map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    `bg-${color}-500`,
                    formData.color === color
                      ? "border-foreground scale-110"
                      : "border-muted-foreground/30 hover:scale-105"
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createEventMutation.isPending || !formData.title.trim()}
            >
              {createEventMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Event
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}