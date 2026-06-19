import ICAL from "ical.js"

export interface ParsedEvent {
  summary: string
  description?: string
  start: Date
  end: Date
  location?: string
  uid?: string
  allDay: boolean
}

export interface ParsedCalendar {
  events: ParsedEvent[]
  errors: string[]
}

export function parseICSFile(icsContent: string): ParsedCalendar {
  const result: ParsedCalendar = {
    events: [],
    errors: []
  }

  try {
    // Parse the ICS content
    const jcalData = ICAL.parse(icsContent) as string
    const comp = new ICAL.Component(jcalData)
    
    // Get all VEVENT components
    const vevents = comp.getAllSubcomponents("vevent")
    
    for (const vevent of vevents) {
      try {
        const event = new ICAL.Event(vevent)
        
        // Extract event properties
        const summary = event.summary ?? "Untitled Event"
        const description = event.description ?? undefined
        const location = event.location ?? undefined
        const uid = event.uid ?? undefined
        
        // Handle date/time
        let startDate: Date
        let endDate: Date
        let allDay = false
        
        if (event.startDate) {
          if (event.startDate.isDate) {
            // All-day event
            allDay = true
            startDate = event.startDate.toJSDate()
            endDate = event.endDate ? event.endDate.toJSDate() : startDate
          } else {
            // Timed event
            startDate = event.startDate.toJSDate()
            endDate = event.endDate ? event.endDate.toJSDate() : new Date(startDate.getTime() + 60 * 60 * 1000) // Default to 1 hour
          }
        } else {
          result.errors.push(`Event "${summary}" has no start date`)
          continue
        }
        
        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          result.errors.push(`Event "${summary}" has invalid dates`)
          continue
        }
        
        if (endDate <= startDate && !allDay) {
          result.errors.push(`Event "${summary}" has end time before start time`)
          continue
        }
        
        result.events.push({
          summary,
          description,
          start: startDate,
          end: endDate,
          location,
          uid,
          allDay
        })
        
      } catch (eventError) {
        result.errors.push(`Failed to parse event: ${eventError instanceof Error ? eventError.message : 'Unknown error'}`)
      }
    }
    
  } catch (parseError) {
    result.errors.push(`Failed to parse ICS file: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
  }
  
  return result
}

export function validateICSContent(content: string): { isValid: boolean; error?: string } {
  if (!content.trim()) {
    return { isValid: false, error: "File is empty" }
  }
  
  if (!content.includes("BEGIN:VCALENDAR") || !content.includes("END:VCALENDAR")) {
    return { isValid: false, error: "Not a valid ICS file format" }
  }
  
  try {
    ICAL.parse(content)
    return { isValid: true }
  } catch (error) {
    return { 
      isValid: false, 
      error: `Invalid ICS format: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

export function convertToCalendarEvents(parsedEvents: ParsedEvent[], scope: 'personal' | 'course' | 'global' = 'personal', courseId?: string) {
  return parsedEvents.map(event => ({
    title: event.summary,
    description: event.description ?? "",
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    location: event.location ?? undefined,
    scope,
    courseId: scope === 'course' ? courseId : undefined,
    color: 'sky' as const, // Default color for imported events
    eventMode: 'BASIC' as const,
    hasTimeline: false,
    timeline: null,
    rsvpDeadline: null,
    rsvpRequiresApproval: false,
    rsvpAllowMaybe: true,
    rsvpMaxAttendees: null,
    rsvpPublic: false,
    presenceCheckInRadius: null,
    presenceAutoCheckOut: true,
    presenceRequiresApproval: false,
    presenceAllowLateCheckIn: true,
    presenceCheckInBuffer: null
  }))
}

export async function downloadICSFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/calendar,application/calendar,text/plain',
        'User-Agent': 'Mozilla/5.0 (compatible; Calendar-Import/1.0)',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/calendar') && 
        !contentType.includes('application/calendar') && 
        !contentType.includes('text/plain')) {
      console.warn(`Unexpected content type: ${contentType}`)
    }
    
    return await response.text()
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to download calendar: ${error.message}`)
    }
    throw new Error('Failed to download calendar: Unknown error')
  }
}