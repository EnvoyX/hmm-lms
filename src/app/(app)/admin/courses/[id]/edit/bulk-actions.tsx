// ~/app/admin/courses/[id]/bulk-actions.tsx
'use client';

// import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
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
} from '~/components/ui/alert-dialog';
import { UserMinus } from 'lucide-react';
import { api } from '~/trpc/react';
import { toast } from 'sonner';
import { type RouterOutputs } from '~/trpc/react';

type Course = RouterOutputs['course']['getCourseForAdmin'];

interface BulkActionsProps {
  course: Course;
  selectedMembers: string[];
  onSelectionChange: (memberIds: string[]) => void;
}

export default function BulkActions({
  course,
  selectedMembers,
  onSelectionChange
}: BulkActionsProps) {
  const utils = api.useUtils();

  const bulkRemoveMutation = api.course.bulkRemoveMembers.useMutation({
    onSuccess: async (data) => {
      toast.success(`Successfully removed ${data.removedCount} members`);
      onSelectionChange([]);
      await utils.course.getCourseForAdmin.invalidate({ id: course.id });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(course.members.map(member => member.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleBulkRemove = () => {
    bulkRemoveMutation.mutate({
      courseId: course.id,
      userIds: selectedMembers,
    });
  };

  if (course.members.length === 0) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="select-all"
          checked={selectedMembers.length === course.members.length}
          onCheckedChange={handleSelectAll}
        />
        <label htmlFor="select-all" className="text-sm font-medium">
          Select All ({course.members.length})
        </label>
      </div>

      {selectedMembers.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedMembers.length} selected
          </span>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <UserMinus className="h-4 w-4 mr-2" />
                Remove Selected
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Multiple Members</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove {selectedMembers.length} members from this course?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleBulkRemove}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Remove {selectedMembers.length} Members
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}