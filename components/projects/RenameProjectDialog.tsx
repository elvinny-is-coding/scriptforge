// components/projects/RenameProjectDialog.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RenameProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTitle: string;
  onRename: (newTitle: string) => Promise<void>;
}

export function RenameProjectDialog({
  open,
  onOpenChange,
  currentTitle,
  onRename,
}: RenameProjectDialogProps) {
  const [title, setTitle] = useState(currentTitle);
  const [loading, setLoading] = useState(false);

  const handleRename = async () => {
    if (!title.trim() || title === currentTitle) {
      onOpenChange(false);
      return;
    }
    setLoading(true);
    await onRename(title.trim());
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rename-title">Project Title</Label>
            <Input
              id="rename-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={loading || !title.trim()}>
            {loading ? "Saving..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
