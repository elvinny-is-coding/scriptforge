// components/scene-list/NewSceneButton.tsx
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NewSceneButtonProps {
  onClick: () => void;
}

export function NewSceneButton({ onClick }: NewSceneButtonProps) {
  return (
    <Button variant="outline" size="sm" className="w-full" onClick={onClick}>
      <Plus className="mr-1 h-3 w-3" /> New Scene
    </Button>
  );
}
