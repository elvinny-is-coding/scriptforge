// components/snapshots/SnapshotPreview.tsx
import { formatDistanceToNow } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trash2 } from "lucide-react";
import type { Json } from "@/types/supabase";

interface SnapshotPreviewProps {
  snapshot: {
    id: string;
    content: Json;
    created_at: string;
  };
  onRestore: () => void;
  onDelete: () => void;
}

export function SnapshotPreview({
  snapshot,
  onRestore,
  onDelete,
}: SnapshotPreviewProps) {
  let previewText = "";
  try {
    if (
      snapshot.content &&
      typeof snapshot.content === "object" &&
      "root" in snapshot.content
    ) {
      const json = snapshot.content as any;
      previewText =
        json.root?.children?.[0]?.children?.[0]?.text?.slice(0, 80) ||
        "Snapshot";
    }
  } catch {
    previewText = "Snapshot";
  }

  return (
    <div className="border rounded-md p-3 flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(snapshot.created_at)}
        </p>
        <p className="text-sm truncate">{previewText || "Empty"}</p>
      </div>
      <div className="flex gap-1 ml-2">
        <Button variant="ghost" size="icon" onClick={onRestore}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
