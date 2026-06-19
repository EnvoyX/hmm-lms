import { api } from "~/trpc/server";
import { AnnouncementCard } from "./annoucement-card";
import { Card } from "~/components/ui/card";

export default async function AnnouncementsPage() {
  const announcements = await api.announcement.getAll();

  return (
    <div className="mx-auto w-full max-w-5xl">
      {announcements && announcements.length > 0 ? (
        <div className="space-y-5">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            No announcements yet. Check back later for updates.
          </p>
        </Card>
      )}
    </div>
  );
}
