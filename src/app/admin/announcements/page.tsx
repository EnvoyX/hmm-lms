import { api } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { AnnouncementCard } from './announcement-card';

export default async function AdminAnnouncementsPage() {
  const announcements = await api.announcement.getAll();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">
            Create and manage announcements for students
          </p>
        </div>
        <Link href="/admin/announcements/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {announcements.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No announcements yet. Create your first announcement to get started.
          </div>
        ) : (
          announcements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))
        )}
      </div>
    </div>
  );
}
