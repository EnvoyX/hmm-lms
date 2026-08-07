// ~/components/admin/job-vacancy/admin-job-vacancy-header.tsx
"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { CreateJobVacancyDialog } from './create-loker-dialog';

export function AdminJobVacancyHeader() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Vacancies</h1>
          <p className="text-muted-foreground">
            Manage job vacancy listings for the community
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Job Vacancy
        </Button>
      </div>

      <CreateJobVacancyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}