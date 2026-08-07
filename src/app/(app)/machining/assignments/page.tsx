import { api } from "~/trpc/server";
import { AssignmentCard } from "./task-card";
import { Card } from "~/components/ui/card";

export default async function TasksPage() {
  const assignments = await api.machining.getAssignments();

  return (
    <div className="mx-auto w-full max-w-5xl">
      {assignments && assignments.length > 0 ? (
        <div className="space-y-5">
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            Belum ada tugas yang diberikan. Silakan periksa kembali nanti.
          </p>
        </Card>
      )}
    </div>
  );
}