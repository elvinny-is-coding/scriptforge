// components/scene-list/SceneList.tsx
"use client";

import { useRef, useState, useMemo } from "react";
import { SceneItem } from "./SceneItem";
import { NewSceneButton } from "./NewSceneButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { CharacterFilter } from "./CharacterFilter";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
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
  characters: string[];
  onOpenCharacterModal: () => void;
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
  characters,
  onOpenCharacterModal,
}: SceneListProps) {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [characterFilter, setCharacterFilter] = useState<string>("all");

  const filteredScenes = useMemo(() => {
    if (characterFilter === "all") return scenes;
    return scenes.filter((scene) => {
      const content = scene.content as any;
      const children = content?.root?.children;
      if (!children) return false;
      return children.some((child: any) => {
        if (child.type === "character") {
          const name = child.children?.[0]?.text?.trim().toUpperCase();
          return name === characterFilter.toUpperCase();
        }
        return false;
      });
    });
  }, [scenes, characterFilter]);

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
    <div className="flex flex-col h-full p-2 space-y-2">
      <NewSceneButton onClick={handleCreate} />
      <div className="flex items-end gap-1">
        <div className="flex-1">
          <CharacterFilter
            characters={characters}
            value={characterFilter}
            onChange={setCharacterFilter}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0 mb-1"
          onClick={onOpenCharacterModal}
          title="Character Colors & Dialogue"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </div>

      {filteredScenes.length === 0 ? (
        <EmptyState
          title="No matching scenes"
          description={
            characterFilter !== "all"
              ? `No scenes with ${characterFilter}`
              : "Create your first scene"
          }
        />
      ) : (
        filteredScenes.map((scene, index) => (
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
