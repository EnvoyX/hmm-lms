/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client"

import { useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  Upload,
  Link,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Calendar,
  Globe,
  User,
  GraduationCap,
  Download
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs"
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
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Separator } from "~/components/ui/separator"
import { useDropzone } from "react-dropzone"
import { cn } from "~/lib/utils"
import { parseICSFile, validateICSContent, downloadICSFromUrl, convertToCalendarEvents } from "~/lib/ics-parser"
import { api } from "~/trpc/react"
import { toast } from "sonner"
import type { ParsedEvent } from "~/lib/ics-parser"

interface IcsImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IcsImportDialog({ open, onOpenChange }: IcsImportDialogProps) {
  const { data: session } = useSession()
  const [importMethod, setImportMethod] = useState<"file" | "url">("file")
  const [icsUrl, setIcsUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [parsedEvents, setParsedEvents] = useState<ParsedEvent[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [selectedScope, setSelectedScope] = useState<'personal' | 'course' | 'global'>('personal')
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [step, setStep] = useState<'import' | 'preview' | 'complete'>('import')

  // Fetch user's courses for course scope selection
  const { data: coursesData } = api.course.getMyCourses.useQuery(undefined, {
    enabled: !!session && selectedScope === 'course'
  })

  const createEventsMutation = api.event.importEvents.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully imported ${data.imported} events`)
      if (data.failed > 0) {
        toast.warning(`${data.failed} events failed to import`)
      }
      setStep('complete')
    },
    onError: (error) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      toast.error(error.message ?? "Failed to import events")
    }
  })

  const resetState = () => {
    setParsedEvents([])
    setParseErrors([])
    setStep('import')
    setIcsUrl("")
    setSelectedScope('personal')
    setSelectedCourseId("")
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsLoading(true)
    try {
      const content = await file.text()
      const validation = validateICSContent(content)

      if (!validation.isValid) {
        toast.error(validation.error ?? "Invalid ICS file")
        return
      }

      const parsed = parseICSFile(content)
      setParsedEvents(parsed.events)
      setParseErrors(parsed.errors)

      if (parsed.events.length > 0) {
        setStep('preview')
        toast.success(`Found ${parsed.events.length} events`)
      } else {
        toast.error("No valid events found in the file")
      }
    } catch (error) {
      toast.error("Failed to read the file")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onDrop,
    accept: {
      'text/calendar': ['.ics'],
      'application/calendar': ['.ics'],
      'text/plain': ['.ics']
    },
    multiple: false,
    disabled: isLoading
  })

  const handleUrlImport = async () => {
    if (!icsUrl.trim()) {
      toast.error("Please enter a valid URL")
      return
    }

    setIsLoading(true)
    try {
      const content = await downloadICSFromUrl(icsUrl)
      const validation = validateICSContent(content)

      if (!validation.isValid) {
        toast.error(validation.error ?? "Invalid ICS content")
        return
      }

      const parsed = parseICSFile(content)
      setParsedEvents(parsed.events)
      setParseErrors(parsed.errors)

      if (parsed.events.length > 0) {
        setStep('preview')
        toast.success(`Found ${parsed.events.length} events`)
      } else {
        toast.error("No valid events found")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to import from URL")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async () => {
    if (parsedEvents.length === 0) return

    if (selectedScope === 'course' && !selectedCourseId) {
      toast.error("Please select a course")
      return
    }

    const events = convertToCalendarEvents(parsedEvents, selectedScope, selectedCourseId)

    setIsLoading(true)
    try {
      await createEventsMutation.mutateAsync({
        events,
        scope: selectedScope,
        courseId: selectedCourseId || undefined
      })
    } catch (error) {
      // Error handling is done in mutation
    } finally {
      setIsLoading(false)
    }
  }

  const canSelectGlobal = session?.user.role === 'ADMIN' || session?.user.role === 'SUPERADMIN'

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetState()
      onOpenChange(newOpen)
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Import Calendar Events
          </DialogTitle>
          <DialogDescription>
            Import events from ICS files or calendar URLs
          </DialogDescription>
        </DialogHeader>

        {step === 'import' && (
          <div className="space-y-6">
            <Tabs value={importMethod} onValueChange={(value) => setImportMethod(value as "file" | "url")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  File Upload
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  From URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="space-y-4">
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                    isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                    isLoading && "cursor-not-allowed opacity-50"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">
                        {isLoading
                          ? "Processing file..."
                          : isDragActive
                            ? "Drop the ICS file here"
                            : "Drag & drop an ICS file here, or click to select"
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports .ics calendar files
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="url" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ics-url">Calendar URL</Label>
                  <Input
                    id="ics-url"
                    placeholder="https://example.com/calendar.ics"
                    value={icsUrl}
                    onChange={(e) => setIcsUrl(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter a public calendar URL (Google Calendar, Outlook, etc.)
                  </p>
                </div>
                <Button
                  onClick={handleUrlImport}
                  disabled={!icsUrl.trim() || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Import from URL
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Import Preview</h3>

              {/* Scope Selection */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-base">Event Scope</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="personal"
                        name="scope"
                        value="personal"
                        checked={selectedScope === 'personal'}
                        onChange={(e) => setSelectedScope(e.target.value as 'personal')}
                      />
                      <Label htmlFor="personal" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Personal Calendar
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="course"
                        name="scope"
                        value="course"
                        checked={selectedScope === 'course'}
                        onChange={(e) => setSelectedScope(e.target.value as 'course')}
                      />
                      <Label htmlFor="course" className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Course Calendar
                      </Label>
                    </div>

                    {canSelectGlobal && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="global"
                          name="scope"
                          value="global"
                          checked={selectedScope === 'global'}
                          onChange={(e) => setSelectedScope(e.target.value as 'global')}
                        />
                        <Label htmlFor="global" className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Global Calendar
                        </Label>
                      </div>
                    )}
                  </div>

                  {selectedScope === 'course' && (
                    <div className="space-y-2">
                      <Label htmlFor="course-select">Select Course</Label>
                      <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {coursesData?.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title} ({course.classCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Events Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Events to Import</h4>
                <Badge variant="secondary">
                  {parsedEvents.length} event{parsedEvents.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="space-y-2 max-h-60 overflow-auto">
                {parsedEvents.map((event, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{event.summary}</p>
                        {event.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            {event.allDay
                              ? event.start.toLocaleDateString()
                              : `${event.start.toLocaleDateString()} ${event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            }
                          </span>
                          {event.location && (
                            <>
                              <span>•</span>
                              <span>{event.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {event.allDay && (
                        <Badge variant="outline" className="text-xs">
                          All Day
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Errors */}
            {parseErrors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Import Warnings:</p>
                    {parseErrors.map((error, index) => (
                      <p key={index} className="text-sm">• {error}</p>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('import')}>
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={
                  isLoading ||
                  parsedEvents.length === 0 ||
                  (selectedScope === 'course' && !selectedCourseId)
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    Import {parsedEvents.length} Event{parsedEvents.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-success mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Import Complete!</h3>
              <p className="text-muted-foreground">
                Your events have been successfully imported to the calendar.
              </p>
            </div>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}