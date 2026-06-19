// src/app/admin/database/_components/export-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelName: string;
  displayName: string;
}

export function ExportDialog({
  open,
  onOpenChange,
  modelName,
  displayName
}: ExportDialogProps) {
  const [includeRelations, setIncludeRelations] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const exportMutation = api.database.exportData.useMutation({
    onSuccess: (result) => {
      try {
        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(Array.isArray(result.data) ? result.data : []);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, displayName);

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${displayName}_export_${timestamp}.xlsx`;

        // Save file
        XLSX.writeFile(workbook, filename);

        toast.success(`Successfully exported ${result.count} ${displayName} records`);
        onOpenChange(false);
      } catch (error) {
        console.error("Export error:", error);
        toast.error("Failed to generate Excel file");
      }
    },
    onError: (error) => {
      toast.error(`Export failed: ${error.message}`);
    },
    onSettled: () => {
      setIsExporting(false);
    },
  });

  const handleExport = async () => {
    setIsExporting(true);
    await exportMutation.mutateAsync({
      model: modelName as never,
      filters: includeRelations ? undefined : {},
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5" />
            <span>Export {displayName}</span>
          </DialogTitle>
          <DialogDescription>
            Export {displayName} data to Excel format. The file will be downloaded automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-relations"
              checked={includeRelations}
              onCheckedChange={(checked) => setIncludeRelations(checked as boolean)}
            />
            <Label htmlFor="include-relations" className="text-sm">
              Include related data (may increase file size)
            </Label>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Export format: Excel (.xlsx)</p>
            <p>Maximum records: 10,000</p>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}