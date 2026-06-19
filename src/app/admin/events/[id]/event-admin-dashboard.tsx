// ~/app/(admin)/admin/events/[id]/event-admin-dashboard.tsx
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { api } from '~/trpc/react';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { PresenceStatus } from '@prisma/client';
import { Download, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export default function EventAdminDashboard({ eventId }: { eventId: string }) {
  const { data, refetch } = api.event.getEventManagementData.useQuery({ eventId });

  const { mutate: updatePresence, isPending: isUpdatingPresence } =
    api.event.updatePresenceStatus.useMutation({
      onSuccess: async () => {
        toast.success("Presence status updated");
        await refetch();
      },
      onError: (err) => toast.error(err.message)
    });

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data) return { totalRsvps: 0, yesRsvps: 0, totalPresence: 0, presentCount: 0 };

    const yesRsvps = data.rsvpResponses.filter(r => r.status === 'YES').length;
    const presentCount = data.presenceRecords.filter(p =>
      p.status === PresenceStatus.PRESENT || p.status === PresenceStatus.LATE
    ).length;

    return {
      totalRsvps: data.rsvpResponses.length,
      yesRsvps,
      totalPresence: data.presenceRecords.length,
      presentCount,
    };
  }, [data]);

  const handleExportRsvps = () => {
    if (!data) return;

    const csv = [
      ['Name', 'NIM', 'Status', 'Responded At'].join(','),
      ...data.rsvpResponses.map(r => [
        r.user?.name ?? 'N/A',
        r.user?.nim ?? 'N/A',
        r.status,
        format(new Date(r.respondedAt), 'yyyy-MM-dd HH:mm')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rsvps-${eventId}.csv`;
    a.click();
    toast.success('RSVPs exported successfully');
  };

  const handleExportAttendance = () => {
    if (!data) return;

    const csv = [
      ['Name', 'NIM', 'Status', 'Checked In At'].join(','),
      ...data.presenceRecords.map(p => [
        p.user.name,
        p.user.nim,
        p.status,
        p.checkedInAt ? format(new Date(p.checkedInAt), 'yyyy-MM-dd HH:mm') : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${eventId}.csv`;
    a.click();
    toast.success('Attendance exported successfully');
  };

  return (
    <>
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RSVPs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRsvps}</div>
            <p className="text-xs text-muted-foreground">
              {stats.yesRsvps} confirmed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.yesRsvps}</div>
            <p className="text-xs text-muted-foreground">
              Going to attend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-ins</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPresence}</div>
            <p className="text-xs text-muted-foreground">
              Total attendees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.presentCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.yesRsvps > 0 ? `${Math.round((stats.presentCount / stats.yesRsvps) * 100)}%` : '0%'} of confirmed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for RSVP and Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Event Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="attendance">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="attendance">
                Attendance ({data?.presenceRecords.length})
              </TabsTrigger>
              <TabsTrigger value="rsvps">
                RSVPs ({data?.rsvpResponses.length})
              </TabsTrigger>
            </TabsList>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportAttendance}
                  disabled={!data?.presenceRecords.length}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Attendance
                </Button>
              </div>

              {data?.presenceRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>NIM</TableHead>
                      <TableHead>Check-in Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.presenceRecords.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{p.user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{p.user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{p.user.nim}</TableCell>
                        <TableCell className="text-sm">
                          {p.checkedInAt ? format(new Date(p.checkedInAt), 'MMM d, HH:mm') : 'Not checked in'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            p.status === PresenceStatus.PRESENT ? 'default' :
                              p.status === PresenceStatus.LATE ? 'secondary' :
                                'outline'
                          }>
                            {p.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            onValueChange={(val) =>
                              updatePresence({
                                presenceId: p.id,
                                status: val as PresenceStatus
                              })
                            }
                            defaultValue={p.status}
                            disabled={isUpdatingPresence}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(PresenceStatus)
                                .filter(s => s !== 'PENDING_APPROVAL' && s !== 'REJECTED')
                                .map(s => (
                                  <SelectItem key={s} value={s}>
                                    {s.replace(/_/g, " ")}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* RSVPs Tab */}
            <TabsContent value="rsvps" className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportRsvps}
                  disabled={!data?.rsvpResponses.length}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export RSVPs
                </Button>
              </div>

              {data?.rsvpResponses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No RSVP responses yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>NIM</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead>Responded At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.rsvpResponses.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{r.user?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{r.user?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{r.user?.nim}</TableCell>
                        <TableCell>
                          <Badge variant={
                            r.status === 'YES' ? 'default' :
                              r.status === 'MAYBE' ? 'secondary' :
                                'outline'
                          }>
                            {r.status === 'YES' ? (
                              <><CheckCircle className="h-3 w-3 mr-1" /> Going</>
                            ) : r.status === 'MAYBE' ? (
                              <><Clock className="h-3 w-3 mr-1" /> Maybe</>
                            ) : (
                              <><XCircle className="h-3 w-3 mr-1" /> Can&apos;t Go</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(r.respondedAt), 'MMM d, yyyy • HH:mm')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
