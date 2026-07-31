// components/projects/EditTagsDialog.tsx
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

const SUGGESTED_TAGS = [
  "Draft",
  "Final",
  "Pilot",
  "Feature",
  "Short",
  "Comedy",
  "Drama",
  "Thriller",
  "Sci‑Fi",
  "Romance",
  "Action",
  "Adventure",
  "Horror",
  "Mystery",
];

interface EditTagsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: string[];
  onSave: (tags: string[]) => Promise<void>;
}

export function EditTagsDialog({
  open,
  onOpenChange,
  tags,
  onSave,
}: EditTagsDialogProps) {
  const [newTags, setNewTags] = useState<string[]>(tags);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setNewTags(tags);
      setTagInput("");
    }
  }, [open, tags]);

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !newTags.includes(trimmed)) {
      setNewTags([...newTags, trimmed]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setNewTags(newTags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(newTags);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Tags</DialogTitle>
          <DialogDescription>
            Add or remove tags for this project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Suggested tags */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Suggested tags
            </p>
            <div className="flex flex-wrap gap-1">
              {SUGGESTED_TAGS.filter((t) => !newTags.includes(t)).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleAddTag(tag)}
                >
                  {tag}
                  <Plus className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom tag input */}
          <div className="flex gap-2">
            <Input
              placeholder="Type a custom tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag(tagInput);
                }
              }}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleAddTag(tagInput)}
              disabled={!tagInput.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Current tags */}
          {newTags.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Your tags
              </p>
              <div className="flex flex-wrap gap-1">
                {newTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
