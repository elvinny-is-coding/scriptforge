// components/scene-list/SceneList.tsx
"use client";

import { useRef, useState } from "react";
import { useScenes } from "@/hooks/useScenes";
import { SceneItem } from "./SceneItem";
import { NewSceneButton } from "./NewSceneButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

import type { Database } from "@/types/supabase";

type Scene = Database["public"]["Tables"]["scenes"]["Row"];

interface SceneListProps {
  projectId: string;
  scenes: Scene[];
  loading: boolean;
  selectedSceneId: string | null;
  onSelectScene: (sceneId: string) => void;
  onRenameScene: (sceneId: string, heading: string) => void;
  onCreateScene: () => Promise<void>;
  onDeleteScene: (sceneId: string) => Promise<void>;
  onReorder: (orderedIds: string[]) => void;
}

export function SceneList({
  projectId,
  scenes,
  loading,
  selectedSceneId,
  onSelectScene,
  onRenameScene,
  onCreateScene,
  onDeleteScene,
  onReorder,
}: SceneListProps) {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleCreate = async () => {
    await onCreateScene();
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverItem.current = index;
  };

  const handleDrop = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newScenes = [...scenes];
    const [movedItem] = newScenes.splice(dragItem.current, 1);
    newScenes.splice(dragOverItem.current, 0, movedItem);
    const orderedIds = newScenes.map((s) => s.id);
    onReorder(orderedIds);
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggedIndex(null);
  };

  if (loading)
    return (
      <div className="p-4 flex justify-center">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="flex flex-col h-full p-2 space-y-1">
      <NewSceneButton onClick={handleCreate} />
      {scenes.length === 0 ? (
        <EmptyState
          title="No scenes yet"
          description="Create your first scene"
        />
      ) : (
        scenes.map((scene, index) => (
          <div
            key={scene.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            className={draggedIndex === index ? "opacity-50" : ""}
          >
            <SceneItem
              scene={scene}
              isSelected={scene.id === selectedSceneId}
              onClick={() => onSelectScene(scene.id)}
              onDelete={() => onDeleteScene(scene.id)}
              onRename={onRenameScene}
            />
          </div>
        ))
      )}
    </div>
  );
}
