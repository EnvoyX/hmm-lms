// ~/app/admin/tryouts/_components/tryout-attempts.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { RouterOutputs } from "~/trpc/react";

type Attempt = RouterOutputs["tryout"]["getDetailedById"]["attempts"][number];

interface TryoutAttemptsProps {
  attempts: Attempt[];
}

export default function TryoutAttempts({ attempts }: TryoutAttemptsProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedAttempts = showAll ? attempts : attempts.slice(0, 10);

  if (attempts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No attempts yet</h3>
            <p className="text-muted-foreground">
              Student attempts will appear here once they start taking the tryout.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Attempts ({attempts.length})</CardTitle>
        {attempts.length > 10 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show Less" : "Show All"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedAttempts.map((attempt) => {
              const duration = attempt.endedAt
                ? Math.round((new Date(attempt.endedAt).getTime() - new Date(attempt.startedAt).getTime()) / (1000 * 60))
                : null;

              const scorePercentage = attempt.maxScore > 0
                ? Math.round((attempt.score / attempt.maxScore) * 100)
                : 0;

              return (
                <TableRow key={attempt.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {attempt.user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{attempt.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {attempt.user.nim}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={attempt.isCompleted ? "default" : "secondary"}
                      className="flex items-center gap-1 w-fit"
                    >
                      {attempt.isCompleted ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {attempt.isCompleted ? "Completed" : "In Progress"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {attempt.isCompleted ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{scorePercentage}%</span>
                        <span className="text-sm text-muted-foreground">
                          ({attempt.score}/{attempt.maxScore})
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(attempt.startedAt), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {duration ? (
                      <span className="text-sm">{duration}m</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/tryouts/attempts/${attempt.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}