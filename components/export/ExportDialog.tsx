// components/export/ExportDialog.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  projectId: string;
}

type ExportFormat = "fountain" | "plaintext" | "pdf";

export function ExportDialog({
  open,
  onOpenChange,
  projectTitle,
  projectId,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("fountain");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, format }),
      });
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const extension =
        format === "fountain"
          ? "fountain"
          : format === "plaintext"
            ? "txt"
            : "pdf";
      a.download = `${projectTitle || "script"}.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      alert("Export failed. Check the console for details.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Script</DialogTitle>
          <DialogDescription>
            Choose a format to export your screenplay.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RadioGroup
            value={format}
            onValueChange={(v) => setFormat(v as ExportFormat)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="fountain" id="fmt-fountain" />
              <Label htmlFor="fmt-fountain" className="cursor-pointer">
                <span className="font-medium">Fountain</span> – Industry
                standard, can be imported by Final Draft, Fade In, etc.
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="plaintext" id="fmt-plaintext" />
              <Label htmlFor="fmt-plaintext" className="cursor-pointer">
                <span className="font-medium">Plain Text</span> – Simple text
                file, no formatting.
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="pdf" id="fmt-pdf" />
              <Label htmlFor="fmt-pdf" className="cursor-pointer">
                <span className="font-medium">PDF</span> – Formatted screenplay
                with title page and page numbers.
              </Label>
            </div>
          </RadioGroup>
          <Button
            onClick={handleExport}
            className="w-full"
            disabled={exporting}
          >
            {exporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
