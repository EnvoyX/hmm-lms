import type { EventColor as EventColorDB } from "@prisma/client"

export type CalendarView = "month" | "week" | "day" | "agenda"

export type EventScope = 'personal' | 'course' | 'global'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  allDay?: boolean
  color?: EventColor
  location?: string
  // Enhanced properties for scope and associations
  scope?: EventScope
  courseId?: string
  courseName?: string
  createdBy?: string
  rsvpCount?: number
  presenceCount?: number
}

export type EventColor = EventColorDB

// Color mapping for different scopes
export const SCOPE_COLORS: Record<EventScope, EventColor> = {
  personal: "EMERALD",
  course: "VIOLET", 
  global: "SKY"
}

// Helper function to get default color for scope
export function getDefaultColorForScope(scope?: EventScope): EventColor {
  if (!scope) return "AMBER"
  return SCOPE_COLORS[scope]
}