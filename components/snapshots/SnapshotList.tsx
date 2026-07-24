// components/snapshots/SnapshotList.tsx
"use client";

import { useSnapshots } from "@/hooks/useSnapshots";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SnapshotPreview } from "./SnapshotPreview";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { RotateCcw } from "lucide-react";
import type { Json } from "@/types/supabase";

interface SnapshotListProps {
  sceneId: string;
  onRestore: (content: Json) => void; // changed from object to Json
}

export function SnapshotList({ sceneId, onRestore }: SnapshotListProps) {
  const { snapshots, loading, deleteSnapshot } = useSnapshots(sceneId);

  if (loading)
    return (
      <div className="p-4 flex justify-center">
        <LoadingSpinner />
      </div>
    );

  if (snapshots.length === 0)
    return (
      <EmptyState
        title="No snapshots"
        description="Snapshots are created automatically before AI rewrites"
      />
    );

  return (
    <ScrollArea className="h-full p-2">
      <div className="space-y-2">
        {snapshots.map((s) => (
          <SnapshotPreview
            key={s.id}
            snapshot={s}
            onRestore={() => onRestore(s.content)}
            onDelete={() => deleteSnapshot(s.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
