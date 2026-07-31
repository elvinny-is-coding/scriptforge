// components/projects/EditProjectDialog.tsx
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";

const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Film Noir",
  "Horror",
  "Musical",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "War",
  "Western",
];

interface EditProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  genre: string | null;
  tags: string[];
  onSave: (updates: {
    title?: string;
    genre?: string | null;
    tags?: string[];
  }) => Promise<void>;
}

export function EditProjectDialog({
  open,
  onOpenChange,
  title,
  genre,
  tags,
  onSave,
}: EditProjectDialogProps) {
  const [newTitle, setNewTitle] = useState(title);
  const [newGenre, setNewGenre] = useState<string | null>(genre);
  const [newTags, setNewTags] = useState<string[]>(tags);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  // Sync state with the latest props every time the dialog opens
  useEffect(() => {
    if (open) {
      setNewTitle(title);
      setNewGenre(genre);
      setNewTags(tags);
      setTagInput("");
    }
  }, [open, title, genre, tags]);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !newTags.includes(tag)) {
      setNewTags([...newTags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewTags(newTags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      title: newTitle.trim() || title,
      genre: newGenre || null,
      tags: newTags,
    });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update the title, genre, and tags for this project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-genre">Genre</Label>
            <Select
              value={newGenre ?? "none"}
              onValueChange={(v) => setNewGenre(v === "none" ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {GENRES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {newTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
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
            )}
          </div>
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
