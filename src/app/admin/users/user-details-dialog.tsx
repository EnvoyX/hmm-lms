"use client";

import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface UserDetailsDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserDetailsDialog({
  userId,
  open,
  onOpenChange,
}: UserDetailsDialogProps) {
  const { data: user, isLoading } = api.user.getById.useQuery(
    { id: userId },
    { enabled: open }
  );

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div>Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image ?? ""} />
              <AvatarFallback className="text-lg">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge>{user.role}</Badge>
                <Badge variant="outline" className="font-mono">
                  {user.nim}
                </Badge>
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faculty</p>
                <p>{user.faculty ?? "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Program</p>
                <p>{user.program ?? "Not specified"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Position</p>
                <p>{user.position ?? "Not specified"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{user._count.courses}</p>
                  <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{user._count.userAttempts}</p>
                  <p className="text-sm text-muted-foreground">Tryout Attempts</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{user._count.learningSessions}</p>
                  <p className="text-sm text-muted-foreground">Learning Sessions</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Enrolled Courses</CardTitle>
              </CardHeader>
              <CardContent>
                {user.courses.length === 0 ? (
                  <p className="text-muted-foreground">No courses enrolled</p>
                ) : (
                  <div className="space-y-2">
                    {user.courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex justify-between items-center p-2 border rounded"
                      >
                        <span className="font-medium">{course.title}</span>
                        <Badge variant="outline">{course.classCode}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Tryout Attempts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Tryout Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                {user.userAttempts.length === 0 ? (
                  <p className="text-muted-foreground">No tryout attempts</p>
                ) : (
                  <div className="space-y-2">
                    {user.userAttempts.slice(0, 5).map((attempt) => (
                      <div
                        key={attempt.id}
                        className="p-2 border rounded space-y-1"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{attempt.tryout.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {attempt.tryout.course.title}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={attempt.isCompleted ? "default" : "secondary"}>
                              {attempt.isCompleted
                                ? `${attempt.score}/${attempt.maxScore}`
                                : "In Progress"
                              }
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(attempt.startedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Learning Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Learning Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {user.learningSessions.length === 0 ? (
                <p className="text-muted-foreground">No learning sessions</p>
              ) : (
                <div className="space-y-2">
                  {user.learningSessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className="flex justify-between items-center p-2 border rounded"
                    >
                      <div>
                        <p className="font-medium">{session.course.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {session.duration} min
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}