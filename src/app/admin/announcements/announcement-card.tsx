"use client";

import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Edit, Trash2, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { RouterOutputs } from "~/trpc/react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

type Announcement = RouterOutputs["announcement"]["getAll"][number];

interface AnnouncementCardProps {
  announcement: Announcement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const router = useRouter();
  const deleteMutation = api.announcement.delete.useMutation({
    onSuccess: () => {
      toast.success("Announcement deleted successfully");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to delete announcement");
    },
  });

  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ id: announcement.id });
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={announcement.createdBy.image ?? ""} />
              <AvatarFallback>
                {announcement.createdBy.name?.charAt(0) ?? "A"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{announcement.createdBy.name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(announcement.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-2">{announcement.title}</h3>

          <div className="flex items-center gap-2 mb-3">
            <Badge variant={announcement.scope === "GLOBAL" ? "default" : "secondary"}>
              {announcement.scope}
            </Badge>
            {announcement.course && (
              <Badge variant="outline">{announcement.course.title}</Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span>{announcement._count.replies} replies</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/admin/announcements/${announcement.id}/edit`}>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  announcement and all its replies.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => void handleDelete()}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
}
