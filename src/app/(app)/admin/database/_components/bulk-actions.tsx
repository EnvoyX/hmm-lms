// src/app/admin/database/_components/bulk-actions.tsx
"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import {
  ChevronDown,
  Trash2,
  Edit,
  Plus,
  AlertTriangle,
  Loader2
} from "lucide-react";
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
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area';

interface BulkActionsProps {
  selectedCount: number;
  modelName: string;
  selectedIds: string[];
  onSuccess: () => void;
}

export function BulkActions({
  selectedCount,
  modelName,
  selectedIds,
  onSuccess
}: BulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const bulkDeleteMutation = api.database.bulkDelete.useMutation({
    onSuccess: () => {
      toast.success(`Successfully deleted ${selectedCount} ${modelName} records`);
      onSuccess();
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast.error(`Failed to delete records: ${error.message}`);
    },
    onSettled: () => {
      setIsDeleting(false);
    },
  });

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    await bulkDeleteMutation.mutateAsync({
      model: modelName as never,
      ids: selectedIds,
    });
  };

  return (
    <>
      <ScrollArea className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border w-full">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {selectedCount} selected
          </Badge>
          <span className="text-sm text-muted-foreground">
            Bulk actions available
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Bulk Edit
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Update Fields
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Plus className="h-4 w-4 mr-2" />
                Duplicate Records
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
        <ScrollBar orientation='horizontal' />
      </ScrollArea>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>Confirm Bulk Delete</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} {modelName} records?
              This action cannot be undone and may affect related data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
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
                  Delete {selectedCount} Records
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}