// components/scene-list/SceneItem.tsx
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface SceneItemProps {
  scene: {
    id: string;
    heading: string;
    order_index: number;
    status: string;
  };
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onRename: (sceneId: string, newHeading: string) => void;
  summary?: string | null;
}

export function SceneItem({
  scene,
  isSelected,
  onClick,
  onDelete,
  onRename,
  summary,
}: SceneItemProps) {
  const [editing, setEditing] = useState(false);
  const [tempHeading, setTempHeading] = useState(scene.heading);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleSubmit = () => {
    if (tempHeading.trim() && tempHeading !== scene.heading) {
      onRename(scene.id, tempHeading.trim());
    } else {
      setTempHeading(scene.heading); // reset
    }
    setEditing(false);
  };

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center justify-between p-2 rounded cursor-pointer text-sm ${
        isSelected ? "bg-accent" : "hover:bg-muted"
      }`}
    >
      <div className="truncate flex-1 min-w-0">
        <span className="text-xs text-muted-foreground mr-1">
          {scene.order_index + 1}.
        </span>
        {editing ? (
          <input
            ref={inputRef}
            value={tempHeading}
            onChange={(e) => setTempHeading(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") {
                setTempHeading(scene.heading);
                setEditing(false);
              }
            }}
            className="outline-none border-b bg-transparent w-40"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditing(true);
              setTempHeading(scene.heading);
            }}
            className={scene.status === "revised" ? "italic" : ""}
          >
            {scene.heading}
          </span>
        )}
      </div>

      {/* Summary tooltip */}
      {summary && (
        <div className="absolute top-full left-0 mt-1 hidden group-hover:block z-10 p-2 rounded-md bg-popover text-popover-foreground shadow-md text-xs max-w-xs">
          {summary}
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
