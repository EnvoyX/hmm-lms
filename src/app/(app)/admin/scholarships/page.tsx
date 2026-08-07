"use client";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ScholarshipAdminPage() {
  const [scholarships] = api.scholarship.getAll.useSuspenseQuery();
  const utils = api.useUtils();
  const router = useRouter();

  const createMutation = api.scholarship.createDraft.useMutation({
    onSuccess: (data) => {
      router.push(`/admin/scholarships/${data.id}/edit`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = api.scholarship.delete.useMutation({
    onSuccess: () => {
      toast.success("Scholarship deleted successfully");
      void utils.scholarship.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreate = () => {
    createMutation.mutate();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this scholarship?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scholarships</h1>
          <p className="text-muted-foreground">
            Manage scholarships and opportunities for students.
          </p>
        </div>
        <Button onClick={handleCreate} disabled={createMutation.isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Create Scholarship
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scholarships.map((scholarship) => (
          <Card key={scholarship.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="line-clamp-1">
                    {scholarship.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-1">
                    {scholarship.provider}
                  </CardDescription>
                </div>
                <Badge variant={scholarship.type === "INTERNAL" ? "default" : "secondary"}>
                  {scholarship.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Deadline:</span>
                    <span className={new Date(scholarship.deadline) < new Date() ? "text-destructive" : ""}>
                      {format(new Date(scholarship.deadline), "PPP")}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/admin/scholarships/${scholarship.id}/edit`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(scholarship.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {scholarships.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No scholarships found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
