// src/app/admin/database/_components/delete-record-dialog.tsx
"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface DeleteRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelName: string;
  displayName: string;
  recordId: string;
  recordTitle?: string;
  onSuccess: () => void;
}

export function DeleteRecordDialog({
  open,
  onOpenChange,
  modelName,
  displayName,
  recordId,
  recordTitle,
  onSuccess,
}: DeleteRecordDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = api.database.deleteRecord.useMutation({
    onSuccess: () => {
      toast.success(`Successfully deleted ${displayName}`);
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to delete ${displayName}: ${error.message}`);
    },
    onSettled: () => {
      setIsDeleting(false);
    },
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteMutation.mutateAsync({
      model: modelName as never,
      id: recordId,
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Delete {displayName}</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this {displayName.toLowerCase()}
            {recordTitle && (
              <>
                {" "}
                <span className="font-medium">&quot;{recordTitle}&quot;</span>
              </>
            )}
            ? This action cannot be undone and may affect related data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}