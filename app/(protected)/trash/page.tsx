// app/(protected)/trash/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
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
import { formatDistanceToNow } from "@/lib/utils/format";
import { RotateCcw, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type TrashProject = {
  id: string;
  title: string;
  deleted_at: string;
};

export default function TrashPage() {
  const [projects, setProjects] = useState<TrashProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteForeverId, setDeleteForeverId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchTrash = async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, title, deleted_at")
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });

      setProjects(data ?? []);
      setLoading(false);
    };
    fetchTrash();
  }, [supabase]);

  const handleRestore = async (id: string) => {
    const { error } = await supabase
      .from("projects")
      .update({ deleted_at: null })
      .eq("id", id);

    if (error) {
      toast.error("Failed to restore project");
      return;
    }

    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast.success("Project restored");
  };

  const handleDeleteForever = async (id: string) => {
    // First delete associated scenes
    await supabase.from("scenes").delete().eq("project_id", id);
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      toast.error("Failed to permanently delete project");
      return;
    }

    setProjects((prev) => prev.filter((p) => p.id !== id));
    setDeleteForeverId(null);
    toast.success("Project permanently deleted");
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/projects")}
            title="Back to Projects"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Trash</h1>
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="Trash is empty"
          description="Deleted projects will appear here for 30 days before being permanently removed."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Card key={p.id} className="relative group">
              <CardHeader>
                <CardTitle className="text-lg">{p.title}</CardTitle>
                <CardDescription>
                  Deleted {formatDistanceToNow(p.deleted_at)}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(p.id)}
                  >
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Restore
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteForeverId(p.id)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete Forever
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Permanent delete confirmation */}
      <AlertDialog
        open={!!deleteForeverId}
        onOpenChange={() => setDeleteForeverId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Forever?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The project and all its scenes will
              be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteForeverId && handleDeleteForever(deleteForeverId)
              }
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
