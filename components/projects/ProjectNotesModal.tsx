// components/projects/ProjectNotesModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Json } from "@/types/supabase";

interface ProjectNotesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Json;
  onSave: (notes: Json) => Promise<void>;
}

export function ProjectNotesModal({
  open,
  onOpenChange,
  notes,
  onSave,
}: ProjectNotesModalProps) {
  const existing = notes as Record<string, string> | null;
  const [logline, setLogline] = useState(existing?.logline ?? "");
  const [premise, setPremise] = useState(existing?.premise ?? "");
  const [prodNotes, setProdNotes] = useState(existing?.prodNotes ?? "");
  const [saving, setSaving] = useState(false);

  // Reset state when modal opens with new notes
  useEffect(() => {
    const e = notes as Record<string, string> | null;
    setLogline(e?.logline ?? "");
    setPremise(e?.premise ?? "");
    setProdNotes(e?.prodNotes ?? "");
  }, [notes, open]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ logline, premise, prodNotes });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Project Notes</DialogTitle>
          <DialogDescription>
            Jot down your logline, premise, and any production notes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="logline">Logline</Label>
            <Textarea
              id="logline"
              placeholder="A one-sentence summary of your script..."
              value={logline}
              onChange={(e) => setLogline(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="premise">Premise</Label>
            <Textarea
              id="premise"
              placeholder="The core idea or theme..."
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prodNotes">Production Notes</Label>
            <Textarea
              id="prodNotes"
              placeholder="Ideas, research, casting notes..."
              value={prodNotes}
              onChange={(e) => setProdNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Notes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
