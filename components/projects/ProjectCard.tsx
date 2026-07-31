// components/projects/ProjectCard.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditTagsDialog } from "./EditTagsDialog";
import { formatDistanceToNow } from "@/lib/utils/format";
import {
  FileText,
  AlignLeft,
  MoreHorizontal,
  Pencil,
  Trash2,
  Tag,
} from "lucide-react";
import { useState } from "react";

interface ProjectCardProps {
  id: string;
  title: string;
  updatedAt: string;
  sceneCount?: number;
  wordCount?: number;
  genre?: string | null;
  tags?: string[];
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onUpdateTags: (id: string, tags: string[]) => void;
}

export function ProjectCard({
  id,
  title,
  updatedAt,
  sceneCount = 0,
  wordCount = 0,
  genre,
  tags = [],
  onRename,
  onDelete,
  onUpdateTags,
}: ProjectCardProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [editTagsOpen, setEditTagsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const handleNavigate = () => {
    router.push(`/project/${id}`);
  };

  const handleRename = () => {
    if (newTitle.trim() && newTitle !== title) {
      onRename(id, newTitle.trim());
    }
    setRenameOpen(false);
  };

  const handleSaveTags = async (newTags: string[]) => {
    onUpdateTags(id, newTags);
  };

  return (
    <>
      <Card
        className="hover:border-primary transition-colors cursor-pointer h-full relative group"
        onClick={handleNavigate}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{title}</CardTitle>
              {genre && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {genre}
                </Badge>
              )}
            </div>
            <div
              className="flex items-center ml-2 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewTitle(title);
                      setRenameOpen(true);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditTagsOpen(true);
                    }}
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    Edit Tags
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardDescription className="flex flex-col gap-1 mt-1">
            <span>Updated {formatDistanceToNow(updatedAt)}</span>
            <span className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {sceneCount} scene{sceneCount !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                <AlignLeft className="h-3 w-3" />
                {wordCount.toLocaleString()} word{wordCount !== 1 ? "s" : ""}
              </span>
            </span>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Rename dialog */}
      <AlertDialog open={renameOpen} onOpenChange={setRenameOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Project</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new title for this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
            }}
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                handleRename();
              }}
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{title}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
                setDeleteOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Tags dialog */}
      <EditTagsDialog
        open={editTagsOpen}
        onOpenChange={setEditTagsOpen}
        tags={tags}
        onSave={handleSaveTags}
      />
    </>
  );
}
