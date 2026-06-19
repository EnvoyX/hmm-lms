// ~/components/admin/job-vacancy/admin-job-vacancy-list.tsx
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { EditJobVacancyDialog } from './edit-dialog';
import type { JobVacancyWithCreator } from '~/lib/types/loker';

export function AdminJobVacancyList() {
  const [search, setSearch] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [editingJobVacancy, setEditingJobVacancy] = useState<JobVacancyWithCreator | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = api.loker.getAllAdmin.useInfiniteQuery(
    {
      limit: 20,
      search: search.trim() || undefined,
      includeInactive,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const toggleStatusMutation = api.loker.toggleStatus.useMutation({
    onSuccess: () => {
      toast.success("Job vacancy status updated");
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = api.loker.delete.useMutation({
    onSuccess: () => {
      toast.success("Job vacancy deleted");
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleToggleStatus = (id: string) => {
    toggleStatusMutation.mutate({ id });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this job vacancy?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleEditClick = (jobVacancy: JobVacancyWithCreator) => {
    setEditingJobVacancy(jobVacancy);
  };

  const handleEditClose = (open: boolean) => {
    if (!open) {
      setEditingJobVacancy(null);
    }
  };

  const handleEditSuccess = () => {
    setEditingJobVacancy(null);
    void refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load job vacancies. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const jobVacancies = data?.pages.flatMap((page) => page.jobVacancies) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search job vacancies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="include-inactive"
            checked={includeInactive}
            onCheckedChange={setIncludeInactive}
          />
          <label htmlFor="include-inactive" className="text-sm">
            Include inactive
          </label>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Specializations</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobVacancies.map((jobVacancy) => (
              <TableRow key={jobVacancy.id}>
                <TableCell className="font-medium">
                  {jobVacancy.title}
                </TableCell>
                <TableCell>{jobVacancy.company}</TableCell>
                <TableCell>{jobVacancy.position}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {jobVacancy.streams.slice(0, 2).map((stream) => (
                      <Badge key={stream} variant="outline" className="text-xs">
                        {stream}
                      </Badge>
                    ))}
                    {jobVacancy.streams.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{jobVacancy.streams.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={jobVacancy.isActive ? "default" : "secondary"}
                  >
                    {jobVacancy.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(jobVacancy.createdAt)} ago
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <a
                          href={`/loker/${jobVacancy.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleEditClick(jobVacancy)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a
                          href={jobVacancy.applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Apply Link
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(jobVacancy.id)}
                      >
                        {jobVacancy.isActive ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(jobVacancy.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {jobVacancies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No job vacancies found.</p>
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}

      {editingJobVacancy && (
        <EditJobVacancyDialog
          jobVacancy={editingJobVacancy}
          open={!!editingJobVacancy}
          onOpenChange={handleEditClose}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}